import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
export const sql = neon(DATABASE_URL);

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'tcon',
      brand TEXT DEFAULT 'samsung',
      price DECIMAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer TEXT NOT NULL,
      phone TEXT,
      wilaya_id INTEGER,
      commune TEXT,
      address TEXT,
      shipping_type TEXT DEFAULT 'domicile',
      amount DECIMAL DEFAULT 0,
      shipping DECIMAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      tracking TEXT,
      items JSONB DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('✅ Database ready');
}
