import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

const WEBPUSHR_KEY = process.env.WEBPUSHR_API_KEY;
const WEBPUSHR_AUTH = process.env.WEBPUSHR_AUTH_TOKEN;
const WEBPUSHR_API = 'https://api.webpushr.com/v1/notification/send/all';

// جلب سجل الإشعارات
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    res.json({ success: true, notifications: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// إرسال إشعار
router.post('/send', verifyAdmin, async (req, res) => {
  try {
    const { title, body, url, icon, image, segment } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'العنوان والنص مطلوبان' });
    }
    
    if (!WEBPUSHR_KEY || !WEBPUSHR_AUTH) {
      return res.status(500).json({ success: false, message: 'مفاتيح Webpushr غير موجودة' });
    }
    
    // إرسال إلى Webpushr
    const payload = {
      title,
      message: body,
      target_url: url || 'https://dzboard-dz.vercel.app',
    };
    
    if (icon) payload.icon = icon;
    if (image) payload.image = image;
    
    const wpRes = await fetch(WEBPUSHR_API, {
      method: 'POST',
      headers: {
        'webpushrKey': WEBPUSHR_KEY,
        'webpushrAuthToken': WEBPUSHR_AUTH,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const wpData = await wpRes.json();
    
    // حفظ في Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        body,
        url: url || 'https://dzboard-dz.vercel.app',
        icon: icon || null,
        image: image || null,
        segment: segment || 'all',
        status: wpData.success ? 'sent' : 'failed'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      notification: data,
      webpushr: wpData
    });
  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// حذف إشعار من السجل
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await supabase.from('notifications').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
