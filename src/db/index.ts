import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

const globalForDb = globalThis as unknown as {
  _postgresPool?: pg.Pool;
};

export function isSqlConfigured(): boolean {
  return Boolean(
    process.env.SQL_HOST &&
      process.env.SQL_USER &&
      process.env.SQL_DB_NAME
  );
}

const pool =
  globalForDb._postgresPool ||
  new Pool({
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT || 5432),
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

if (!globalForDb._postgresPool) {
  globalForDb._postgresPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
