import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/auth.js';
import cloudinary from '../cloudinary.js';

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

// ✅ رفع الصورة مع تحويل WebP وضغط
router.post('/upload', verifyAdmin, async (req, res) => {
  try {
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-products',
      quality: 'auto',        // ✅ ضغط تلقائي
      format: 'webp',         // ✅ تحويل لـ WebP
      width: 800,             // ✅ عرض أقصى 800px
      height: 800,            // ✅ ارتفاع أقصى 800px
      crop: 'limit',          // ✅ بدون تشويه
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل رفع الصورة' });
  }
});

export default router;
