import express from 'express';
const router = express.Router();
import { ecotrackService } from '../services/ecotrack.js';
import Wilaya from '../models/Wilaya.js';

router.post('/sync', async (req, res) => {
  const data = await ecotrackService.getFees();
  if (!data?.livraison) return res.status(500).json({ success: false });
  const result = Wilaya.syncFromEcotrack(data);
  res.json({ success: true, ...result });
});

router.get('/wilayas', (req, res) => res.json({ success: true, wilayas: Wilaya.getWilayas() }));

router.get('/fee', (req, res) => {
  const fee = Wilaya.getLivraisonFee(parseInt(req.query.wilaya_id));
  fee ? res.json({ success: true, fees: fee }) : res.status(404).json({ success: false });
});

export default router;

router.get('/sync', async (req, res) => {
  const data = await ecotrackService.getFees();
  if (!data?.livraison) return res.status(500).json({ success: false });
  const result = Wilaya.syncFromEcotrack(data);
  res.json({ success: true, ...result });
});
