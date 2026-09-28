import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.SQL_HOST!,
    user: process.env.SQL_USER!,
    password: process.env.SQL_PASSWORD!,
    database: process.env.SQL_DB_NAME!,
    ssl: true,
  },
  verbose: true,
  strict: true,
});
