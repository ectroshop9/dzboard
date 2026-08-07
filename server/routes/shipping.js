import express from 'express';
const router = express.Router();
import { ecotrackService } from '../services/ecotrack.js';
import Wilaya from '../models/Wilaya.js';

router.post('/sync', async (req, res) => {
  const data = await ecotrackService.getFees();
  if (!data?.livraison) return res.status(500).json({ success: false });
  const result = await Wilaya.syncFromEcotrack(data);
  res.json({ success: true, ...result });
});

router.get('/sync', async (req, res) => {
  const data = await ecotrackService.getFees();
  if (!data?.livraison) return res.status(500).json({ success: false });
  const result = await Wilaya.syncFromEcotrack(data);
  res.json({ success: true, ...result });
});

router.get('/wilayas', async (req, res) => {
  const wilayas = await Wilaya.getWilayas();
  res.json({ success: true, wilayas });
});

router.get('/fee', async (req, res) => {
  const fee = await Wilaya.getLivraisonFee(parseInt(req.query.wilaya_id));
  if (!fee) {
    return res.json({ success: true, fees: { domicile: '0', stopdesk: '0' } });
  }
  res.json({ success: true, fees: fee });
});

export default router;
