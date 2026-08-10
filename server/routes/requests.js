import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// استقبال طلب جديد
router.post('/', async (req, res) => {
  const { customer_name, phone, part_name, brand, model, image, notes } = req.body;
  if (!customer_name || !phone || !part_name) {
    return res.status(400).json({ success: false, message: 'الاسم والهاتف واسم القطعة مطلوبة' });
  }
  
  const { data, error } = await supabase.from('special_requests').insert({
    customer_name, phone, part_name, brand, model, image, notes, status: 'pending'
  }).select().single();
  
  if (error) return res.status(500).json({ success: false, error });
  res.json({ success: true, request: data });
});

// جلب كل الطلبات للأدمن
router.get('/', async (req, res) => {
  const { data } = await supabase.from('special_requests').select('*').order('id', { ascending: false });
  res.json({ success: true, requests: data || [] });
});

// تحديث حالة الطلب
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  const { data } = await supabase.from('special_requests').update({ status }).eq('id', req.params.id).select().single();
  res.json({ success: true, request: data });
});

export default router;
