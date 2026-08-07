import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export { sql };

export async function initDB() {
  await sql`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT, price DECIMAL, stock INTEGER, active BOOLEAN DEFAULT true)`;
  console.log('✅ DB Ready');
}
