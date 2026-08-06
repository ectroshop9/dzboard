import Product from '../models/Product.js';

export const getAll = (req, res) => {
  let products = Product.getAll();
  const { category, brand, q } = req.query;
  
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (brand && brand !== 'all') products = products.filter(p => p.brand === brand);
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }
  
  res.json({ success: true, products });
};

export const getById = (req, res) => {
  const product = Product.getById(parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  res.json({ success: true, product });
};

export const create = (req, res) => {
  const { name, category, brand, price, stock, description, image } = req.body;
  if (!name || !price) return res.status(400).json({ success: false, message: 'الاسم والسعر مطلوبان' });
  const product = Product.create({ name, category, brand, price: parseFloat(price), stock: parseInt(stock) || 0, description, image });
  res.status(201).json({ success: true, product });
};

export const update = (req, res) => {
  const product = Product.update(parseInt(req.params.id), req.body);
  if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  res.json({ success: true, product });
};

export const remove = (req, res) => {
  const deleted = Product.delete(parseInt(req.params.id));
  if (!deleted) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  res.json({ success: true, message: 'تم حذف المنتج' });
};
