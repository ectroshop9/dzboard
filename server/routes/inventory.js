import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /items - جلب القطع وإضافة تفاصيل المنتج المربوط بها
router.get('/items', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('id', { ascending: false });
    
    if (search) {
      const cleanSearch = search.trim();
      query = query.or(`sku.eq.${cleanSearch},barcode.eq.${cleanSearch},name.ilike.%${cleanSearch}%`);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    // دمج تفاصيل المنتج مع كل قطعة مخزون
    for (let item of (items || [])) {
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
    }

    res.json({ success: true, items: items || [] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /search - بحث شامل عن قطعة أو منتج
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
      .or(`barcode.eq.${cleanQuery},sku.eq.${cleanQuery},id.eq.${cleanQuery},product_id.eq.${cleanQuery}`)
      .limit(1);
    
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
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
    
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', cleanQuery)
      .limit(1);
    
    if (productError) {
      return res.status(500).json({ success: false, error: productError.message });
    }
    
    if (products && products.length > 0) {
      const product = products[0];
      
      const { data: relatedItems } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('product_id', product.id)
        .limit(1);
      
      if (relatedItems && relatedItems.length > 0) {
        return res.json({ success: true, item: relatedItems[0] });
      }
      
      return res.json({ 
        success: true, 
        item: {
          ...product,
          product_id: product.id,
          sku: '-',
          barcode: '-',
          shelf: '-',
          status: 'available'
        }
      });
    }
    
    return res.json({ success: false, error: 'Not found' });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /items - إضافة قطعة أو أكثر مع update_url
router.post('/items', async (req, res) => {
  try {
    const { name, price, quantity, category, brand, image, update_url } = req.body;
    
    const cleanName = String(name || '').trim();
    const cleanPrice = Number(price) || 0;
    const cleanQuantity = Math.max(0, Number(quantity) || 0);
    
    if (!cleanName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name is required' 
      });
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

    if (productError) {
      return res.status(500).json({ 
        success: false, 
        error: productError.message 
      });
    }

    const { count, error: countError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return res.status(500).json({ 
        success: false, 
        error: countError.message 
      });
    }

    let currentCount = count || 0;
    const newItems = [];

    for (let i = 0; i < cleanQuantity; i++) {
      currentCount++;
      const sku = `DZB-${String(currentCount).padStart(3, '0')}`;
      const barcode = `613${String(currentCount).padStart(6, '0')}`;

      newItems.push({
        sku,
        barcode,
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

    if (itemsError) {
      return res.status(500).json({ 
        success: false, 
        error: itemsError.message 
      });
    }

    res.json({ 
      success: true, 
      items, 
      product 
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// PUT /items/:id - تحديث حالة القطعة
router.put('/items/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const itemId = parseInt(req.params.id, 10);
    
    if (!itemId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid item ID' 
      });
    }
    
    const { data: old, error: oldError } = await supabase
      .from('inventory_items')
      .select('product_id,status')
      .eq('id', itemId)
      .single();

    if (oldError) {
      return res.status(500).json({ 
        success: false, 
        error: oldError.message 
      });
    }

    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    if (old?.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', old.product_id)
        .single();

      if (product) {
        if (status === 'sold' && old.status === 'available') {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, (product.stock || 0) - 1) })
            .eq('id', old.product_id);
        } else if (status === 'available' && old.status === 'sold') {
          await supabase
            .from('products')
            .update({ stock: (product.stock || 0) + 1 })
            .eq('id', old.product_id);
        }
      }
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// PUT /items/:id/status - تحديث حالة قطعة أو منتج
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
      
      if (updateError) {
        return res.status(500).json({ success: false, error: updateError.message });
      }
      
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
      
      return res.json({ success: true, item: updatedItem });
    }
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (!productError && product) {
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ active: status === 'available' })
        .eq('id', itemId)
        .select()
        .single();
      
      if (updateError) {
        return res.status(500).json({ success: false, error: updateError.message });
      }
      
      return res.json({ 
        success: true, 
        item: {
          ...updatedProduct,
          product_id: updatedProduct.id,
          sku: '-',
          barcode: '-',
          status: status
        }
      });
    }
    
    return res.status(404).json({ success: false, error: 'Item not found' });
    
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;