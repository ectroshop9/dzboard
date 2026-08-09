import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import cloudinary from '../cloudinary.js';

router.get('/items', async (req, res) => {
  const { search } = req.query;
  let query = supabase.from('inventory_items').select('*').order('id', { ascending: false });
  if (search) query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%`);
  const { data: items } = await query;
  
  for (let item of (items || [])) {
    if (item.product_id) {
      const { data: product } = await supabase.from('products').select('image').eq('id', item.product_id).single();
      if (product?.image) item.image = product.image;
    }
  }
  
  res.json({ success: true, items: items || [] });
});

router.post('/items', async (req, res) => {
  const { name, shelf, position, image } = req.body;
  const { count } = await supabase.from('inventory_items').select('*', { count: 'exact' });
  const num = (count || 0) + 1;
  const sku = `DZB-${String(num).padStart(3, '0')}`;
  const barcode = `613${String(num).padStart(6, '0')}`;
  
  let imageUrl = '';
  if (image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'dzboard-inventory',
        quality: 'auto',
        format: 'webp',
        width: 400,
        crop: 'limit',
      });
      imageUrl = result.secure_url;
    } catch (e) {}
  }
  
  const { data, error } = await supabase.from('inventory_items').insert({
    sku, barcode, name, shelf, position, image: imageUrl, status: 'available'
  }).select().single();
  
  if (error) return res.status(500).json({ success: false, error });
  res.json({ success: true, item: data });
});

router.put('/items/:id', async (req, res) => {
  const { status } = req.body;
  const { data } = await supabase.from('inventory_items').update({ status }).eq('id', req.params.id).select().single();
  res.json({ success: true, item: data });
});

export default router;
