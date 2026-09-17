import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

router.get('/', async (req, res) => {
  try {
    const { wilaya_id, search } = req.query;
    let query = supabase.from('stopdesks').select('*').eq('active', true).order('wilaya_id');
    if (wilaya_id) query = query.eq('wilaya_id', parseInt(wilaya_id));
    if (search) query = query.or(`name.ilike.%${search}%,commune.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, stopdesks: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
