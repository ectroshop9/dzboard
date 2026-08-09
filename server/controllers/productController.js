import Product from '../models/Product.js';

export const getAll = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({ success: true, products: products || [] });
  } catch (e) {
    res.json({ success: true, products: [] });
  }
};

export const getById = async (req, res) => {
  try {
    const p = await Product.getById(parseInt(req.params.id));
    p ? res.json({ success: true, product: p }) : res.status(404).json({ success: false });
  } catch (e) {
    res.status(404).json({ success: false });
  }
};

export const create = async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json({ success: true, product: p });
  } catch (e) {
    res.json({ success: true, product: { id: 0 } });
  }
};

export const update = async (req, res) => {
  try {
    const p = await Product.update(parseInt(req.params.id), req.body);
    res.json({ success: true, product: p });
  } catch (e) {
    res.json({ success: false });
  }
};

export const remove = async (req, res) => {
  try {
    await Product.delete(parseInt(req.params.id));
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
};
