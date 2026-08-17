import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Package, Monitor, Zap, Cpu, 
  Search, Loader2, Upload, Edit3, X, CheckCircle, AlertCircle,
  Printer, CheckSquare, Square, FileSpreadsheet, Eye, EyeOff
} from 'lucide-react';
import * as XLSX from 'xlsx';

const CATEGORIES = [
  { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
  { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
  { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
  { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const initialForm = { 
    name: '', 
    category: 'tcon', 
    price: '', 
    stock: '1', 
    description: '', 
    image: '', 
    brand: 'generic',
    update_url: ''
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
    if (!localStorage.getItem('dzboard_admin_token')) {
      navigate('/admin');
    } else {
      loadAll(); 
    }
  }, []);

  const showToast = (m, t = 'success') => { 
    setNotification({ message: m, type: t }); 
    setTimeout(() => setNotification(null), 3000); 
  };
  
  const getAuthHeader = () => ({ 
    'Content-Type': 'application/json', 
    Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` 
  });

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()), 
      fetch(`${API}/inventory/items`).then(r => r.json())
    ])
      .then(([a, b]) => { 
        if (a?.success) setProducts(a.products || []); 
        if (b?.success) setItems(b.items || []); 
      })
      .catch((err) => {
        console.error('Load error:', err);
        showToast('حدث خطأ أثناء تحميل البيانات', 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (file) => {
    if (!file) return; 
    setUploading(true);
    const reader = new FileReader(); 
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/products/upload`, { 
          method: 'POST', 
          headers: getAuthHeader(), 
          body: JSON.stringify({ image: reader.result }) 
        });
        const data = await res.json();
        if (data.success) {
          setFormData(p => ({ ...p, image: data.url }));
          showToast('تم رفع الصورة بنجاح');
        } else {
          showToast('فشل رفع الصورة', 'error');
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast('خطأ أثناء رفع الصورة', 'error');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleOpenAdd = () => { 
    setEditingProduct(null); 
    setFormData(initialForm); 
    setShowForm(true); 
  };

  const handleOpenEdit = (p) => { 
    setEditingProduct(p); 
    setFormData({ 
      name: p.name || '', 
      category: p.category || 'tcon', 
      price: p.price || '', 
      stock: p.stock || '1', 
      description: p.description || '', 
      image: p.image || '', 
      brand: p.brand || 'generic',
      update_url: p.update_url || ''
    }); 
    setShowForm(true); 
  };

  const handleSave = async () => {
    if (!formData.name || formData.name.trim() === '') {
      showToast('الاسم مطلوب', 'error');
      return;
    }
    
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('السعر يجب أن يكون رقماً صحيحاً', 'error');
      return;
    }

    setSaving(true);

    try {
      if (editingProduct) {
        const payload = {
          name: formData.name.trim(),
          category: formData.category || 'tcon',
          price: priceNum,
          stock: parseInt(formData.stock, 10) || 0,
          image: formData.image || '',
          brand: formData.brand || 'generic',
          description: formData.description || '',
          update_url: formData.update_url || null
        };

        const res = await fetch(`${API}/products/${editingProduct.id}`, { 
          method: 'PUT', 
          headers: getAuthHeader(), 
          body: JSON.stringify(payload) 
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || data.error || 'فشل التحديث');
        }
      } else {
        const quantityNum = parseInt(formData.stock, 10);
        const validQuantity = isNaN(quantityNum) ? 0 : Math.max(0, quantityNum);
        
        const payload = {
          name: formData.name.trim(),
          category: formData.category || 'tcon',
          brand: formData.brand || 'generic',
          price: priceNum,
          quantity: validQuantity,
          image: formData.image || '',
          description: formData.description || '',
          update_url: formData.update_url || null
        };

        const res = await fetch(`${API}/inventory/items`, { 
          method: 'POST', 
          headers: getAuthHeader(), 
          body: JSON.stringify(payload) 
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || data.error || 'فشل حفظ القطعة');
        }
      }

      showToast('تم الحفظ بنجاح'); 
      setShowForm(false); 
      setEditingProduct(null); 
      loadAll();
    } catch (err) { 
      console.error('Save error:', err);
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error'); 
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => { 
    if (!confirm('هل أنت متأكد من الحذف؟')) return; 
    try {
      const res = await fetch(`${API}/products/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeader() 
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم الحذف بنجاح');
        loadAll(); 
      } else {
        showToast(data.message || 'فشل عملية الحذف', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('خطأ أثناء الاتصال بالخادم', 'error');
    }
  };

  // إخفاء/إظهار المنتج - تم الإصلاح
  const toggleVisibility = async (product) => {
    const newActive = product.active === false ? true : false;
    
    try {
      const res = await fetch(`${API}/products/${product.id}`, { 
        method: 'PUT', 
        headers: getAuthHeader(), 
        body: JSON.stringify({ active: newActive }) 
      });
      const data = await res.json();
      if (data.success) {
        showToast(newActive ? 'تم إظهار المنتج' : 'تم إخفاء المنتج');
        loadAll();
      }
    } catch (err) {
      showToast('خطأ في الاتصال', 'error');
    }
  };

  const handlePrintBarcode = (product, barcodeCode) => {
    const code = barcodeCode || items.find(i => i.product_id === product.id)?.barcode || product.id;
    const printWindow = window.open('', '_blank', 'width=500,height=500');
    printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>${product.name}</title><style>@page{size:auto;margin:0}body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fff}.card{border:2px dashed #000;padding:16px;text-align:center;max-width:280px;border-radius:8px}.title{font-size:16px;font-weight:800;margin-bottom:8px;word-break:break-word}img{width:140px;height:140px}.code{font-size:12px;font-family:monospace;margin-top:4px}.price{font-size:15px;font-weight:700;margin-top:6px;border-top:1px solid #ddd;padding-top:4px}</style></head><body><div class="card"><div class="title">${product.name}</div><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}" /><div class="code">Barcode: ${code}</div><div class="price">${(parseFloat(product.price)||0).toLocaleString('en-US')} دج</div></div><script>setTimeout(()=>{window.print();window.close()},500)</script></body></html>`);
    printWindow.document.close();
  };

  const toggleSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedProducts.length === 0) {
      showToast('اختر منتجات للطباعة أولاً', 'error');
      return;
    }
    
    const selected = products.filter(p => selectedProducts.includes(p.id));
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    let barcodesHTML = '';
    
    selected.forEach((product) => {
      const barcode = items.find(i => i.product_id === product.id)?.barcode || product.id;
      
      barcodesHTML += `
        <div class="barcode-item">
          <div class="title">${product.name}</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${barcode}" />
          <div class="code">${barcode}</div>
          <div class="price">${(parseFloat(product.price)||0).toLocaleString('en-US')} دج</div>
        </div>
      `;
    });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>طباعة الباركودات المحددة - ${selected.length} منتج</title>
          <style>
            @page{size:auto;margin:10mm}
            body{font-family:system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}
            .barcode-item{border:1px dashed #000;padding:10px;text-align:center;border-radius:8px;page-break-inside:avoid}
            .title{font-size:12px;font-weight:800;margin-bottom:6px;word-break:break-word}
            img{width:100px;height:100px}
            .code{font-size:10px;font-family:monospace;margin-top:4px}
            .price{font-size:12px;font-weight:bold;margin-top:4px;border-top:1px solid #ddd;padding-top:4px}
            @media print {
              body{grid-template-columns:repeat(3,1fr)}
              .barcode-item{page-break-inside:avoid}
            }
          </style>
        </head>
        <body>
          ${barcodesHTML}
          <script>
            setTimeout(()=>{window.print();window.close()},1000)
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setSelectedProducts([]);
  };

  const handlePrintAllBarcodes = () => {
    if (!products.length) {
      showToast('لا توجد منتجات للطباعة', 'error');
      return;
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    let barcodesHTML = '';
    
    products.forEach((product) => {
      const barcode = items.find(i => i.product_id === product.id)?.barcode || product.id;
      
      barcodesHTML += `
        <div class="barcode-item">
          <div class="title">${product.name}</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${barcode}" />
          <div class="code">${barcode}</div>
          <div class="price">${(parseFloat(product.price)||0).toLocaleString('en-US')} دج</div>
        </div>
      `;
    });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>جميع الباركودات - ${products.length} منتج</title>
          <style>
            @page{size:auto;margin:10mm}
            body{font-family:system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}
            .barcode-item{border:1px dashed #000;padding:10px;text-align:center;border-radius:8px;page-break-inside:avoid}
            .title{font-size:12px;font-weight:800;margin-bottom:6px;word-break:break-word}
            img{width:100px;height:100px}
            .code{font-size:10px;font-family:monospace;margin-top:4px}
            .price{font-size:12px;font-weight:bold;margin-top:4px;border-top:1px solid #ddd;padding-top:4px}
            @media print {
              body{grid-template-columns:repeat(3,1fr)}
              .barcode-item{page-break-inside:avoid}
            }
          </style>
        </head>
        <body>
          ${barcodesHTML}
          <script>
            setTimeout(()=>{window.print();window.close()},1000)
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    if (!products.length) {
      showToast('لا توجد منتجات للتصدير', 'error');
      return;
    }
    
    const data = products.map(p => ({
      'ID': p.id,
      'الاسم': p.name,
      'التصنيف': getCat(p.category).label,
      'السعر (دج)': parseFloat(p.price) || 0,
      'المخزون': parseInt(p.stock) || 0,
      'الباركود': items.find(i => i.product_id === p.id)?.barcode || '-',
      'الحالة': p.active === false ? 'مخفي' : 'ظاهر',
      'تاريخ الإضافة': formatDate(p.created_at),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
    
    ws['!cols'] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
    ];
    
    XLSX.writeFile(wb, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('تم تصدير المنتجات بنجاح');
  };

  const getCat = (k) => CATEGORIES.find(c => c.key === k) || { label: k, color: '#94a3b8' };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'غير محدد';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const filtered = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) && 
    (selectedCategory === 'all' || p.category === selectedCategory)
  );

  const totalStock = products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 100, fontFamily: 'system-ui' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>المنتجات والمخزون</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleExportExcel} style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <FileSpreadsheet size={16} /> تصدير Excel
            </button>
            {selectedProducts.length > 0 && (
              <button onClick={handlePrintSelected} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                <Printer size={16} /> طباعة المحدد ({selectedProducts.length})
              </button>
            )}
            <button onClick={handlePrintAllBarcodes} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Printer size={16} /> طباعة الكل
            </button>
            <button onClick={handleOpenAdd} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> إضافة منتج
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <input className="field-input" placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select className="field-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input className="field-input" type="number" placeholder="السعر *" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="field-input" type="number" placeholder="المخزون *" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              <input className="field-input" placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <input className="field-input" placeholder="رابط التحديث (اختياري)" value={formData.update_url} onChange={e => setFormData({...formData, update_url: e.target.value})} />
              <textarea className="field-input" placeholder="وصف المنتج (اختياري)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} style={{ gridColumn: '1 / -1' }} />
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#f1f5f9', borderRadius: 8, fontWeight: 600, fontSize: 13, width: 'fit-content' }}>
                <Upload size={14} /> {uploading ? 'جاري...' : 'رفع صورة'}
                <input type="file" accept="image/*" hidden onChange={e => handleImageUpload(e.target.files[0])} />
              </label>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">إلغاء</button>
              <button onClick={handleSave} className="btn btn-accent btn-sm" disabled={saving}>
                <Save size={14} /> {saving ? 'جاري...' : 'حفظ'}
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center' }}>
            <button onClick={() => setSelectedCategory('all')} className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>الكل ({products.length})</button>
            {CATEGORIES.map(c => <button key={c.key} onClick={() => setSelectedCategory(c.key)} className={`btn ${selectedCategory === c.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{c.label}</button>)}
            <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', whiteSpace: 'nowrap', padding: '4px 8px', background: '#ecfdf5', borderRadius: 8 }}>
              المخزون: {totalStock}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input className="field-input" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(product => {
              const catObj = getCat(product.category);
              const barcode = items.find(i => i.product_id === product.id)?.barcode;
              const isSelected = selectedProducts.includes(product.id);
              const isVisible = product.active === false ? false : true;
              return (
                <div key={product.id} className="card" style={{ padding: 16, position: 'relative', border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', opacity: isVisible ? 1 : 0.5 }}>
                  <button 
                    onClick={() => toggleSelect(product.id)}
                    style={{ 
                      position: 'absolute', 
                      top: 10, 
                      left: 10, 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: isSelected ? '#3b82f6' : '#94a3b8',
                      zIndex: 2
                    }}
                  >
                    {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                  </button>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <img 
                      src={product.image || 'https://via.placeholder.com/60'} 
                      style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', cursor: 'zoom-in' }} 
                      alt={product.name} 
                      onClick={() => product.image && setZoomedImage(product.image)}
                      onPointerUp={() => product.image && setZoomedImage(product.image)}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${catObj.color}15`, color: catObj.color, fontWeight: 700 }}>{catObj.label}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, margin: '4px 0' }}>{product.name}</h4>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>المخزون: <strong>{product.stock || 0}</strong></span>
                      <span style={{ fontSize: 11, color: isVisible ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {isVisible ? '👁️ ظاهر' : '🚫 مخفي'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleVisibility(product)} className="btn btn-ghost btn-sm" title={isVisible ? 'إخفاء' : 'إظهار'} style={{ color: isVisible ? '#10b981' : '#f59e0b' }}>
                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => handlePrintBarcode(product, barcode)} className="btn btn-ghost btn-sm" title="طباعة">🖨️</button>
                      <button onClick={() => handleOpenEdit(product)} className="btn btn-ghost btn-sm" style={{ color: '#2563eb' }}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          onPointerUp={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            cursor: 'zoom-out',
            touchAction: 'manipulation'
          }}
        >
          <img 
            src={zoomedImage} 
            alt="تكبير"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', pointerEvents: 'none' }}
          />
        </div>
      )}
    </div>
  );
}