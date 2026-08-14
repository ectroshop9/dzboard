import express from 'express';
const router = express.Router();
import * as ctrl from '../controllers/orderController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

router.post('/', ctrl.create);
router.get('/', verifyAdmin, ctrl.getAll);
router.put('/:id/status', verifyAdmin, ctrl.updateStatus);

// بحث عن طلب
router.get('/search', verifyAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, error: 'Query required' });
    
    const cleanQuery = query.replace('ORDER-', '').trim();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${cleanQuery},tracking.eq.${query}`)
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return res.json({ success: true, order: data[0] });
    }
    
    return res.json({ success: false, error: 'Not found' });
  } catch (e) {
    console.error('Search error:', e);
    res.json({ success: false, error: e.message });
  }
});

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