const express = require('express');
const router = express.Router();
const { ecotrackService } = require('../services/ecotrack');
const Wilaya = require('../models/Wilaya');

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

router.get('/wilayas', (req, res) => {
  res.json({ success: true, wilayas: Wilaya.getWilayas() });
});

router.get('/fee', (req, res) => {
  const { wilaya_id } = req.query;
  if (!wilaya_id) return res.status(400).json({ success: false, message: 'wilaya_id مطلوب' });
  const fee = Wilaya.getLivraisonFee(parseInt(wilaya_id));
  if (!fee) return res.status(404).json({ success: false, message: 'الولاية غير متوفرة' });
  res.json({ success: true, fees: fee });
});

module.exports = router;
