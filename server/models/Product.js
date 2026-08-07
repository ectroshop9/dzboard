import { sql } from '../db.js';

export default {
  getAll: async () => await sql`SELECT * FROM products WHERE active = true ORDER BY id DESC`,
  getById: async (id) => (await sql`SELECT * FROM products WHERE id = ${id} AND active = true`)[0],
  create: async (data) => (await sql`INSERT INTO products (name, category, brand, price, stock, description, image) VALUES (${data.name}, ${data.category||'tcon'}, ${data.brand||'samsung'}, ${data.price}, ${data.stock||0}, ${data.description||''}, ${data.image||''}) RETURNING *`)[0],
  update: async (id, data) => (await sql`UPDATE products SET name=${data.name}, category=${data.category}, brand=${data.brand}, price=${data.price}, stock=${data.stock}, description=${data.description}, image=${data.image} WHERE id=${id} RETURNING *`)[0],
  delete: async (id) => { await sql`UPDATE products SET active = false WHERE id=${id}`; return true; },
};
