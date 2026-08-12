import { supabase } from '../supabase.js'

export default {
  getAll: async () => {
    const { data } = await supabase.from('products').select('*').eq('active', true).order('id', { ascending: false })
    return data || []
  },
  getById: async (id) => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    return data
  },
  create: async (product) => {
    const { data } = await supabase.from('products').insert(product).select().single()
    return data
  },
  update: async (id, product) => {
    const { data } = await supabase.from('products').update(product).eq('id', id).select().single()
    return data
  },
  delete: async (id) => {
    await supabase.from('products').update({ active: false }).eq('id', id)
    return true
  },
}