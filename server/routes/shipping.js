import express from 'express';
const router = express.Router();
import { ecotrackService } from '../services/ecotrack.js';
import Wilaya from '../models/Wilaya.js';

// مزامنة الولايات والأسعار من ECOTRACK
router.post('/sync', async (req, res) => {
  try {
    const data = await ecotrackService.getFees();
    
    if (!data || !data.livraison) {
      return res.status(500).json({ success: false, message: 'فشل جلب البيانات من ECOTRACK' });
    }
    
    const result = Wilaya.syncFromEcotrack(data);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في المزامنة' });
  }
});

// قائمة الولايات النشطة
router.get('/wilayas', (req, res) => {
  const wilayas = Wilaya.getWilayas().map(w => ({
    wilaya_id: w.wilaya_id,
    name_ar: w.name_ar,
    has_stopdesk: w.has_stopdesk,
  }));
  res.json({ success: true, wilayas });
});

// سعر الشحن لولاية
router.get('/fee', (req, res) => {
  const { wilaya_id } = req.query;
  
  if (!wilaya_id) {
    return res.status(400).json({ success: false, message: 'wilaya_id مطلوب' });
  }
  
  const fee = Wilaya.getLivraisonFee(parseInt(wilaya_id));
  
  if (!fee) {
    return res.status(404).json({ success: false, message: 'الولاية غير متوفرة' });
  }
  
  res.json({ success: true, fees: fee });
});

export default router;
