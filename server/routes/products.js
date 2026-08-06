import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/auth.js';

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', verifyAdmin, ctrl.create);
router.put('/:id', verifyAdmin, ctrl.update);
router.delete('/:id', verifyAdmin, ctrl.remove);

export default router;
