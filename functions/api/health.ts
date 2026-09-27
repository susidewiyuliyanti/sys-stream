interface Env {
  HYPERDRIVE: Hyperdrive;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const connectionString = context.env.HYPERDRIVE.connectionString;

    if (!connectionString) {
      return Response.json(
        {
          success: false,
          database: "not-configured",
          message: "HYPERDRIVE connection string tidak tersedia"
        },
        { status: 500 }
      );
    }

    const { Client } = await import("pg");

    const client = new Client({
      connectionString
    });

    await client.connect();

    const result = await client.query(
      "SELECT NOW() AS server_time, current_database() AS database_name"
    );

    await client.end();

    return Response.json({
      success: true,
      cloudflare: "connected",
      hyperdrive: "connected",
      database: "connected",
      databaseName: result.rows[0]?.database_name,
      serverTime: result.rows[0]?.server_time
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        success: false,
        database: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unknown database connection error"
      },
      { status: 500 }
    );
  }
};
