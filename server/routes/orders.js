import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validate.js';

router.post('/', validateOrder, ctrl.create);
router.get('/', verifyAdmin, ctrl.getAll);
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);
router.get('/track/:tracking', ctrl.trackOrder);

export default router;
