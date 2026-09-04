import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// ✅ كاش للمخزون
const CACHE_DURATION = 5 * 60 * 1000;

router.get('/items', async (req, res) => {
  try {
    const cacheKey = 'inventory_items_all';
    
    // جلب من الكاش
    const { data: cached } = await supabase
      .from('cache')
      .select('*')
      .eq('id', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && cached.data) {
      return res.json(cached.data);
    }

    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    // ✅ جلب كل المنتجات دفعة واحدة
    const productIds = [...new Set((items || []).map(i => i.product_id).filter(Boolean))];
    
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, image, price, update_url')
        .in('id', productIds);

      const productMap = {};
      (products || []).forEach(p => { productMap[p.id] = p; });

      (items || []).forEach(item => {
        const product = productMap[item.product_id];
        if (product) {
          item.image = product.image;
          item.price = product.price;
          item.update_url = product.update_url;
        }
      });
    }

    const response = { success: true, items: items || [] };
    
    // حفظ في الكاش
    await supabase.from('cache').upsert({
      id: cacheKey,
      data: response,
      expires_at: new Date(Date.now() + CACHE_DURATION).toISOString()
    });

    res.json(response);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    
    const cleanQuery = query.trim();
    
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .or(`barcode.eq."${cleanQuery}",sku.eq."${cleanQuery}"`)
      .limit(1);
    
    if (error) throw error;
    
    if (items && items.length > 0) {
      const item = items[0];
      
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('image,price,update_url')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          item.image = product.image;
          item.price = product.price;
          item.update_url = product.update_url;
        }
      }
      
      return res.json({ success: true, item });
    }
    
    return res.json({ success: false, error: 'Not found' });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { name, price, quantity, category, brand, image, update_url } = req.body;
    
    const cleanName = String(name || '').trim();
    const cleanPrice = Number(price) || 0;
    const cleanQuantity = Math.max(0, Number(quantity) || 0);
    
    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: cleanName,
        price: cleanPrice,
        stock: cleanQuantity,
        active: true,
        category: category || 'parts',
        brand: brand || 'generic',
        image: image || '',
        description: '',
        update_url: update_url || null
      })
      .select()
      .single();

    if (productError) throw productError;

    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    let currentCount = count || 0;
    const newItems = [];
    const timestamp = Date.now().toString().slice(-6);

    for (let i = 0; i < cleanQuantity; i++) {
      currentCount++;
      newItems.push({
        sku: `DZB-${String(currentCount).padStart(3, '0')}-${timestamp}`,
        barcode: `613${timestamp}${String(i).padStart(2, '0')}`,
        name: cleanName,
        product_id: product.id,
        status: 'available',
        notes: '',
        image: image || ''
      });
    }

    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) throw itemsError;

    // ✅ مسح الكاش بعد الإضافة
    await supabase.from('cache').delete().eq('id', 'inventory_items_all');

    res.json({ success: true, items, product });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/items/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const itemId = parseInt(req.params.id, 10);
    
    if (!itemId || !status) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }
    
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id,product_id,status')
      .eq('id', itemId)
      .single();
    
    if (!itemError && item) {
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory_items')
        .update({ status })
        .eq('id', itemId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          if (status === 'sold' && item.status === 'available') {
            await supabase
              .from('products')
              .update({ stock: Math.max(0, (product.stock || 0) - 1) })
              .eq('id', item.product_id);
          } else if (status === 'available' && item.status === 'sold') {
            await supabase
              .from('products')
              .update({ stock: (product.stock || 0) + 1 })
              .eq('id', item.product_id);
          }
        }
      }

      // ✅ مسح الكاش
      await supabase.from('cache').delete().eq('id', 'inventory_items_all');
      
      return res.json({ success: true, item: updatedItem });
    }
    
    return res.status(404).json({ success: false, error: 'Item not found' });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
