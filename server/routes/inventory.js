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
      query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    // دمج تفاصيل المنتج
    const enrichedItems = [];
    for (let item of (items || [])) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('image,price')
          .eq('id', item.product_id)
          .single();
          
        if (product) {
          item.image = product.image;
          item.price = product.price;
        }
      }
      enrichedItems.push(item);
    }

    res.json({ success: true, items: enrichedItems });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /items - إضافة قطعة أو أكثر
router.post('/items', async (req, res) => {
  try {
    console.log('Received body:', req.body);

    // استقبال البيانات مع تنظيفها
    const name = req.body.name?.trim() || '';
    const category = req.body.category || 'parts';
    const brand = req.body.brand || 'generic';
    const image = req.body.image || '';
    
    // تحويل القيم الرقمية بأمان - هذا هو الحل الأساسي
    const price = Number(req.body.price) || 0;
    const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    
    // التحقق من الاسم
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name is required' 
      });
    }

    // إنشاء المنتج
    const productData = {
      name: name,
      price: price,
      stock: quantity,
      active: true,
      category: category,
      brand: brand,
      image: image,
      description: ''
    };

    console.log('Inserting product:', productData);

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      console.error('Product insert error:', productError);
      return res.status(500).json({ 
        success: false, 
        error: productError.message,
        details: productError.details 
      });
    }

    // جلب العدد الحالي للقطع
    const { count, error: countError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({ 
        success: false, 
        error: countError.message 
      });
    }

    let currentCount = count || 0;
    const newItems = [];

    // إنشاء القطع
    for (let i = 0; i < quantity; i++) {
      currentCount++;
      newItems.push({
        sku: `DZB-${String(currentCount).padStart(3, '0')}`,
        barcode: `613${String(currentCount).padStart(6, '0')}`,
        name: name,
        shelf: '',
        position: '',
        image: image,
        product_id: product.id,
        status: 'available'
      });
    }

    console.log('Creating items:', newItems.length);

    // حفظ القطع
    const { data: items, error: itemsError } = await supabase
      .from('inventory_items')
      .insert(newItems)
      .select();

    if (itemsError) {
      console.error('Items insert error:', itemsError);
      return res.status(500).json({ 
        success: false, 
        error: itemsError.message,
        details: itemsError.details 
      });
    }

    res.json({ 
      success: true, 
      items, 
      product 
    });

  } catch (err) {
    console.error('Server error:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
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
    const itemId = req.params.id;
    
    if (!itemId || isNaN(parseInt(itemId, 10))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid item ID' 
      });
    }
    
    // جلب الحالة القديمة
    const { data: old, error: oldError } = await supabase
      .from('inventory_items')
      .select('product_id,status')
      .eq('id', itemId)
      .single();

    if (oldError) {
      console.error('Fetch old item error:', oldError);
      return res.status(500).json({ 
        success: false, 
        error: oldError.message 
      });
    }

    // تحديث حالة القطعة
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update({ status })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Update item error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    // مزامنة المخزون
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
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;