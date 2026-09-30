import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

// Global connection pool caching
declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    const host = process.env.SQL_HOST || '';
    const isUnixSocket = host.startsWith('/');
    const isLocalhost = !host || host === 'localhost' || host === '127.0.0.1';

    // Neon requires SSL. Local sockets and non-SSL local postgres MUST NOT have ssl set.
    const isRemoteSslRequired = Boolean(
      !isUnixSocket &&
      !isLocalhost &&
      (process.env.SQL_SSL === 'true' ||
        host.includes('neon.tech') ||
        host.includes('.aws.') ||
        host.includes('.com') ||
        host.includes('.net'))
    );

    if (hasDatabaseUrl) {
      const url = process.env.DATABASE_URL!;
      const urlRequiresSsl =
        (url.includes('sslmode=require') || url.includes('neon.tech') || url.includes('ssl=true')) &&
        !url.includes('sslmode=disable') &&
        !url.includes('localhost') &&
        !url.includes('127.0.0.1');
      global._postgresPool = new Pool({
        connectionString: url,
        ssl: urlRequiresSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else if (host) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        port: Number(process.env.SQL_PORT) || 5432,
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER,
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
        database: process.env.SQL_DB_NAME || 'neondb',
        ssl: isRemoteSslRequired ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      // Safe fallback pool
      global._postgresPool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '',
        database: 'neondb',
        max: 1,
        connectionTimeoutMillis: 2000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.warn('PostgreSQL pool idle notification (recovering):', err.message);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
