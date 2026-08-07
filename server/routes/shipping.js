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
  fee ? res.json({ success: true, fees: fee }) : res.status(404).json({ success: false });
});

export default router;
