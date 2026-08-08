import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validate.js';

// Create order - public but with validation
router.post('/', validateOrder, ctrl.create);

// Get all orders - admin only
router.get('/', verifyAdmin, ctrl.getAll);

// Update order status - admin only
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);

// Track order - requires phone verification
router.get('/track/:tracking', ctrl.trackOrder);

export default router;
