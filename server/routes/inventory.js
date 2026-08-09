import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

router.get('/items', async (req, res) => {
  const { search } = req.query;
  let query = supabase.from('inventory_items').select('*').order('id', { ascending: false });
  if (search) query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%`);
  const { data: items } = await query;
  
  for (let item of (items || [])) {
    if (item.product_id) {
      const { data: product } = await supabase.from('products').select('image,price').eq('id', item.product_id).single();
      if (product) {
        item.image = product.image;
        item.price = product.price;
      }
    }
  }
  
  res.json({ success: true, items: items || [] });
});

router.post('/items', async (req, res) => {
  const { name, shelf, position, price, image, category, brand } = req.body;
  const { count } = await supabase.from('inventory_items').select('*', { count: 'exact' });
  const num = (count || 0) + 1;
  const sku = `DZB-${String(num).padStart(3, '0')}`;
  const barcode = `613${String(num).padStart(6, '0')}`;
  
  // إنشاء المنتج تلقائياً في المتجر
  const { data: product } = await supabase.from('products').insert({
    name, price: price || 0, stock: 1, active: true,
    category: category || 'parts',
    brand: brand || 'generic',
    image: image || '',
    description: `${shelf} - ${position || ''}`
  }).select().single();
  
  // إضافة القطعة في المخزون مربوطة بالمنتج
  const { data: item, error } = await supabase.from('inventory_items').insert({
    sku, barcode, name, shelf, position, image: image || '', 
    product_id: product.id, status: 'available'
  }).select().single();
  
  if (error) return res.status(500).json({ success: false, error });
  res.json({ success: true, item, product });
});

router.put('/items/:id', async (req, res) => {
  const { status } = req.body;
  const { data: old } = await supabase.from('inventory_items').select('product_id,status').eq('id', req.params.id).single();
  const { data: item } = await supabase.from('inventory_items').update({ status }).eq('id', req.params.id).select().single();
  
  if (old?.product_id) {
    const { data: product } = await supabase.from('products').select('stock').eq('id', old.product_id).single();
    if (product) {
      if (status === 'sold' && old.status === 'available') {
        await supabase.from('products').update({ stock: Math.max(0, product.stock - 1) }).eq('id', old.product_id);
      }
      if (status === 'available' && old.status === 'sold') {
        await supabase.from('products').update({ stock: product.stock + 1 }).eq('id', old.product_id);
      }
    }
  }
  
  res.json({ success: true, item });
});

export default router;
