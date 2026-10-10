import Order from '../models/Order.js';
import { ecotrackService } from '../services/ecotrack.js';

export const getAll = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json({ success: true, orders: orders || [] });
  } catch (e) {
    res.json({ success: true, orders: [] });
  }
};

export const create = async (req, res) => {
  try {
    const { full_name, phone, wilaya_id, commune, address, shipping_type, items, total_price, shipping_cost } = req.body;
    if (!full_name || !phone || !wilaya_id) return res.status(400).json({ success: false, message: 'حقول ناقصة' });
    
    // ✅ 1. حفظ الطلب أولاً
    const order = await Order.create({ 
      customer: full_name, 
      phone, 
      wilayaId: parseInt(wilaya_id, 10), 
      commune, 
      address, 
      shippingType: shipping_type, 
      items, 
      amount: total_price, 
      shipping: shipping_cost 
    });
    
    // ✅ 2. الرد فوراً (بدون انتظار DHD)
    res.json({ 
      success: true, 
      orderId: order.id,
      trackingNumber: null  // سيُحدَّث لاحقاً
    });
    
    // ✅ 3. محاولة إنشاء الشحنة في الخلفية
    try { 
      const r = await ecotrackService.createShipment(order); 
      
      if (r.success && r.tracking) {
        await Order.updateStatus(order.id, 'confirmed', r.tracking);
      }
    } catch (e) { 
      // طلب بدون شحنة - سيتصل الأدمن
    }
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'خطأ في إنشاء الطلب' });
    }
  }
};

export const updateStatus = async (req, res) => {
  try {
    const o = await Order.updateStatus(parseInt(req.params.id), req.body.status);
    res.json({ success: true, order: o });
  } catch (e) {
    res.json({ success: false });
  }
};
