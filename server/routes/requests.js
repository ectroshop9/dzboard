import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// استقبال طلب جديد من العميل (مفتوح للعملاء)
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, part_name, brand, model, image, notes } = req.body;
    
    if (!customer_name || !phone || !part_name) {
      return res.status(400).json({ success: false, message: 'الاسم والهاتف واسم القطعة مطلوبة' });
    }
    
    const { data, error } = await supabase
      .from('special_requests')
      .insert({
        customer_name, 
        phone, 
        part_name, 
        brand: brand || '', 
        model: model || '', 
        image: image || '', 
        notes: notes || '', 
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ success: false, error: error.message });
    
    res.json({ success: true, request: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// جلب كل الطلبات (محمي للإدمن فقط)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('special_requests')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, requests: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// تحديث حالة الطلب (محمي للإدمن فقط)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'حالة الطلب مطلوبة' });
    }

    const { data, error } = await supabase
      .from('special_requests')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, request: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// حذف طلب (محمي للإدمن فقط)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('special_requests')
      .delete()
      .eq('id', parseInt(req.params.id));

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;