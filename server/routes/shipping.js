import express from 'express';
const router = express.Router();
import { ecotrackService } from '../services/ecotrack.js';
import Wilaya from '../models/Wilaya.js';
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// Sync shipping data - admin only
router.post('/sync', verifyAdmin, async (req, res) => {
  try {
    const data = await ecotrackService.getFees();
    if (!data?.livraison) {
      return res.status(400).json({ success: false, message: 'خطأ في جلب بيانات Ecotrack' });
    }
    const result = await Wilaya.syncFromEcotrack(data);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, message: 'خطأ في المزامنة' });
  }
});

// Get all wilayas - public
router.get('/wilayas', async (req, res) => {
  try {
    const wilayas = await Wilaya.getWilayas();
    res.json({ success: true, wilayas });
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الولايات' });
  }
});

// Get shipping fee for wilaya - public
router.get('/fee', async (req, res) => {
  try {
    const { wilaya_id } = req.query;
    
    // Validate wilaya_id
    if (!wilaya_id || isNaN(wilaya_id)) {
      return res.status(400).json({ success: false, message: 'معرف الولاية مطلوب' });
    }
    
    const wilayaIdNum = parseInt(wilaya_id);
    if (wilayaIdNum < 1 || wilayaIdNum > 58) {
      return res.status(400).json({ success: false, message: 'معرف الولاية غير صالح' });
    }
    
    const fee = await Wilaya.getLivraisonFee(wilayaIdNum);
    if (!fee) {
      return res.json({ success: true, fees: { domicile: '0', stopdesk: '0' } });
    }
    res.json({ success: true, fees: fee });
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الأسعار' });
  }
});

// Get communes for wilaya - public
router.get('/communes', async (req, res) => {
  try {
    const { wilaya_id } = req.query;
    
    // Validate wilaya_id
    if (!wilaya_id || isNaN(wilaya_id)) {
      return res.status(400).json({ success: false, message: 'معرف الولاية مطلوب' });
    }
    
    const wilayaIdNum = parseInt(wilaya_id);
    if (wilayaIdNum < 1 || wilayaIdNum > 58) {
      return res.status(400).json({ success: false, message: 'معرف الولاية غير صالح' });
    }
    
    const { data } = await supabase
      .from('communes')
      .select('id, name_ar, name_fr')
      .eq('wilaya_id', wilayaIdNum)
      .order('name_ar');
    
    res.json({ success: true, communes: data || [] });
  } catch (error) {
    console.error('Error fetching communes:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البلديات' });
  }
});

// Sync communes from Ecotrack - admin only
router.post('/sync-communes', verifyAdmin, async (req, res) => {
  try {
    const { wilaya_id } = req.query;
    
    // Validate wilaya_id
    if (!wilaya_id || isNaN(wilaya_id)) {
      return res.status(400).json({ success: false, message: 'معرف الولاية مطلوب' });
    }
    
    const wilayaIdNum = parseInt(wilaya_id);
    if (wilayaIdNum < 1 || wilayaIdNum > 58) {
      return res.status(400).json({ success: false, message: 'معرف الولاية غير صالح' });
    }
    
    const communes = await ecotrackService.getCommunes(wilayaIdNum);
    if (!communes || !Array.isArray(communes) || communes.length === 0) {
      return res.json({ success: false, message: 'لم يتم الحصول على بلديات' });
    }
    
    let count = 0;
    for (const c of communes) {
      // Validate commune data
      if (!c.nom || typeof c.nom !== 'string') {
        console.warn('Invalid commune data:', c);
        continue;
      }
      
      try {
        await supabase.from('communes').upsert({
          wilaya_id: wilayaIdNum,
          name_ar: c.nom.substring(0, 100),
          name_fr: c.nom.substring(0, 100),
        });
        count++;
      } catch (upsertError) {
        console.error('Error upserting commune:', c, upsertError);
      }
    }
    
    res.json({ success: true, wilaya_id: wilayaIdNum, total: count });
  } catch (error) {
    console.error('Error syncing communes:', error);
    res.status(500).json({ success: false, message: 'خطأ في مزامنة البلديات' });
  }
});

export default router;
