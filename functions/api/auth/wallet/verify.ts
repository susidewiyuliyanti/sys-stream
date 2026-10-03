import { verifyMessage } from "ethers";
import { createAuthCookie } from "../../../_lib/auth";

export async function onRequestPost(context:any){
  try {
    await context.env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT, email TEXT, password_hash TEXT,
      display_name TEXT, role TEXT NOT NULL DEFAULT 'USER',
      available_balance REAL NOT NULL DEFAULT 0, total_locked REAL NOT NULL DEFAULT 0,
      referral_code TEXT, created_at INTEGER, terms_version TEXT,
      terms_accepted_at INTEGER, email_verified INTEGER NOT NULL DEFAULT 0,
      email_verified_at INTEGER, referral_count INTEGER NOT NULL DEFAULT 0,
      wallet_address TEXT, avatar_url TEXT
    )`).run();
    const cols = await context.env.DB.prepare("PRAGMA table_info(users)").all();
    const names = new Set((cols.results || []).map((r:any) => String(r.name)));
    if (!names.has("username")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN username TEXT").run();
    if (!names.has("display_name")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN display_name TEXT").run();
    if (!names.has("referral_code")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN referral_code TEXT").run();
    if (!names.has("email_verified")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0").run();
    if (!names.has("referral_count")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN referral_count INTEGER NOT NULL DEFAULT 0").run();
    if (!names.has("avatar_url")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
    if (!names.has("registration_bonus_idr")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN registration_bonus_idr REAL NOT NULL DEFAULT 0").run();
    if (!names.has("registration_bonus_granted")) await context.env.DB.prepare("ALTER TABLE users ADD COLUMN registration_bonus_granted INTEGER NOT NULL DEFAULT 0").run();
    const body = await context.request.json();

    const wallet = String(body.wallet || "").trim().toLowerCase();
    const signature = String(body.signature || "").trim();
    const message = String(body.message || "");

    if (!wallet || !signature || !message) {
      return Response.json({ error: "Missing wallet data" }, { status: 400 });
    }

    const nonceRow:any = await context.env.DB.prepare(
      "SELECT nonce FROM wallet_nonces WHERE wallet = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(wallet).first();

    if (!nonceRow?.nonce) {
      return Response.json(
        { error: "Wallet nonce tidak ditemukan atau sudah digunakan. Silakan coba lagi." },
        { status: 401 }
      );
    }

    const expectedMessage = "SYS STREAMER LOGIN\n\nNonce:" + String(nonceRow.nonce);
    const receivedMessage = message;

    // Accept the exact current message and the legacy escaped-newline form.
    const legacyMessage = receivedMessage.replace(/\\n/g, "\n");
    const messageToVerify =
      receivedMessage === expectedMessage
        ? receivedMessage
        : legacyMessage === expectedMessage
          ? legacyMessage
          : "";

    if (!messageToVerify) {
      return Response.json({ error: "Invalid wallet message" }, { status: 401 });
    }

    let recovered:string;
    try {
      recovered = verifyMessage(messageToVerify, signature);
    } catch (error) {
      console.error("wallet signature recovery error:", error);
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (recovered.toLowerCase() !== wallet) {
      return Response.json({ error: "Wallet mismatch" }, { status: 401 });
    }

    let user:any = await context.env.DB.prepare(`
      SELECT *
      FROM users
      WHERE wallet_address = ?
      LIMIT 1
    `).bind(wallet).first();

    if (!user) {
      const id = crypto.randomUUID();
      const username = "WEB3_" + wallet.slice(2, 8).toUpperCase();
      const referralCode = "SYS-" + username + "-" + crypto.randomUUID().slice(0, 6).toUpperCase();

      await context.env.DB.prepare(`
        INSERT INTO users(
          id, wallet_address, username, display_name, referral_code, role,
          email_verified, created_at, available_balance, registration_bonus_idr, registration_bonus_granted
        )
        VALUES(?,?,?,?,?,'USER',1,?, 0, 15000, 1)
      `).bind(id, wallet, username, username, referralCode, Date.now()).run();

      user = await context.env.DB.prepare(`
        SELECT *
        FROM users
        WHERE wallet_address = ?
        LIMIT 1
      `).bind(wallet).first();
    }

    await context.env.DB.prepare(
      "UPDATE users SET email_verified = 1, username = COALESCE(NULLIF(username,''), ?), display_name = COALESCE(NULLIF(display_name,''), ?), referral_code = COALESCE(NULLIF(referral_code,''), ?) WHERE id = ?"
    ).bind("WEB3_" + wallet.slice(2, 8).toUpperCase(), "WEB3_" + wallet.slice(2, 8).toUpperCase(), "SYS-WEB3-" + crypto.randomUUID().slice(0, 8).toUpperCase(), String(user.id)).run();
    user = await context.env.DB.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(String(user.id)).first();

    // A nonce is single-use. Delete it only after the signature has been
    // cryptographically verified and the wallet matches.
    await context.env.DB.prepare(
      "DELETE FROM wallet_nonces WHERE wallet = ?"
    ).bind(wallet).run();

    const token = crypto.randomUUID();

    await context.env.DB.prepare(`
      INSERT INTO auth_sessions(token, user_id, expires_at)
      VALUES(?,?,?)
    `).bind(token, user.id, Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30).run();

    return new Response(JSON.stringify({ token, user }), { headers: { "Content-Type": "application/json", "Set-Cookie": createAuthCookie(token) } });
  } catch (error) {
    console.error("wallet verify error:", error);
    return Response.json(
      { error: "Wallet login gagal diproses." },
      { status: 500 }
    );
  }
}
