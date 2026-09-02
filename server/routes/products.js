import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/productController.js';
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';
import cloudinary from '../cloudinary.js';

const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// ✅ مسار الحصول على المنتجات - مع كاش
router.get('/', async (req, res) => {
  const cacheKey = 'products_all';
  
  try {
    // جلب من الكاش
    const { data: cached } = await supabase
      .from('cache')
      .select('*')
      .eq('id', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && cached.data) {
      return res.json(cached.data);
    }
  } catch {}

  // إذا لا يوجد كاش - جلب من قاعدة البيانات
  await ctrl.getAll(req, res);
  
  // حفظ في الكاش بعد الإرسال
  const originalJson = res.json;
  res.json = function(data) {
    if (data && data.success) {
      supabase.from('cache').upsert({
        id: cacheKey,
        data: data,
        expires_at: new Date(Date.now() + CACHE_DURATION).toISOString()
      }).then(() => {});
    }
    return originalJson.call(this, data);
  };
});

router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

router.post('/upload', verifyAdmin, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'لم يتم إرسال أي صورة' });
    }
    
    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-products',
      transformation: [
        { width: 1000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'webp' }
      ]
    });
    
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
