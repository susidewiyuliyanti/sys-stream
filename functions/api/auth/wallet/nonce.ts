export async function onRequestPost(context:any){
  try {
    const body = await context.request.json();
    const wallet = String(body.wallet || "").trim().toLowerCase();

    if (!wallet) {
      return Response.json({ error: "Wallet required" }, { status: 400 });
    }

    // Self-heal the nonce table for both the old migration schema
    // (numeric id primary key) and the newer wallet-primary-key schema.
    await context.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS wallet_nonces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet TEXT NOT NULL,
        nonce TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();

    const nonce = crypto.randomUUID();

    // Do not rely on ON CONFLICT(wallet): older production databases have
    // wallet_nonces.wallet without a UNIQUE constraint. Replacing the
    // existing wallet nonce explicitly works with both schemas.
    await context.env.DB.prepare(
      "DELETE FROM wallet_nonces WHERE wallet = ?"
    ).bind(wallet).run();

    await context.env.DB.prepare(`
      INSERT INTO wallet_nonces(wallet, nonce, created_at)
      VALUES(?, ?, ?)
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
