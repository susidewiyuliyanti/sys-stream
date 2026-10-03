import { Env, json, readJson } from "../../_lib/db";
import { hashPassword } from "../../_lib/auth";
import {
  createVerificationToken,
  hashVerificationToken,
  sendVerificationEmail,
  verificationExpiry,
} from "../../_lib/email";

const TERMS_VERSION = "2026-10-01";
const PRODUCTION_ORIGIN = "https://sysstreamer.asia";

async function ensureRegistrationSchema(env: Env) {
  // The production D1 may contain an older users table. Repair only missing
  // columns so registration does not depend on a local migration having run.
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      email TEXT,
      password_hash TEXT,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      available_balance REAL NOT NULL DEFAULT 0,
      total_locked REAL NOT NULL DEFAULT 0,
      referral_code TEXT,
      created_at INTEGER,
      terms_version TEXT,
      terms_accepted_at INTEGER,
      email_verified INTEGER NOT NULL DEFAULT 0,
      email_verified_at INTEGER,
      referral_count INTEGER NOT NULL DEFAULT 0,
      wallet_address TEXT
    )`
  ).run();

  const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((columns.results || []).map((r:any) => String(r.name)));
  const additions: Array<[string,string]> = [
    ["username", "TEXT"],
    ["email", "TEXT"],
    ["password_hash", "TEXT"],
    ["display_name", "TEXT"],
    ["role", "TEXT NOT NULL DEFAULT 'USER'"],
    ["available_balance", "REAL NOT NULL DEFAULT 0"],
    ["total_locked", "REAL NOT NULL DEFAULT 0"],
    ["referral_code", "TEXT"],
    ["created_at", "INTEGER"],
    ["terms_version", "TEXT"],
    ["terms_accepted_at", "INTEGER"],
    ["email_verified", "INTEGER NOT NULL DEFAULT 0"],
    ["email_verified_at", "INTEGER"],
    ["referral_count", "INTEGER NOT NULL DEFAULT 0"],
    ["wallet_address", "TEXT"],
    ["referred_by", "TEXT"],
    ["locked_saldo", "REAL NOT NULL DEFAULT 0"],
    ["has_referral_bonus", "INTEGER NOT NULL DEFAULT 0"],
    ["avatar_url", "TEXT"],
    ["registration_bonus_idr", "REAL NOT NULL DEFAULT 0"],
    ["registration_bonus_granted", "INTEGER NOT NULL DEFAULT 0"],

    // Legacy production columns from the first SYS STREAM schema.
    ["cuid", "TEXT DEFAULT ''"],
    ["uid", "TEXT"],
    ["password", "TEXT"],
    ["photo_url", "TEXT DEFAULT ''"],
    ["streamer_handle", "TEXT"],
    ["bio", "TEXT"],
    ["balance", "REAL NOT NULL DEFAULT 0"],
    ["saldo", "REAL NOT NULL DEFAULT 0"],
    ["wallet_balance", "REAL NOT NULL DEFAULT 0"],
    ["affiliate_earnings", "REAL NOT NULL DEFAULT 0"],
    ["affiliate_withdrawn", "REAL NOT NULL DEFAULT 0"],
    ["is_subscribed", "INTEGER NOT NULL DEFAULT 0"],
    ["subscription_plan", "TEXT NOT NULL DEFAULT 'free'"],
    ["subscription_expires_at", "INTEGER"],
    ["is_lifetime", "INTEGER NOT NULL DEFAULT 0"],
    ["subscribed_at", "INTEGER"],
    ["is_blacklisted", "INTEGER NOT NULL DEFAULT 0"],
    ["is_banned", "INTEGER NOT NULL DEFAULT 0"],
    ["banned_reason", "TEXT"],
    ["force_jackpot_next", "INTEGER NOT NULL DEFAULT 0"],
    ["target_jackpot_nominal", "REAL"],
    ["last_saldo_modified_by", "TEXT"],
    ["last_saldo_modification_reason", "TEXT"],
    ["updated_at", "INTEGER"],
  ];
  // D1 can receive two registration requests at nearly the same time.
  // Both may observe the same missing column and race on ALTER TABLE. A
  // duplicate-column result is harmless because the other request already
  // repaired the schema, so never let that race abort registration.
  for (const [name, definition] of additions) {
    if (!names.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        const message = String(error);
        if (!/duplicate column name|already exists/i.test(message)) {
          console.error("registration users schema repair skipped", {
            column: name,
            error: message,
          });
        }
      }
    }
  }

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS terms_acceptances (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, terms_version TEXT NOT NULL,
    accepted_at INTEGER NOT NULL, created_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY, referrer_user_id TEXT NOT NULL,
    referred_user_id TEXT NOT NULL UNIQUE, referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', created_at INTEGER NOT NULL
  )`).run();

  // Repair auxiliary production tables created by older versions.
  const repairTable = async (table: string, additions: Array<[string,string]>) => {
    const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
    const existing = new Set((info.results || []).map((r:any) => String(r.name)));
    for (const [name, definition] of additions) {
      if (!existing.has(name)) {
        try {
          await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
        } catch (error) {
          console.error("registration schema repair skipped", { table, name, error: String(error) });
        }
      }
    }
  };

  await repairTable("email_verification_tokens", [
    ["id", "TEXT"], ["user_id", "TEXT"], ["token_hash", "TEXT"],
    ["expires_at", "INTEGER"], ["used_at", "INTEGER"], ["created_at", "INTEGER"],
  ]);
  await repairTable("terms_acceptances", [
    ["id", "TEXT"], ["user_id", "TEXT"], ["terms_version", "TEXT"],
    ["accepted_at", "INTEGER"], ["created_at", "INTEGER"],
  ]);
  await repairTable("referrals", [
    ["id", "TEXT"], ["referrer_user_id", "TEXT"], ["referred_user_id", "TEXT"],
    ["referral_code", "TEXT"], ["status", "TEXT"], ["created_at", "INTEGER"],
  ]);

  // Existing production databases may have older versions of these tables.
  // Indexes are helpful but must never block account registration.
  for (const sql of [
    "CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code)",
    "CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON terms_acceptances(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email)"
  ]) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.error("registration optional index skipped", { sql, error: String(error) });
    }
  }
}

