import express from 'express';
import crypto from 'crypto';
import { supabase } from '../supabase.js';

const router = express.Router();

// ✅ تخزين التوكنات المؤقتة
const tempTokens = new Map();

// ✅ التحقق من السيريال
router.post('/verify', async (req, res) => {
  const { serial_code } = req.body;

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
      remaining_downloads: remaining,
      max_downloads: serial.max_downloads,
    }
  });
});

// ✅ التحميل - يولد توكن مؤقت
router.post('/download', async (req, res) => {
  const { serial_code, product_id } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  if (!serial_code || !product_id) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال السيريال واختيار المنتج' });
  }

  const { data: serial, error: serialError } = await supabase
    .from('serials')
    .select('*')
    .eq('serial_code', serial_code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (serialError || !serial) {
    return res.status(404).json({ success: false, message: 'سيريال غير صحيح' });
  }

  const remaining = serial.max_downloads - serial.used_downloads;
  if (remaining <= 0) {
    return res.status(400).json({ success: false, message: 'استنفدت التحميلات' });
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, file_url')
    .eq('id', product_id)
    .single();

  if (productError || !product || !product.file_url) {
    return res.status(404).json({ success: false, message: 'لا يوجد ملف لهذا المنتج' });
  }

  // ✅ زيادة العداد
  const { error: updateError } = await supabase
    .from('serials')
    .update({ used_downloads: serial.used_downloads + 1 })
    .eq('id', serial.id);

  if (updateError) {
    return res.status(500).json({ success: false, message: 'خطأ في التحديث' });
  }

  // ✅ تسجيل التحميل
  await supabase.from('download_logs').insert({
    serial_id: serial.id,
    product_id: product.id,
    ip_address: ip
  });

  // ✅ توليد توكن مؤقت - لا يكشف file_url
  const token = crypto.randomBytes(32).toString('hex');
  tempTokens.set(token, {
    file_url: product.file_url,
    expires: Date.now() + (5 * 60 * 1000) // 5 دقائق
  });

  // ✅ تنظيف التوكنات المنتهية
  for (const [key, value] of tempTokens) {
    if (Date.now() > value.expires) {
      tempTokens.delete(key);
    }
  }

  res.json({
    success: true,
    download_url: `/api/serials/download-temp/${token}`,
    file_name: product.name,
    remaining_downloads: remaining - 1
  });
});

// ✅ تحميل بالتوكن المؤقت
router.get('/download-temp/:token', async (req, res) => {
  const data = tempTokens.get(req.params.token);

  if (!data || Date.now() > data.expires) {
    tempTokens.delete(req.params.token);
    return res.status(410).send('الرابط منتهي أو غير صالح');
  }

  tempTokens.delete(req.params.token);
  try {
    const fileResponse = await fetch(data.file_url);
    
    // ✅ استخراج اسم الملف من الرابط
    const urlPath = new URL(data.file_url).pathname;
    const extension = urlPath.split(".").pop();
    const fileName = `${data.file_name || "download"}.${extension}`;
    if (!fileResponse.ok) {
      return res.status(500).send("فشل جلب الملف");
    }
    const buffer = await fileResponse.arrayBuffer();
    res.setHeader("Content-Type", fileResponse.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("خطأ في التحميل");
  }
});

// ✅ قائمة السيريالات للأدمن
router.get('/admin/list', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { data: serials, error } = await supabase
    .from('serials')
    .select('*')
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

  const { serial_code, max_downloads } = req.body;

  if (!serial_code || !max_downloads) {
    return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
  }

  const { data, error } = await supabase
    .from('serials')
    .insert({
      serial_code,
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

// ✅ تفعيل/تعطيل سيريال
router.put('/admin/toggle/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';
  
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { is_active } = req.body;

  const { error } = await supabase
    .from('serials')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true });
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
