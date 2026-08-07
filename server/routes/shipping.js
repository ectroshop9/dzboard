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

router.get('/sync-communes', async (req, res) => {
  const wilayas = await Wilaya.getWilayas();
  let total = 0;
  
  for (const w of wilayas) {
    const communes = await ecotrackService.getCommunes(w.wilaya_id);
    if (communes && Array.isArray(communes)) {
      for (const c of communes) {
        await supabase.from('communes').upsert({
          wilaya_id: w.wilaya_id,
          name_ar: c.name || c.commune,
          name_fr: c.name || c.commune,
        });
        total++;
      }
    }
    // delay عشان rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  
  res.json({ success: true, total });
});
