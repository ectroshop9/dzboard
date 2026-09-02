import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// ✅ التحقق من السيريال
router.post('/verify', async (req, res) => {
  const { serial_code } = req.body;

  if (!serial_code) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال السيريال' });
  }

  const { data: serial, error } = await supabase
    .from('serials')
    .select('*, products(name, image)')
    .eq('serial_code', serial_code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !serial) {
    return res.status(404).json({ success: false, message: 'سيريال غير صحيح أو منتهي' });
  }

  const remaining = serial.max_downloads - serial.used_downloads;
  if (remaining <= 0) {
    return res.status(400).json({ success: false, message: 'استنفدت التحميلات لهذا السيريال' });
  }

  res.json({
    success: true,
    serial: {
      id: serial.id,
      product_name: serial.products?.name || 'منتج',
      product_image: serial.products?.image || '',
      remaining_downloads: remaining,
    }
  });
});

// ✅ تنفيذ التحميل
router.post('/download', async (req, res) => {
  const { serial_code } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  if (!serial_code) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال السيريال' });
  }

  const { data: serial, error } = await supabase
    .from('serials')
    .select('*')
    .eq('serial_code', serial_code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !serial) {
    return res.status(404).json({ success: false, message: 'سيريال غير صحيح' });
  }

  const remaining = serial.max_downloads - serial.used_downloads;
  if (remaining <= 0) {
    return res.status(400).json({ success: false, message: 'استنفدت التحميلات' });
  }

  const { error: updateError } = await supabase
    .from('serials')
    .update({ used_downloads: serial.used_downloads + 1 })
    .eq('id', serial.id);

  if (updateError) {
    return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
  }

  await supabase.from('download_logs').insert({
    serial_id: serial.id,
    ip_address: ip
  });

  res.json({
    success: true,
    file_url: serial.file_url,
    remaining_downloads: remaining - 1
  });
});

export default router;

// ✅ قائمة السيريالات للأدمن
router.get('/admin/list', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { data: serials, error } = await supabase
    .from('serials')
    .select('*, products(name)')
    .order('id', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, serials: serials || [] });
});

// ✅ إنشاء سيريال جديد
router.post('/admin/create', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { serial_code, product_id, file_url, max_downloads } = req.body;

  if (!serial_code || !product_id || !file_url) {
    return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
  }

  const { data, error } = await supabase
    .from('serials')
    .insert({
      serial_code,
      product_id: parseInt(product_id),
      file_url,
      max_downloads: parseInt(max_downloads) || 1,
      used_downloads: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, serial: data });
});

// ✅ حذف سيريال
router.delete('/admin/delete/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { error } = await supabase
    .from('serials')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, message: 'تم الحذف' });
});

export default router;
