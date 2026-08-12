import express from 'express';
const router = express.Router();
import { supabase } from '../supabase.js';

// GET /backup - إنشاء نسخة احتياطية وتنزيلها
router.get('/', async (req, res) => {
  try {
    console.log('Creating backup...');
    
    const [productsResult, itemsResult] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory_items').select('*')
    ]);

    if (productsResult.error) throw productsResult.error;
    if (itemsResult.error) throw itemsResult.error;

    let ordersData = [];
    let requestsData = [];
    
    try {
      const ordersResult = await supabase.from('orders').select('*');
      if (!ordersResult.error) ordersData = ordersResult.data || [];
    } catch (e) {
      console.log('Orders table not found');
    }
    
    try {
      const requestsResult = await supabase.from('special_requests').select('*');
      if (!requestsResult.error) requestsData = requestsResult.data || [];
    } catch (e) {
      console.log('Special requests table not found');
    }

    const backupData = {
      version: '1.0',
      created_at: new Date().toISOString(),
      tables: {
        products: productsResult.data || [],
        inventory_items: itemsResult.data || [],
        orders: ordersData,
        special_requests: requestsData
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup_${new Date().toISOString().split('T')[0]}.json`);
    res.send(JSON.stringify(backupData, null, 2));

  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /backup/restore - استرجاع البيانات
router.post('/restore', async (req, res) => {
  try {
    const backupData = req.body;
    
    if (!backupData || !backupData.tables) {
      return res.status(400).json({ success: false, error: 'بيانات غير صالحة' });
    }

    const { products, inventory_items, orders, special_requests } = backupData.tables;

    if (products && products.length > 0) {
      console.log(`Restoring ${products.length} products...`);
      
      await supabase.from('inventory_items').delete().neq('id', 0);
      await supabase.from('products').delete().neq('id', 0);
      
      for (const product of products) {
        const { id, created_at, updated_at, ...productData } = product;
        
        const cleanProduct = {
          ...productData,
          price: Number(productData.price) || 0,
          stock: Number(productData.stock) || 0
        };
        
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(cleanProduct)
          .select()
          .single();
        
        if (productError) {
          console.error('Product restore error:', productError);
          continue;
        }
        
        if (inventory_items && inventory_items.length > 0) {
          const relatedItems = inventory_items.filter(item => item.product_id === id);
          
          for (const item of relatedItems) {
            const { id: itemId, created_at: itemCreated, updated_at: itemUpdated, product_id, ...itemData } = item;
            
            const cleanItem = {
              ...itemData,
              product_id: newProduct.id,
              sku: itemData.sku || `DZB-${String(newProduct.id).padStart(3, '0')}`,
              barcode: itemData.barcode || `613${String(newProduct.id).padStart(6, '0')}`
            };
            
            await supabase.from('inventory_items').insert(cleanItem);
          }
        }
      }
    }

    if (orders && orders.length > 0) {
      try {
        await supabase.from('orders').delete().neq('id', 0);
        for (const order of orders) {
          const { id, created_at, updated_at, ...orderData } = order;
          await supabase.from('orders').insert(orderData);
        }
      } catch (e) {
        console.log('Orders restore skipped');
      }
    }

    if (special_requests && special_requests.length > 0) {
      try {
        await supabase.from('special_requests').delete().neq('id', 0);
        for (const request of special_requests) {
          const { id, created_at, updated_at, ...requestData } = request;
          await supabase.from('special_requests').insert(requestData);
        }
      } catch (e) {
        console.log('Special requests restore skipped');
      }
    }

    console.log('Restore completed successfully');
    res.json({ success: true, message: 'تم استرجاع البيانات بنجاح' });

  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
