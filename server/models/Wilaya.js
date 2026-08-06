let wilayas = []; let shippingFees = [];
export default {
  getWilayas: () => wilayas,
  getLivraisonFee: (id) => { const f = shippingFees.find(f => f.wilaya_id === id && f.type === 'livraison'); return f ? { domicile: f.tarif, stopdesk: f.tarif_stopdesk } : null; },
  syncFromEcotrack: (data) => {
    wilayas = []; shippingFees = [];
    ['livraison','recouvrement'].forEach(type => {
      if (data[type]) data[type].forEach(item => {
        if (!wilayas.find(w => w.wilaya_id === item.wilaya_id)) wilayas.push({ wilaya_id: item.wilaya_id, name_ar: `ولاية ${item.wilaya_id}`, has_stopdesk: parseInt(item.tarif_stopdesk||0) > 0 });
        shippingFees.push({ wilaya_id: item.wilaya_id, type, tarif: item.tarif, tarif_stopdesk: item.tarif_stopdesk||'0' });
      });
    });
    return { wilayas: wilayas.length, fees: shippingFees.length };
  },
};
