import { supabase } from '../supabase.js'

export default {
  getAll: async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true).order('id', { ascending: false })
    return data || []
  },
  getAllIncludingInactive: async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false })
    return data || []
  },
  getById: async (id) => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    return data
  },
  getByName: async (name) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', name)
      .single();
    return data;
  },
  create: async (product) => {
    const { data } = await supabase.from('products').insert(product).select().single()
    return data
  },
  update: async (id, product) => {
    const { data } = await supabase.from('products').update(product).eq('id', id).select().single()
    return data
  },
  // ✅ دالة الحذف المصححة
  delete: async (id) => {
    try {
      // 1. حذف عناصر المخزون المرتبطة بالمنتج
      await supabase.from('inventory_items').delete().eq('product_id', id);
      
      // 2. حذف المنتج
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Delete exception:', err);
      return false;
    }
  },
}