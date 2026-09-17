import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

router.get('/', async (req, res) => {
  try {
    const { wilaya_id, company_id, search } = req.query;
    let query = supabase.from('stopdesks').select('*').eq('active', true).order('wilaya_id');
    if (wilaya_id) query = query.eq('wilaya_id', parseInt(wilaya_id));
    if (company_id) query = query.eq('company_id', parseInt(company_id));
    if (search) query = query.or(`name.ilike.%${search}%,commune.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    
    // جلب أسماء الشركات يدوياً
    const companyIds = [...new Set((data || []).map(s => s.company_id).filter(Boolean))];
    let companiesMap = {};
    
    if (companyIds.length > 0) {
      const { data: companies } = await supabase.from('companies').select('id,name').in('id', companyIds);
      (companies || []).forEach(c => { companiesMap[c.id] = c.name; });
    }
    
    const result = (data || []).map(s => ({
      ...s,
      company: companiesMap[s.company_id] || null
    }));
    
    res.json({ success: true, stopdesks: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
