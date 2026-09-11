import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// جلب كل المصلحين (عام - للخريطة)
router.get('/', async (req, res) => {
  try {
    const { wilaya_id } = req.query;
    
    let query = supabase
      .from('technicians')
      .select('*')
      .eq('active', true)
      .order('id', { ascending: false });
    
    if (wilaya_id) {
      query = query.eq('wilaya_id', parseInt(wilaya_id));
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, technicians: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// إحصائيات حسب الولاية (عام)
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('wilaya_id')
      .eq('active', true);
    
    if (error) throw error;
    
    const stats = {};
    (data || []).forEach(t => {
      stats[t.wilaya_id] = (stats[t.wilaya_id] || 0) + 1;
    });
    
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// إضافة مصلح (أدمن فقط)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, phone, wilaya_id, commune, address, notes } = req.body;
    
    if (!name || !phone || !wilaya_id) {
      return res.status(400).json({ success: false, message: 'الاسم والهاتف والولاية مطلوبة' });
    }
    
    const { data, error } = await supabase
      .from('technicians')
      .insert({
        name,
        phone,
        wilaya_id: parseInt(wilaya_id),
        commune: commune || '',
        address: address || '',
        notes: notes || '',
        active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, technician: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// تعديل مصلح (أدمن)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, phone, wilaya_id, commune, address, notes, active } = req.body;
    
    const { data, error } = await supabase
      .from('technicians')
      .update({
        name,
        phone,
        wilaya_id: parseInt(wilaya_id),
        commune: commune || '',
        address: address || '',
        notes: notes || '',
        active: active !== undefined ? active : true
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, technician: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// حذف مصلح (أدمن)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
