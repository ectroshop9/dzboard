import Product from '../models/Product.js';

export const getAll = (req, res) => {
  let products = Product.getAll();
  const { category, brand, q } = req.query;
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (brand && brand !== 'all') products = products.filter(p => p.brand === brand);
  if (q) products = products.filter(p => p.name.includes(q));
  res.json({ success: true, products });
};

export const getById = (req, res) => {
  const p = Product.getById(parseInt(req.params.id));
  p ? res.json({ success: true, product: p }) : res.status(404).json({ success: false });
};

export const create = (req, res) => res.status(201).json({ success: true, product: Product.create(req.body) });

export const update = (req, res) => {
  const p = Product.update(parseInt(req.params.id), req.body);
  p ? res.json({ success: true, product: p }) : res.status(404).json({ success: false });
};

export const remove = (req, res) => {
  Product.delete(parseInt(req.params.id)) ? res.json({ success: true }) : res.status(404).json({ success: false });
};