function validEmail(value:string){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

async function insertIntoExistingSchema(env: Env, table: string, values: Record<string, any>) {
  const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all<any>();
  const columns = (info.results || []) as any[];
  const idMeta = columns.find((r:any) => String(r.name) === "id");
  const idType = String(idMeta?.type || "").toUpperCase();
  const integerPrimaryId =
    !!idMeta &&
    Number(idMeta.pk) === 1 &&
    !/CHAR|CLOB|TEXT|BLOB/.test(idType);

  const insertColumns: string[] = [];
  const insertValues: any[] = [];

  for (const column of columns) {
    const name = String(column.name);

    // Historical auxiliary tables sometimes used INTEGER PRIMARY KEY ids.
    // Let SQLite allocate those ids instead of binding a UUID into them.
    if (name === "id" && integerPrimaryId) continue;

    if (!Object.prototype.hasOwnProperty.call(values, name)) {
      const notNull = Number(column.notnull) === 1;
      const hasDefault =
        column.dflt_value !== null && column.dflt_value !== undefined;
      if (notNull && !hasDefault) {
        throw new Error(
          "UNSUPPORTED_" + table.toUpperCase() + "_REQUIRED_COLUMN:" + name
        );
      }
      continue;
    }

    insertColumns.push(name);
    insertValues.push(values[name]);
  }

  if (!insertColumns.length) {
    throw new Error("EMPTY_" + table.toUpperCase() + "_INSERT");
  }

  const placeholders = insertColumns.map(() => "?").join(",");
  await env.DB.prepare(
    `INSERT INTO ${table}(${insertColumns.join(",")}) VALUES(${placeholders})`
  ).bind(...insertValues).run();
}


export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const requestId = crypto.randomUUID();

  try {
    await ensureRegistrationSchema(env);

    const body = await readJson<{
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
      termsAccepted?: boolean;
      termsVersion?: string;
      referralCode?: string;
    }>(request);

    const suppliedUsername = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const incomingReferralCode = String(body.referralCode || "").trim();

    // Registration is email-first. Username is optional and generated server-side.
    if (!validEmail(email)) {
      return json({ success: false, error: "Email tidak valid." }, 400);
    }
    if (password.length < 6) {
      return json({ success: false, error: "Password minimal 6 karakter." }, 400);
    }
    if (
      body.termsAccepted !== true ||
      String(body.termsVersion || "") !== TERMS_VERSION
    ) {
      return json({
        success: false,
        error: "Anda harus menyetujui Terms & Conditions versi terbaru sebelum membuat akun.",
      }, 400);
    }

    const emailExists = await env.DB.prepare(
      "SELECT id FROM users WHERE lower(email)=lower(?) LIMIT 1"
    ).bind(email).first();

    if (emailExists) {
      return json({ success: false, error: "Email sudah terdaftar." }, 409);
    }

    let id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    const emailLocalPart = email.split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 20) || "user";

    let username = suppliedUsername || emailLocalPart;
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) username = "user";
    const usernameTaken = await env.DB.prepare(
      "SELECT id FROM users WHERE lower(username)=lower(?) LIMIT 1"
    ).bind(username).first();
    if (usernameTaken) username = username.slice(0, 24) + "_" + crypto.randomUUID().slice(0, 6);

    const displayName = String(body.displayName || username).trim() || username;
    const userReferralCode =
      "SYS-" + username.toUpperCase().slice(0, 12) + "-" +
      crypto.randomUUID().slice(0, 6).toUpperCase();
    const acceptedAt = Math.floor(Date.now() / 1000);

    // Build the INSERT from the actual production schema. This keeps registration
    // compatible with both the current UUID schema and the original integer-ID
    // schema, without assuming every historical column exists.
    const userSchema = await env.DB.prepare("PRAGMA table_info(users)").all<any>();
    const userColumns = (userSchema.results || []) as any[];
    const idMeta = userColumns.find((r:any) => String(r.name) === "id");
    const idType = String(idMeta?.type || "").toUpperCase();
    const legacyIntegerId = !!idMeta && Number(idMeta.pk) === 1 && !/CHAR|CLOB|TEXT|BLOB/.test(idType);

    const values: Record<string, any> = {
      id,
      username,
      email,
      password_hash: passwordHash,
      password: passwordHash,
      display_name: displayName,
      photo_url: "",
      role: "USER",
      available_balance: 0,
      balance: 0,
      saldo: 0,
      wallet_balance: 0,
      total_locked: 0,
      locked_saldo: 0,
      referral_code: userReferralCode,
      referred_by: incomingReferralCode || null,
      created_at: acceptedAt,
      updated_at: acceptedAt,
      terms_version: TERMS_VERSION,
      terms_accepted_at: acceptedAt,
      email_verified: 0,
      email_verified_at: null,
      referral_count: 0,
      wallet_address: null,
      has_referral_bonus: 0,
      avatar_url: null,
      registration_bonus_idr: 15000,
      registration_bonus_granted: 1,
      cuid: crypto.randomUUID(),
      uid: crypto.randomUUID(),
      streamer_handle: null,
      bio: null,
      affiliate_earnings: 0,
      affiliate_withdrawn: 0,
      is_subscribed: 0,
      subscription_plan: "free",
      subscription_expires_at: null,
      is_lifetime: 0,
      subscribed_at: null,
      is_blacklisted: 0,
      is_banned: 0,
      banned_reason: null,
      force_jackpot_next: 0,
      target_jackpot_nominal: null,
      last_saldo_modified_by: null,
      last_saldo_modification_reason: null,
    };

    const insertColumns: string[] = [];
    const insertValues: any[] = [];
    for (const column of userColumns) {
      const name = String(column.name);
      if (name === "id" && legacyIntegerId) continue;
      if (!Object.prototype.hasOwnProperty.call(values, name)) {
        const notNull = Number(column.notnull) === 1;
        const hasDefault = column.dflt_value !== null && column.dflt_value !== undefined;
        if (notNull && !hasDefault) {
          throw new Error("UNSUPPORTED_USERS_SCHEMA_REQUIRED_COLUMN:" + name);
        }
        continue;
      }
      insertColumns.push(name);
      insertValues.push(values[name]);
    }

    if (!insertColumns.includes("email") || !insertColumns.includes("username")) {
      throw new Error("USERS_SCHEMA_MISSING_REQUIRED_ACCOUNT_COLUMNS");
    }

    const placeholders = insertColumns.map(() => "?").join(",");
    await env.DB.prepare(
      \`INSERT INTO users(\${insertColumns.join(",")}) VALUES(\${placeholders})\`
    ).bind(...insertValues).run();

    if (legacyIntegerId) {
      const created = await env.DB.prepare(
        "SELECT id FROM users WHERE lower(email)=lower(?) LIMIT 1"
      ).bind(email).first<any>();
      if (!created || created.id === undefined || created.id === null) {
        throw new Error("LEGACY_USER_ID_NOT_FOUND_AFTER_INSERT");
      }
      id = String(created.id);
    }

    // Terms acceptance is required by the API contract. If the auxiliary
    // audit record fails, keep the account and report a trackable server error.
    try {
      await insertIntoExistingSchema(env, "terms_acceptances", {
        id: crypto.randomUUID(),
        user_id: id,
        terms_version: TERMS_VERSION,
        accepted_at: acceptedAt,
        created_at: acceptedAt,
      });
    } catch (error) {
      console.error("register terms acceptance write failed", {
        requestId,
        userId: id,
        error: String(error),
      });
    }

    const verificationToken = createVerificationToken();
    const verificationHash = await hashVerificationToken(verificationToken);
    const verificationExpires = verificationExpiry();

    try {
      await env.DB.prepare(
        `INSERT INTO email_verification_tokens(
          id,user_id,token_hash,expires_at,used_at,created_at
        ) VALUES(?,?,?,?,NULL,?)`
      ).bind(
        crypto.randomUUID(),
        id,
        verificationHash,
        verificationExpires,
        acceptedAt
      ).run();
    } catch (error) {
      // Production D1 can contain an older verification-token row for the
      // same user. Remove only that user's unused tokens and retry once so
      // a stale token/constraint cannot turn a valid registration into 500.
      console.error("register verification token first write failed", {
        requestId,
        userId: id,
        error: String(error),
      });

      try {
        await env.DB.prepare(
          `DELETE FROM email_verification_tokens
           WHERE user_id = ? AND used_at IS NULL`
        ).bind(id).run();

        await insertIntoExistingSchema(env, "email_verification_tokens", {
          id: crypto.randomUUID(),
          user_id: id,
          token_hash: verificationHash,
          expires_at: verificationExpires,
          used_at: null,
          created_at: acceptedAt,
        });
      } catch (retryError) {
        console.error("register verification token retry failed", {
          requestId,
          userId: id,
          error: String(retryError),
        });

        return json({
          success: false,
          code: "REGISTRATION_VERIFICATION_STORAGE_ERROR",
          requestId,
          error: "Akun belum dapat menyelesaikan verifikasi email. Silakan coba registrasi kembali.",
        }, 500);
      }
    }

    // Referral is optional. A referral failure must never prevent the new
    // user account from being created.
    if (incomingReferralCode) {
      try {
        const referrer = await env.DB.prepare(
          "SELECT id, referral_code FROM users WHERE upper(referral_code)=upper(?) LIMIT 1"
        ).bind(incomingReferralCode).first<any>();

        if (referrer && String(referrer.id) !== id) {
          await env.DB.prepare(
            `INSERT INTO referrals(
              id,referrer_user_id,referred_user_id,referral_code,status,created_at
            ) VALUES(?,?,?,?, 'ACTIVE', ?)`
          ).bind(
            crypto.randomUUID(),
            String(referrer.id),
            id,
            String(referrer.referral_code),
            acceptedAt
          ).run();

          await env.DB.prepare(
            "UPDATE users SET referral_count = referral_count + 1 WHERE id = ?"
          ).bind(String(referrer.id)).run();
        }
      } catch (error) {
        console.error("register referral write failed", {
          requestId,
          userId: id,
          error: String(error),
        });
      }
    }

    const origin = PRODUCTION_ORIGIN;
    let sent: Awaited<ReturnType<typeof sendVerificationEmail>>;
    try {
      sent = await sendVerificationEmail(
        env,
        email,
        verificationToken,
        origin
      );
    } catch (error) {
      console.error("registration verification email threw", {
        requestId,
        userId: id,
        error: String(error),
      });
      sent = { ok: false, error: "Email provider request failed." };
    }

    if (!sent.ok) {
      console.error("registration verification email failed", {
        requestId,
        userId: id,
        error: sent.error,
      });

      return json({
        success: true,
        code: "EMAIL_SERVICE_UNAVAILABLE",
        requiresEmailVerification: true,
        email,
        requestId,
        message:
          "Akun berhasil dibuat, tetapi email verifikasi belum dapat dikirim. Gunakan Kirim Ulang Verifikasi setelah layanan email aktif.",
      });
    }

    return json({
      success: true,
      requiresEmailVerification: true,
      email,
      requestId,
      registrationBonusIdr: 15000,
      registrationBonusUsdt: 0.8363,
      message: "Akun dibuat. Bonus registrasi Rp15.000 tersedia untuk di-claim satu kali setelah login. Silakan verifikasi email sebelum login.",
    });
  } catch (error) {
    console.error("register error", {
      requestId,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Do not expose SQL/schema/provider details to the browser.
    return json({
      success: false,
      code: "REGISTRATION_SERVER_ERROR",
      requestId,
      error: "Registrasi gagal di server. Gunakan kode referensi tersebut jika perlu pemeriksaan log.",
    }, 500);
  }
}

