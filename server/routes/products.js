import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validate.js';

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, validateProduct, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

export default router;

router.post('/upload', verifyAdmin, async (req, res) => {
  try {
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, {
      folder: 'dzboard-products',
      quality: 'auto',
      width: 600,
      crop: 'limit',
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل رفع الصورة' });
  }
});
