const Product = require('../models/Product');

exports.getAll = (req, res) => {
  let products = Product.getAll();
  const { category, brand, q } = req.query;
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (brand && brand !== 'all') products = products.filter(p => p.brand === brand);
  if (q) products = products.filter(p => p.name.includes(q) || p.description.includes(q));
  res.json({ success: true, products });
};

exports.getById = (req, res) => {
  const product = Product.getById(parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  res.json({ success: true, product });
};

exports.create = (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'الاسم والسعر مطلوبان' });
  res.status(201).json({ success: true, product: Product.create(req.body) });
};

exports.update = (req, res) => {
  const product = Product.update(parseInt(req.params.id), req.body);
  if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  res.json({ success: true, product });
};

exports.remove = (req, res) => {
  if (Product.delete(parseInt(req.params.id))) return res.json({ success: true });
  res.status(404).json({ success: false, message: 'المنتج غير موجود' });
};
