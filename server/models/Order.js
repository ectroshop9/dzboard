import { supabase } from '../supabase.js';

export default {
  getAll: async () => {
    const { data } = await supabase.from('orders').select('*').order('id', { ascending: false });
    return data || [];
  },
  
  create: async (data) => {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer: data.customer,
        phone: data.phone,
        wilaya_id: data.wilayaId,
        commune: data.commune,
        address: data.address,
        shipping_type: data.shippingType,
        items: data.items,
        amount: data.amount,
        shipping: data.shipping,
        status: 'pending',
        tracking: null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // أضف الحقول بالشكلين ليعمل Ecotrack
    return {
      ...order,
      wilayaId: order.wilaya_id,
      shippingType: order.shipping_type
    };
  },
  
  updateStatus: async (id, status, tracking = null) => {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (tracking) updateData.tracking = tracking;
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getByTracking: async (tracking) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking', tracking)
      .single();
    return data;
  },
  
  getById: async (id) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  },
};