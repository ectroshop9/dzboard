import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// حفظ محادثة
router.post('/', async (req, res) => {
  try {
    const { session_id, user_message, bot_response } = req.body;
    
    const { data, error } = await supabase
      .from('chat_logs')
      .insert({ session_id, user_message, bot_response })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, log: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// جلب المحادثات (للأدمن)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .order('id', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    res.json({ success: true, logs: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// حذف محادثة
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('chat_logs')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;