import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/auth.js';
import cloudinary from '../cloudinary.js';

// مسارات إدارة المنتجات
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

// مسار رفع الصور مع حماية الإدمن وضغط الصورة تلقائيًا
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