const URL = process.env.ECOTRACK_API_URL || 'https://platform.dhd-dz.com/api/v1';
const TOKEN = process.env.ECOTRACK_API_TOKEN || '';
const H = { Authorization: `Bearer ${TOKEN}` };

export const ecotrackService = {
  getFees: async () => {
    try {
      const r = await fetch(`${URL}/get/fees`, { headers: H });
      return await r.json();
    } catch (error) {
      console.error('Ecotrack getFees Error:', error);
      return null;
    }
  },
  
  getCommunes: async (wilayaId) => {
    try {
      const r = await fetch(`${URL}/get/communes?wilaya_id=${wilayaId}`, { headers: H });
      return await r.json();
    } catch (error) {
      console.error('Ecotrack getCommunes Error:', error);
      return [];
    }
  },

  createShipment: async (order) => {
    try {
      console.log('=== Ecotrack createShipment ===');
      console.log('Order received:', JSON.stringify(order, null, 2));
      
      // إصلاح أسماء الحقول
      const wilayaId = order.wilayaId || order.wilaya_id;
      const shippingType = order.shippingType || order.shipping_type;
      
      const p = new URLSearchParams({
        reference: String(order.id), 
        nom_client: order.customer || '', 
        telephone: order.phone || '', 
        adresse: order.address || '',
        commune: order.commune || '', 
        code_wilaya: String(wilayaId),
        montant: String(parseFloat(order.amount || 0) + parseFloat(order.shipping || 0)),
        produit: order.items?.map(i => `${i.name || i.title} x${i.quantity}`).join(', ') || '', 
        type: '1',
        stop_desk: shippingType === 'stopdesk' ? '1' : '0',
      });

      console.log('URL params:', p.toString());
      
      const r = await fetch(`${URL}/create/order?${p}`, { method: 'POST', headers: H });
      const d = await r.json();
      
      console.log('Ecotrack API Response:', JSON.stringify(d));
      
      if (d.tracking) {
        return { success: true, tracking: d.tracking };
      } else {
        return { success: false, error: d.message || d.error || 'فشل إنشاء الطلب في Ecotrack' };
      }
    } catch (error) {
      console.error('Ecotrack createShipment Error:', error);
      return { success: false, error: error.message };
    }
  },
  
  trackShipment: async (tracking) => {
    try {
      const r = await fetch(`${URL}/get/orders?tracking=${tracking}`, { headers: H });
      return await r.json();
    } catch (error) {
      console.error('Ecotrack trackShipment Error:', error);
      return null;
    }
  },
};