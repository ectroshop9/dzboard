import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/auth.js';

router.post('/', ctrl.create);
router.get('/', verifyAdmin, ctrl.getAll);
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);

export default router;
