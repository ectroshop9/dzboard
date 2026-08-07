import { supabase } from '../supabase.js';

const WILAYA_NAMES = {
  1: 'أدرار', 2: 'الشلف', 3: 'الأغواط', 4: 'أم البواقي', 5: 'باتنة',
  6: 'بجاية', 7: 'بسكرة', 8: 'بشار', 9: 'البليدة', 10: 'البويرة',
  11: 'تامنراست', 12: 'تبسة', 13: 'تلمسان', 14: 'تيارت', 15: 'تيزي وزو',
  16: 'الجزائر', 17: 'الجلفة', 18: 'جيجل', 19: 'سطيف', 20: 'سعيدة',
  21: 'سكيكدة', 22: 'سيدي بلعباس', 23: 'عنابة', 24: 'قالمة', 25: 'قسنطينة',
  26: 'المدية', 27: 'مستغانم', 28: 'المسيلة', 29: 'معسكر', 30: 'ورقلة',
  31: 'وهران', 32: 'البيض', 33: 'إليزي', 34: 'برج بوعريريج', 35: 'بومرداس',
  36: 'الطارف', 37: 'تندوف', 38: 'تيسمسيلت', 39: 'الوادي', 40: 'خنشلة',
  41: 'سوق أهراس', 42: 'تيبازة', 43: 'ميلة', 44: 'عين الدفلى', 45: 'النعامة',
  46: 'عين تموشنت', 47: 'غرداية', 48: 'غليزان', 49: 'تيميمون',
  51: 'أولاد جلال', 52: 'بني عباس', 53: 'عين صالح', 55: 'تقرت',
  57: 'المنيعة', 58: 'المغير',
};

export default {
  getWilayas: async () => {
    const { data } = await supabase.from('wilayas').select('*').order('wilaya_id');
    return (data || []).map(w => ({ ...w, name_ar: WILAYA_NAMES[w.wilaya_id] || w.name_ar }));
  },

  getLivraisonFee: async (wilaya_id) => {
    try {
      const TOKEN = process.env.ECOTRACK_API_TOKEN;
      const URL = process.env.ECOTRACK_API_URL;
      const res = await fetch(`${URL}/get/fees`, { headers: { Authorization: `Bearer ${TOKEN}` } });
      const data = await res.json();
      const fee = data.livraison?.find(f => f.wilaya_id === wilaya_id);
      if (fee) return { domicile: fee.tarif, stopdesk: fee.tarif_stopdesk || '0' };
      return { domicile: '0', stopdesk: '0' };
    } catch {
      return { domicile: '0', stopdesk: '0' };
    }
  },

  syncFromEcotrack: async (ecotrackData) => {
    const wilayas = [];
    const fees = [];

    ['livraison', 'recouvrement'].forEach(type => {
      if (ecotrackData[type]) {
        ecotrackData[type].forEach(item => {
          if (!wilayas.find(w => w.wilaya_id === item.wilaya_id)) {
            wilayas.push({
              wilaya_id: item.wilaya_id,
              name_ar: WILAYA_NAMES[item.wilaya_id] || `ولاية ${item.wilaya_id}`,
              has_stopdesk: parseInt(item.tarif_stopdesk || 0) > 0,
            });
          }
          fees.push({ wilaya_id: item.wilaya_id, type, tarif: item.tarif, tarif_stopdesk: item.tarif_stopdesk || '0' });
        });
      }
    });

    if (wilayas.length > 0) await supabase.from('wilayas').upsert(wilayas);
    if (fees.length > 0) await supabase.from('shipping_fees').upsert(fees);

    return { wilayas: wilayas.length, fees: fees.length };
  },
};
