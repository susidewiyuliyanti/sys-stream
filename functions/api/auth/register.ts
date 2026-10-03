import { Env, json, readJson } from "../../_lib/db";
import { getAddress, isAddress } from "ethers";
import { hashPassword, createSession } from "../../_lib/auth";

const TERMS_VERSION = "2026-10-01";
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
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_verification_tokens_v2 (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY, referrer_user_id TEXT NOT NULL,
    referred_user_id TEXT NOT NULL UNIQUE, referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', created_at INTEGER NOT NULL
  )`).run();

  // Registration returns a ready-to-use authenticated session. Some production
  // D1 databases were created before auth_sessions was introduced, so the
  // registration endpoint must repair this dependency itself instead of
  // creating the user first and failing only when the session is written.
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`).run();
  for (const sql of [
    "CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at)"
  ]) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.error("registration auth session index skipped", { sql, error: String(error) });
    }
  }

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
    "CREATE INDEX IF NOT EXISTS idx_email_verification_v2_user ON email_verification_tokens_v2(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wallet_unique ON users(wallet_address)"
  ]) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.error("registration optional index skipped", { sql, error: String(error) });
    }
  }
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isUniqueConstraintError(error: unknown): boolean {
  return /UNIQUE constraint failed|constraint failed.*UNIQUE|already exists/i.test(errorText(error));
}

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
      password?: string;
      displayName?: string;
      termsAccepted?: boolean;
      termsVersion?: string;
      referralCode?: string;
      walletAddress?: string;
    }>(request);

    const suppliedUsername = String(body.username || "").trim();
    const password = String(body.password || "");
    const incomingReferralCode = String(body.referralCode || "").trim();
    const incomingWalletAddress = String(body.walletAddress || "").trim();

    // Registration is wallet-first. Email is not collected or required.
    if (password.length < 6) {
      return json({ success: false, error: "Password minimal 6 karakter." }, 400);
    }
    if (!incomingWalletAddress || !isAddress(incomingWalletAddress)) {
      return json({ success: false, error: "Wallet wajib dihubungkan untuk membuat akun." }, 400);
    }
    const walletAddress = getAddress(incomingWalletAddress);
    if (
      body.termsAccepted !== true ||
      String(body.termsVersion || "") !== TERMS_VERSION
    ) {
      return json({
        success: false,
        error: "Anda harus menyetujui Terms & Conditions versi terbaru sebelum membuat akun.",
      }, 400);
    }

    if (walletAddress) {
      const walletExists = await env.DB.prepare(
        "SELECT id FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1"
      ).bind(walletAddress).first();
      if (walletExists) {
        return json({ success: false, error: "Wallet tersebut sudah terhubung ke akun lain." }, 409);
      }
    }

    // Use a UUID for the current TEXT/UUID schema. Legacy integer-ID schemas
    // are resolved to their database-generated id immediately after insert.
    let id: string = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    let username = suppliedUsername || "user_" + walletAddress.slice(2, 10).toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) username = "user_" + crypto.randomUUID().slice(0, 8);
    const usernameTaken = await env.DB.prepare(
      "SELECT id FROM users WHERE lower(username)=lower(?) LIMIT 1"
    ).bind(username).first();
    if (usernameTaken) username = username.slice(0, 24) + "_" + crypto.randomUUID().slice(0, 6);

    const displayName = String(body.displayName || username).trim() || username;
    const userReferralCode = walletAddress
      ? "SYS-" + walletAddress.slice(2, 10).toUpperCase()
      : "SYS-" + username.toUpperCase().slice(0, 12) + "-" +
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
      // Legacy column only; email is never collected or used.
      email: null,
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
      wallet_address: walletAddress,
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

    if (!insertColumns.includes("username")) {
      throw new Error("USERS_SCHEMA_MISSING_REQUIRED_ACCOUNT_COLUMNS");
    }

    const placeholders = insertColumns.map(() => "?").join(",");
    try {
      await env.DB.prepare(
        `INSERT INTO users(${insertColumns.join(",")}) VALUES(${placeholders})`
      ).bind(...insertValues).run();
    } catch (error) {
      // A concurrent registration can pass the pre-check and then collide on
      // a production UNIQUE constraint. Return a normal conflict instead of
      // exposing it as a generic 500 server error.
      if (isUniqueConstraintError(error)) {
        const existingByUsername = await env.DB.prepare(
          "SELECT id FROM users WHERE lower(username)=lower(?) LIMIT 1"
        ).bind(username).first();
        if (existingByUsername) {
          return json({ success: false, error: "Username sudah digunakan." }, 409);
        }
        const existingByWallet = await env.DB.prepare(
          "SELECT id FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1"
        ).bind(walletAddress).first();
        if (existingByWallet) {
          return json({ success: false, error: "Wallet tersebut sudah terhubung ke akun lain." }, 409);
        }
      }

      console.error("register users insert failed", {
        requestId,
        walletAddress,
        error: errorText(error),
      });
      return json({
        success: false,
        code: "REGISTRATION_DATABASE_ERROR",
        requestId,
        error: "Registrasi tidak dapat menyimpan akun ke database. Silakan coba lagi.",
      }, 503);
    }

    if (legacyIntegerId) {
      const created = await env.DB.prepare(
        "SELECT id FROM users WHERE lower(wallet_address)=lower(?) LIMIT 1"
      ).bind(walletAddress).first<any>();
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

    // Referral is optional. A referral failure must never prevent the new
    // user account from being created.
    if (incomingReferralCode) {
      try {
        const referrer = await env.DB.prepare(
          `SELECT id, referral_code, wallet_address
           FROM users
           WHERE upper(referral_code)=upper(?)
              OR lower(wallet_address)=lower(?)
           LIMIT 1`
        ).bind(incomingReferralCode, incomingReferralCode).first<any>();

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

    const token = await createSession(env, id);
    return json({
      success: true,
      token,
      user: {
        id: String(id),
        username,
        displayName,
        role: "USER",
        balance: 0,
        lockedBalance: 0,
        walletAddress,
        referralCode: userReferralCode,
        emailVerified: true,
        registrationBonusIdr: 15000,
        registrationBonusGranted: true,
      },
      registrationBonusIdr: 15000,
      registrationBonusUsdt: 0.8363,
      message: "Akun berhasil dibuat dan langsung login. Tidak diperlukan email.",
    });
  } catch (error) {
    console.error("register error", {
      requestId,
      error: errorText(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Keep production diagnostics in Cloudflare logs while returning a stable
    // response to the client. This is deliberately not a dummy/fallback path.
    const message = errorText(error);
    if (/D1|database|SQLITE|table|column|schema|constraint/i.test(message)) {
      return json({
        success: false,
        code: "REGISTRATION_DATABASE_ERROR",
        requestId,
        error: "Registrasi tidak dapat diproses oleh database. Silakan coba lagi.",
      }, 503);
    }

    return json({
      success: false,
      code: "REGISTRATION_SERVER_ERROR",
      requestId,
      error: "Registrasi gagal diproses di server. Silakan coba lagi.",
    }, 503);
  }
}

