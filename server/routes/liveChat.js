import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// جلب الرسائل - للأدمن فقط
router.get('/messages', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('live_chats')
    .select('*')
    .order('id', { ascending: false })
    .limit(50);
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, messages: (data || []).reverse() });
});

// إرسال رسالة - عام (بدون verifyAdmin)
router.post('/messages', async (req, res) => {
  const { message, sender } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'الرسالة مطلوبة' });
  }
  
  const { data, error } = await supabase
    .from('live_chats')
    .insert({ message, sender: sender || 'customer' })
    .select()
    .single();
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: data });
});

// حذف رسالة - للأدمن فقط
router.delete('/messages/:id', verifyAdmin, async (req, res) => {
  const { error } = await supabase
    .from('live_chats')
    .delete()
    .eq('id', req.params.id);
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

export default router;