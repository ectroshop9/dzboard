import express from 'express';
const router = express.Router();
import cloudinary from '../cloudinary.js';
import { uploadLimiter } from '../middleware/rateLimit.js';

router.post('/', uploadLimiter, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'لا توجد صورة' });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'صيغة غير صحيحة' });
    }

    const allowedTypes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp'];
    if (!allowedTypes.some(type => image.startsWith(type))) {
      return res.status(400).json({ success: false, message: 'فقط JPG, PNG, WEBP مسموحة' });
    }

    const sizeInBytes = (image.length * 3) / 4;
    const maxSize = 2 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ success: false, message: 'الصورة كبيرة جداً (2MB max)' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-public',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    res.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error('Public upload error:', error);
    res.status(500).json({ success: false, message: 'فشل رفع الصورة: ' + error.message });
  }
});

export default router;
