import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// جلب كل الرفوف
router.get('/shelves', async (req, res) => {
  const { data } = await supabase.from('shelves').select('*').order('code');
  res.json({ success: true, shelves: data || [] });
});

// جلب قطع المخزون
router.get('/items', async (req, res) => {
  const { shelf, status, search } = req.query;
  let query = supabase.from('inventory_items').select('*, shelves(name), products(name)').order('sku');
  
  if (shelf) query = query.eq('shelf_id', shelf);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`sku.ilike.%${search}%,barcode.ilike.%${search}%`);
  
  const { data } = await query;
  res.json({ success: true, items: data || [] });
});

// إضافة قطعة جديدة
router.post('/items', async (req, res) => {
  const { product_id, shelf_id, position } = req.body;
  
  // توليد SKU
  const { data: shelf } = await supabase.from('shelves').select('code').eq('id', shelf_id).single();
  const { count } = await supabase.from('inventory_items').select('*', { count: 'exact' });
  const sku = `DZB-${String((count || 0) + 1).padStart(3, '0')}`;
  const barcode = `613${String((count || 0) + 1).padStart(6, '0')}`;
  
  const { data } = await supabase.from('inventory_items').insert({
    sku, barcode, product_id, shelf_id, position, status: 'available'
  }).select().single();
  
  res.json({ success: true, item: data });
});

// تحديث حالة قطعة
router.put('/items/:id', async (req, res) => {
  const { status, notes } = req.body;
  const { data: old } = await supabase.from('inventory_items').select('status').eq('id', req.params.id).single();
  
  const { data } = await supabase.from('inventory_items').update({ status, notes, updated_at: new Date() }).eq('id', req.params.id).select().single();
  
  // سجل الحركة
  await supabase.from('inventory_movements').insert({
    item_id: req.params.id,
    type: status === 'sold' ? 'out' : 'transfer',
    from_status: old.status,
    to_status: status,
  });
  
  res.json({ success: true, item: data });
});

export default router;
