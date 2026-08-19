import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// ✅ جلب كل المحادثات مجمعة حسب العميل - للأدمن
router.get('/conversations', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('live_chats')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  
  // تجميع حسب session_id
  const conversations = {};
  (data || []).forEach(msg => {
    const key = msg.session_id || 'unknown';
    if (!conversations[key]) conversations[key] = [];
    conversations[key].push(msg);
  });
  
  res.json({ success: true, conversations });
});

// ✅ جلب ردود الأدمن لعميل محدد - عام
router.get('/admin-replies/:sessionId', async (req, res) => {
  const { data, error } = await supabase
    .from('live_chats')
    .select('*')
    .eq('sender', 'admin')
    .eq('session_id', req.params.sessionId)
    .order('id', { ascending: true });
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, replies: data || [] });
});

// ✅ إرسال رسالة - مع session_id
router.post('/messages', async (req, res) => {
  const { message, sender, session_id } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'الرسالة مطلوبة' });
  }
  
  const { data, error } = await supabase
    .from('live_chats')
    .insert({ 
      message, 
      sender: sender || 'customer',
      session_id: session_id || 'default_session'
    })
    .select()
    .single();
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: data });
});

// ✅ حذف محادثة كاملة
router.delete('/conversation/:sessionId', verifyAdmin, async (req, res) => {
  const { error } = await supabase
    .from('live_chats')
    .delete()
    .eq('session_id', req.params.sessionId);
  
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true });
});

export default router;