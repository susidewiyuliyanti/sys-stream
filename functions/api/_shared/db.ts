import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../src/db/schema";

export interface CloudflareEnv {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET?: string;
  OWNER_EMAIL?: string;
}

/**
 * Create a Drizzle database connection using
 * Cloudflare Hyperdrive -> Neon PostgreSQL.
 *
 * Hyperdrive handles the database connection pooling.
 * We therefore keep the local Pool intentionally small.
 */
export const createDb = (env: CloudflareEnv) => {
  if (!env.HYPERDRIVE?.connectionString) {
    throw new Error("HYPERDRIVE connection string is not configured.");
  }

  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
    max: 1,
    connectionTimeoutMillis: 15000,
  });

  const db = drizzle(pool, {
    schema,
  });

  return {
    db,
    pool,
  };
};
