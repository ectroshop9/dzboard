import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

const getToken = (req) => {
  return req.headers.authorization?.replace('Bearer ', '');
};

const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

// GET - جلب كل القطع
router.get('/', async (req, res) => {
  const token = getToken(req);
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { data, error } = await supabase
    .from('tv_stock')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, items: data || [] });
});

// POST - إضافة قطعة
router.post('/', async (req, res) => {
  const token = getToken(req);
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { marque, modele, carte_mere, dalle, image_carte, image_tcon, image_alimentation, image_driver_led, etat_carte, etat_led, etat_tcon, box } = req.body;

  if (!marque || !carte_mere) {
    return res.status(400).json({ success: false, message: 'الماركة ورقم الكارت مير مطلوبان' });
  }

  const { data, error } = await supabase
    .from('tv_stock')
    .insert({
      marque,
      modele: modele || '',
      carte_mere,
      dalle: dalle || '',
      image_carte: image_carte || null,
      image_tcon: image_tcon || null,
      image_alimentation: image_alimentation || null,
      image_driver_led: image_driver_led || null,
      etat_carte: etat_carte || 'available',
      etat_led: etat_led || 'available',
      etat_tcon: etat_tcon || 'available',
      box: box || ''
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, item: data });
});

// DELETE - حذف قطعة
router.delete('/:id', async (req, res) => {
  const token = getToken(req);
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { error } = await supabase
    .from('tv_stock')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, message: 'تم الحذف' });
});

export default router;
