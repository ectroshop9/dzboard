import { sql } from '../db.js';

export default {
  getAll: async () => {
    const rows = await sql`SELECT * FROM products WHERE active = true ORDER BY id DESC`;
    return rows;
  },
  
  getById: async (id) => {
    const [row] = await sql`SELECT * FROM products WHERE id = ${id} AND active = true`;
    return row;
  },
  
  create: async (data) => {
    const [row] = await sql`
      INSERT INTO products (name, category, brand, price, stock, description, image)
      VALUES (${data.name}, ${data.category || 'tcon'}, ${data.brand || 'samsung'}, ${data.price}, ${data.stock || 0}, ${data.description || ''}, ${data.image || ''})
      RETURNING *
    `;
    return row;
  },
  
  update: async (id, data) => {
    const [row] = await sql`
      UPDATE products SET name=${data.name}, category=${data.category}, brand=${data.brand}, price=${data.price}, stock=${data.stock}, description=${data.description}, image=${data.image}
      WHERE id = ${id} RETURNING *
    `;
    return row;
  },
  
  delete: async (id) => {
    await sql`UPDATE products SET active = false WHERE id = ${id}`;
    return true;
  },
};
