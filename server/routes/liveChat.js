import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// جلب الرسائل
router.get('/messages', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('live_chats')
    .select('*')
    .order('id', { ascending: false })
    .limit(50);
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, messages: (data || []).reverse() });
});

// إرسال رسالة
router.post('/messages', async (req, res) => {
  const { message, sender, session_id } = req.body;
  const { data, error } = await supabase
    .from('live_chats')
    .insert({ message, sender: sender || 'customer', session_id })
    .select()
    .single();
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: data });
});

export default router;