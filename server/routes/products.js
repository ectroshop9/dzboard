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

router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.json({ success: false, message: 'No image' });
    
    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-products',
      quality: 'auto',
      format: 'webp',
    });
    
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;
