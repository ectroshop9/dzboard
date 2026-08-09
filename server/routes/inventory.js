import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

router.get('/items', async (req, res) => {
  const { search } = req.query;
  let query = supabase.from('inventory_items').select('*').order('id', { ascending: false });
  if (search) query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%`);
  const { data } = await query;
  res.json({ success: true, items: data || [] });
});

router.post('/items', async (req, res) => {
  const { name, shelf, position } = req.body;
  
  // توليد SKU وباركود
  const { count } = await supabase.from('inventory_items').select('*', { count: 'exact' });
  const num = (count || 0) + 1;
  const sku = `DZB-${String(num).padStart(3, '0')}`;
  const barcode = `613${String(num).padStart(6, '0')}`;
  
  const { data, error } = await supabase.from('inventory_items').insert({
    sku, barcode, name, shelf, position, status: 'available'
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
