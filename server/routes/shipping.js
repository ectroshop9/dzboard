import express from 'express';
const router = express.Router();
import { ecotrackService } from '../services/ecotrack.js';
import Wilaya from '../models/Wilaya.js';
import { supabase } from '../supabase.js';

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
  if (!fee) return res.json({ success: true, fees: { domicile: '0', stopdesk: '0' } });
  res.json({ success: true, fees: fee });
});

router.get('/communes', async (req, res) => {
  const { wilaya_id } = req.query;
  if (!wilaya_id) return res.json({ success: false });
  const { data } = await supabase.from('communes').select('id, name_ar, name_fr').eq('wilaya_id', wilaya_id).order('name_ar');
  res.json({ success: true, communes: data || [] });
});

router.get('/sync-communes', async (req, res) => {
  const wilayaId = parseInt(req.query.wilaya_id);
  if (!wilayaId) return res.json({ success: false, message: 'wilaya_id required' });
  
  const communes = await ecotrackService.getCommunes(wilayaId);
  if (!communes || !Array.isArray(communes)) return res.json({ success: false });
  
  let count = 0;
  for (const c of communes) {
    await supabase.from('communes').upsert({
      wilaya_id: wilayaId,
      name_ar: c.nom,
      name_fr: c.nom,
    });
    count++;
  }
  
  res.json({ success: true, wilaya_id: wilayaId, total: count });
});

export default router;
