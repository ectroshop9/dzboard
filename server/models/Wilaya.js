// Mock database - later replace with PostgreSQL
let wilayas = [];
let shippingFees = [];

export default {
  // Wilayas
  getWilayas: () => wilayas.filter(w => w.active),
  getWilayaById: (id) => wilayas.find(w => w.wilaya_id === id),
  
  // Shipping Fees
  getFeesByWilaya: (wilayaId) => {
    const fees = {};
    ['livraison', 'recouvrement', 'retour'].forEach(type => {
      const fee = shippingFees.find(f => f.wilaya_id === wilayaId && f.type === type);
      if (fee) fees[type] = fee;
    });
    return fees;
  },
  
  getLivraisonFee: (wilayaId) => {
    const fee = shippingFees.find(f => f.wilaya_id === wilayaId && f.type === 'livraison');
    return fee ? { domicile: fee.tarif, stopdesk: fee.tarif_stopdesk } : null;
  },
  
  // Sync from ECOTRACK
  syncFromEcotrack: (data) => {
    // Clear old data
    wilayas = [];
    shippingFees = [];
    
    const processFees = (feesList, type) => {
      feesList.forEach(item => {
        // Add wilaya if not exists
        if (!wilayas.find(w => w.wilaya_id === item.wilaya_id)) {
          wilayas.push({
            wilaya_id: item.wilaya_id,
            name_ar: `ولاية ${item.wilaya_id}`,
            has_stopdesk: parseInt(item.tarif_stopdesk || 0) > 0,
            active: true,
          });
        }
        
        // Add shipping fee
        shippingFees.push({
          wilaya_id: item.wilaya_id,
          type: type,
          tarif: item.tarif,
          tarif_stopdesk: item.tarif_stopdesk || '0',
        });
      });
    };
    
    if (data.livraison) processFees(data.livraison, 'livraison');
    if (data.recouvrement) processFees(data.recouvrement, 'recouvrement');
    if (data.retours) processFees(data.retours, 'retour');
    
    return {
      wilayas: wilayas.length,
      fees: shippingFees.length,
    };
  },
};
