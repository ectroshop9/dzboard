import Order from '../models/Order.js';
import { ecotrackService } from '../services/ecotrack.js';

export const getAll = (req, res) => {
  try {
    res.json({ success: true, orders: Order.getAll() });
  } catch (e) {
    res.json({ success: true, orders: [] });
  }
};

export const create = async (req, res) => {
  try {
    const { full_name, phone, wilaya_id, commune, address, shipping_type, items, total_price, shipping_cost } = req.body;
    if (!full_name || !phone || !wilaya_id) return res.status(400).json({ success: false, message: 'حقول ناقصة' });
    
    const order = Order.create({ customer: full_name, phone, wilayaId: wilaya_id, commune, address, shippingType: shipping_type, items, amount: total_price, shipping: shipping_cost });
    
    try { const r = await ecotrackService.createShipment(order); if (r.success) Order.updateStatus(order.id, 'confirmed', r.tracking); } catch (e) {}
    
    res.json({ success: true, orderId: order.id, trackingNumber: order.tracking });
  } catch (e) {
    res.json({ success: true, orderId: 0, trackingNumber: null });
  }
};

export const updateStatus = (req, res) => {
  try {
    const o = Order.updateStatus(parseInt(req.params.id), req.body.status);
    res.json({ success: true, order: o });
  } catch (e) {
    res.json({ success: false });
  }
};
