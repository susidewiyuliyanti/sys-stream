export async function onRequestPost(context:any){
  try {
    const body = await context.request.json();
    const wallet = String(body.wallet || "").trim().toLowerCase();

    if (!wallet) {
      return Response.json({ error: "Wallet required" }, { status: 400 });
    }

    // Production-safe schema repair: older D1 databases may not yet have
    // the wallet nonce table. Create it before issuing a nonce.
    await context.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS wallet_nonces (
        wallet TEXT PRIMARY KEY,
        nonce TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    const nonce = crypto.randomUUID();

    await context.env.DB.prepare(`
      INSERT INTO wallet_nonces(wallet, nonce, created_at)
      VALUES(?, ?, ?)
      ON CONFLICT(wallet) DO UPDATE SET
        nonce = excluded.nonce,
        created_at = excluded.created_at
    `)
      .bind(wallet, nonce, Date.now())
      .run();

    return Response.json({ nonce });
  } catch (error) {
    console.error("wallet nonce error:", error);
    return Response.json(
      { error: "Gagal membuat nonce wallet." },
      { status: 500 }
    );
  }
}
