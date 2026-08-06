import dotenv from 'dotenv';
dotenv.config();

const ECOTRACK_URL = process.env.ECOTRACK_API_URL || 'https://platform.dhd-dz.com/api/v1';
const ECOTRACK_TOKEN = process.env.ECOTRACK_API_TOKEN || '';

export const ecotrackService = {
  // جلب التعريفات
  getFees: async () => {
    try {
      const response = await fetch(`${ECOTRACK_URL}/get/fees`, {
        headers: { 'Authorization': `Bearer ${ECOTRACK_TOKEN}` },
      });
      return await response.json();
    } catch (error) {
      console.error('getFees error:', error);
      return null;
    }
  },

  // إنشاء طلب
  createShipment: async (order) => {
    try {
      const productsText = order.items?.map(item => `${item.name} x${item.quantity}`).join(', ') || '';
      
      const params = new URLSearchParams({
        reference: String(order.id),
        nom_client: order.customer,
        telephone: order.phone,
        telephone_2: '',
        adresse: order.address,
        commune: order.commune || '',
        code_wilaya: String(order.wilayaId),
        montant: String(parseFloat(order.amount) + parseFloat(order.shipping || 0)),
        remarque: order.notes || '',
        produit: productsText,
        type: '1',
        stop_desk: order.shippingType === 'stopdesk' ? '1' : '0',
      });

      const response = await fetch(`${ECOTRACK_URL}/create/order?${params.toString()}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ECOTRACK_TOKEN}` },
      });

      const data = await response.json();
      
      if (data.tracking) {
        return { success: true, tracking: data.tracking, ecotrackId: data.id };
      }
      
      return { success: false, error: data.message || 'فشل إنشاء الشحنة' };
    } catch (error) {
      console.error('createShipment error:', error);
      return { success: false, error: 'خطأ في الاتصال' };
    }
  },

  // تتبع شحنة
  trackShipment: async (tracking) => {
    try {
      const response = await fetch(`${ECOTRACK_URL}/get/orders?tracking=${tracking}`, {
        headers: { 'Authorization': `Bearer ${ECOTRACK_TOKEN}` },
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },
};
