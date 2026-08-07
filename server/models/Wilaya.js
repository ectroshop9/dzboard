import { supabase } from '../supabase.js';

export default {
  getWilayas: async () => {
    const { data } = await supabase.from('wilayas').select('*').order('wilaya_id');
    return data || [];
  },

  getLivraisonFee: async (wilaya_id) => {
    const { data } = await supabase
      .from('shipping_fees')
      .select('tarif, tarif_stopdesk')
      .eq('wilaya_id', wilaya_id)
      .eq('type', 'livraison')
      .single();
    return data ? { domicile: data.tarif, stopdesk: data.tarif_stopdesk } : null;
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
              name_ar: `ولاية ${item.wilaya_id}`,
              has_stopdesk: parseInt(item.tarif_stopdesk || 0) > 0,
            });
          }
          fees.push({
            wilaya_id: item.wilaya_id,
            type,
            tarif: item.tarif,
            tarif_stopdesk: item.tarif_stopdesk || '0',
          });
        });
      }
    });

    // حفظ في Supabase
    if (wilayas.length > 0) {
      await supabase.from('wilayas').upsert(wilayas);
    }
    if (fees.length > 0) {
      await supabase.from('shipping_fees').upsert(fees);
    }

    return { wilayas: wilayas.length, fees: fees.length };
  },
};
