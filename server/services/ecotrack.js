const ECOTRACK_URL = process.env.ECOTRACK_API_URL || 'https://platform.dhd-dz.com/api/v1';
const ECOTRACK_TOKEN = process.env.ECOTRACK_API_TOKEN || '';

exports.ecotrackService = {
  getFees: () => fetch(`${ECOTRACK_URL}/get/fees`, { headers: { Authorization: `Bearer ${ECOTRACK_TOKEN}` } }).then(r => r.json()),
  createShipment: async (order) => {
    const p = new URLSearchParams({
      reference: String(order.id), nom_client: order.customer, telephone: order.phone, adresse: order.address,
      commune: order.commune || '', code_wilaya: String(order.wilayaId),
      montant: String(parseFloat(order.amount) + parseFloat(order.shipping||0)),
      remarque: order.notes||'', produit: order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')||'',
      type: '1', stop_desk: order.shippingType === 'stopdesk' ? '1' : '0',
    });
    const r = await fetch(`${ECOTRACK_URL}/create/order?${p}`, { method: 'POST', headers: { Authorization: `Bearer ${ECOTRACK_TOKEN}` } });
    const d = await r.json();
    return d.tracking ? { success: true, tracking: d.tracking } : { success: false, error: d.message };
  },
  trackShipment: (tracking) => fetch(`${ECOTRACK_URL}/get/orders?tracking=${tracking}`, { headers: { Authorization: `Bearer ${ECOTRACK_TOKEN}` } }).then(r => r.json()),
};
