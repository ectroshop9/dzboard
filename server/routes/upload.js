import express from 'express';
const router = express.Router();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getToken = (req) => {
  return req.headers.authorization?.replace('Bearer ', '');
};

const validToken = process.env.ADMIN_TOKEN || 'dzboard_admin_2026';

// POST - رفع صورة Base64 إلى Cloudinary
router.post('/', async (req, res) => {
  const token = getToken(req);
  if (!token || token !== validToken) {
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ success: false, message: 'لا توجد صورة' });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'tv-stock'
    });

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
