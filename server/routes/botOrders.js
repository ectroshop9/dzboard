import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// GET bot orders
router.get('/', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase.from('bot_orders').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, orders: data || [] });
});

// POST bot order
router.post('/', async (req, res) => {
  const { customer_name, phone, product_name, price } = req.body;
  const { data, error } = await supabase.from('bot_orders').insert({ customer_name, phone, product_name, price }).select().single();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, order: data });
});

// PUT update status
router.put('/:id', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('bot_orders').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, order: data });
});

// DELETE
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { error } = await supabase.from('bot_orders').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

export default router;
