import { verifyMessage } from "ethers";

export async function onRequestPost(context:any){
  try {
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

    const expectedMessage = "SYS STREAMER LOGIN\\n\\nNonce:" + String(nonceRow.nonce);
    const receivedMessage = message;

    // Accept the exact current message and the legacy escaped-newline form.
    const legacyMessage = receivedMessage.replace(/\\\\n/g, "\\n");
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

      await context.env.DB.prepare(`
        INSERT INTO users(id, wallet_address, role)
        VALUES(?,?,?)
      `).bind(id, wallet, "USER").run();

      user = await context.env.DB.prepare(`
        SELECT *
        FROM users
        WHERE wallet_address = ?
        LIMIT 1
      `).bind(wallet).first();
    }

    // A nonce is single-use. Delete it only after the signature has been
    // cryptographically verified and the wallet matches.
    await context.env.DB.prepare(
      "DELETE FROM wallet_nonces WHERE wallet = ?"
    ).bind(wallet).run();

    const token = crypto.randomUUID();

    await context.env.DB.prepare(`
      INSERT INTO auth_sessions(token, user_id, expires_at)
      VALUES(?,?,?)
    `).bind(token, user.id, Date.now() + 86400000).run();

    return Response.json({ token, user });
  } catch (error) {
    console.error("wallet verify error:", error);
    return Response.json(
      { error: "Wallet login gagal diproses." },
      { status: 500 }
    );
  }
}
