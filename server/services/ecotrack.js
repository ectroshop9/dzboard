const URL = process.env.ECOTRACK_API_URL || 'https://platform.dhd-dz.com/api/v1';
const TOKEN = process.env.ECOTRACK_API_TOKEN || '';
const H = { Authorization: `Bearer ${TOKEN}` };

export const ecotrackService = {
  getFees: () => fetch(`${URL}/get/fees`, { headers: H }).then(r => r.json()),
  createShipment: async (order) => {
    const p = new URLSearchParams({
      reference: String(order.id), nom_client: order.customer, telephone: order.phone, adresse: order.address,
      commune: order.commune||'', code_wilaya: String(order.wilayaId),
      montant: String(parseFloat(order.amount)+parseFloat(order.shipping||0)),
      produit: order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')||'', type: '1',
      stop_desk: order.shippingType === 'stopdesk' ? '1' : '0',
    });
    const r = await fetch(`${URL}/create/order?${p}`, { method: 'POST', headers: H });
    const d = await r.json();
    return d.tracking ? { success: true, tracking: d.tracking } : { success: false, error: d.message };
  },
  trackShipment: (tracking) => fetch(`${URL}/get/orders?tracking=${tracking}`, { headers: H }).then(r => r.json()),
};
