import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';
import { verifyAdmin } from '../middleware/auth.js';

// ✅ مزامنة كل البلديات من DHD
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const TOKEN = process.env.ECOTRACK_API_TOKEN;
    const URL = process.env.ECOTRACK_API_URL;
    
    if (!TOKEN || !URL) {
      return res.status(500).json({ success: false, error: 'DHD API غير مهيأ' });
    }
    
    const wilayas = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,51,52,53,55,57,58];
    
    let total = 0;
    let errors = [];
    
    for (const w of wilayas) {
      try {
        const r = await fetch(`${URL}/get/communes?wilaya_id=${w}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        const data = await r.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const communes = data.map(c => ({
            wilaya_id: c.wilaya_id,
            name_ar: c.nom,
            name_fr: c.nom
          }));
          
          // حذف القديم ثم إضافة الجديد
          await supabase.from('communes').delete().eq('wilaya_id', w);
          await supabase.from('communes').insert(communes);
          
          total += communes.length;
        }
        
        // انتظار بين كل طلب (تجنب rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        errors.push({ wilaya: w, error: err.message });
      }
    }
    
    res.json({ 
      success: true, 
      total, 
      wilayas: wilayas.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
