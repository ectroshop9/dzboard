import Product from '../models/Product.js';

export const getAll = async (req, res) => {
  const products = await Product.getAll();
  let filtered = products;
  const { category, brand, q } = req.query;
  if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
  if (brand && brand !== 'all') filtered = filtered.filter(p => p.brand === brand);
  if (q) filtered = filtered.filter(p => p.name?.includes(q));
  res.json({ success: true, products: filtered });
};

export const getById = async (req, res) => {
  const p = await Product.getById(parseInt(req.params.id));
  p ? res.json({ success: true, product: p }) : res.status(404).json({ success: false });
};

export const create = async (req, res) => {
  const p = await Product.create(req.body);
  res.status(201).json({ success: true, product: p });
};

export const update = async (req, res) => {
  const p = await Product.update(parseInt(req.params.id), req.body);
  p ? res.json({ success: true, product: p }) : res.status(404).json({ success: false });
};

export const remove = async (req, res) => {
  await Product.delete(parseInt(req.params.id));
  res.json({ success: true });
};
