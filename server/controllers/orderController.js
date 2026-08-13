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
    
    console.log('Order created:', order);
    
    let trackingNumber = null;
    
    try { 
      const r = await ecotrackService.createShipment(order); 
      console.log('Ecotrack Response:', r);
      
      if (r.success && r.tracking) {
        trackingNumber = r.tracking;
        await Order.updateStatus(order.id, 'confirmed', r.tracking);
      }
    } catch (e) { 
      console.error('Ecotrack error:', e);
    }
    
    res.json({ 
      success: true, 
      orderId: order.id, 
      trackingNumber: trackingNumber 
    });
  } catch (e) {
    console.error('Create order error:', e);
    res.json({ success: true, orderId: 0, trackingNumber: null });
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