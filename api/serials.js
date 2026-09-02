import express from 'express';
import { supabase } from '../server/supabase.js';

const router = express.Router();

// ✅ التحقق من السيريال وتحميل الملف
router.post('/verify', async (req, res) => {
  const { serial_code } = req.body;

  if (!serial_code) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال السيريال' });
  }

  // البحث عن السيريال
  const { data: serial, error } = await supabase
    .from('serials')
    .select('*, products(name, image)')
    .eq('serial_code', serial_code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !serial) {
    return res.status(404).json({ success: false, message: 'سيريال غير صحيح أو منتهي' });
  }

  // التحقق من التحميلات المتبقية
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

  // البحث عن السيريال
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

  // زيادة العداد
  const { error: updateError } = await supabase
    .from('serials')
    .update({ used_downloads: serial.used_downloads + 1 })
    .eq('id', serial.id);

  if (updateError) {
    return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
  }

  // تسجيل التحميل
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
