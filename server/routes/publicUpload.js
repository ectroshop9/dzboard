import express from 'express';
const router = express.Router();
import cloudinary from '../cloudinary.js';
import { uploadLimiter } from '../middleware/rateLimit.js';

// ✅ رفع آمن للزبائن
router.post('/', uploadLimiter, async (req, res) => {
  try {
    const { image } = req.body;

    // 1️⃣ فحص وجود الصورة
    if (!image) {
      return res.status(400).json({ success: false, message: 'لا توجد صورة' });
    }

    // 2️⃣ فحص الصيغة (Base64 فقط)
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'صيغة غير صحيحة' });
    }

    // 3️⃣ فحص النوع (JPG, PNG فقط)
    const allowedTypes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp'];
    if (!allowedTypes.some(type => image.startsWith(type))) {
      return res.status(400).json({ success: false, message: 'فقط JPG, PNG, WEBP مسموحة' });
    }

    // 4️⃣ فحص الحجم (2MB بعد Base64 = 2.7MB Base64)
    const sizeInBytes = (image.length * 3) / 4;
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'الصورة كبيرة جداً (الحد الأقصى 2MB)' 
      });
    }

    // 5️⃣ الرفع إلى Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-public',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ],
      // علامة للمراجعة
      context: 'public_upload=true',
      // فحص الصور (كشف المحتوى الضار)
      moderation: 'aws_rek'
    });

    res.json({ 
      success: true, 
      url: result.secure_url 
    });

  } catch (error) {
    console.error('Public upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل رفع الصورة' 
    });
  }
});

export default router;
