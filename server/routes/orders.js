import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

router.post('/', ctrl.create);
router.get('/', verifyAdmin, ctrl.getAll);
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);

// حذف طلب
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', parseInt(req.params.id));
    
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('Delete error:', e);
    res.json({ success: false, message: e.message });
  }
});

export default router;