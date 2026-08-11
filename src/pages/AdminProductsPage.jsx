import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Package, ChevronLeft, Monitor, Zap, Cpu, 
  Search, Loader2, Upload, Edit3, X, RefreshCw, CheckCircle, AlertCircle, Printer,
  Lock, LayoutDashboard, ClipboardList, ScanLine, FileText, Settings
} from 'lucide-react';

const CATEGORIES = [
  { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
  { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
  { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
  { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  const initialForm = { name: '', category: 'tcon', price: '', stock: '1', description: '', image: '', shelf: '' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
    if (!localStorage.getItem('dzboard_admin_token')) {
      navigate('/admin');
    } else {
      loadAll(); 
    }
  }, [navigate]);

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
      .catch(() => showToast('حدث خطأ أثناء جلب البيانات', 'error'))
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
          showToast('فشل الرفع', 'error');
        }
      } catch {
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      showToast('خطأ في قراءة الملف', 'error');
      setUploading(false);
    };
  };

  const handleOpenAdd = () => { setEditingProduct(null); setFormData(initialForm); setShowForm(true); };
  const handleOpenEdit = (p) => { 
    setEditingProduct(p); 
    setFormData({ 
      name: p.name || '', 
      category: p.category || 'tcon', 
      price: p.price || '', 
      stock: p.stock || '1', 
      description: p.description || '', 
      image: p.image || '', 
      shelf: p.shelf || '' 
    }); 
    setShowForm(true); 
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) { showToast('الاسم والسعر مطلوبان', 'error'); return; }
    setSaving(true);
    try {
      if (editingProduct) {
        await fetch(`${API}/products/${editingProduct.id}`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(formData) });
      } else {
        const res = await fetch(`${API}/products`, { method: 'POST', headers: getAuthHeader(), body: JSON.stringify(formData) });
        const prod = await res.json();
        const stockCount = parseInt(formData.stock, 10);
        
        if (prod.success && stockCount > 0) {
          for (let i = 0; i < stockCount; i++) {
            await fetch(`${API}/inventory/items`, { 
              method: 'POST', 
              headers: getAuthHeader(), 
              body: JSON.stringify({ 
                name: formData.name, 
                shelf: formData.shelf, 
                position: i + 1, 
                price: formData.price, 
                image: formData.image, 
                product_id: prod.product?.id 
              }) 
            });
          }
        }
      }
      showToast('تم الحفظ بنجاح'); 
      setShowForm(false); 
      setEditingProduct(null); 
      loadAll();
    } catch { 
      showToast('خطأ أثناء عملية الحفظ', 'error'); 
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => { 
    if (!window.confirm('هل أنت تأكد من إتمام عملية الحذف؟')) return; 
    try {
      await fetch(`${API}/products/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeader()
      }); 
      showToast('تم الحذف بنجاح');
      loadAll();
    } catch {
      showToast('فشل في الحذف', 'error');
    }
  };

  const handlePrintBarcode = (product, barcodeCode) => {
    const code = barcodeCode || product.id;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}`;
    
    const printWindow = window.open('', '_blank', 'width=500,height=500');
    if (!printWindow) return alert('يرجى السماح بفتح النوافذ المنبثقة للطباعة');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>طباعة باركود - ${product.name}</title>
        <style>
          @page { size: auto; margin: 0mm; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #fff;
          }
          .barcode-card {
            border: 2px dashed #000;
            padding: 16px;
            text-align: center;
            max-width: 280px;
            width: 100%;
            border-radius: 8px;
            box-sizing: border-box;
          }
          .title {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 8px;
            color: #000;
            word-break: break-word;
          }
          .qr-img {
            width: 140px;
            height: 140px;
            margin: 4px 0;
          }
          .code {
            font-size: 12px;
            color: #333;
            font-family: monospace;
            letter-spacing: 1px;
            margin-top: 4px;
          }
          .price {
            font-size: 15px;
            font-weight: bold;
            color: #000;
            margin-top: 6px;
            border-top: 1px solid #ddd;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="barcode-card">
          <div class="title">${product.name}</div>
          <img class="qr-img" src="${qrUrl}" alt="QR Code" />
          <div class="code">ID: ${code}</div>
          <div class="price">السعر: ${(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCat = (k) => CATEGORIES.find(c => c.key === k) || { label: k, color: '#64748b' };

  const itemBarcodeMap = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      if (item.product_id && item.barcode) {
        if (!map.has(item.product_id)) map.set(item.product_id, []);
        map.get(item.product_id).push(item.barcode.toLowerCase());
      }
    });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = (p.name || '').toLowerCase().includes(query);
      const barcodes = itemBarcodeMap.get(p.id) || [];
      const hasMatchingBarcode = barcodes.some(b => b.includes(query));

      return matchesCategory && (matchesName || hasMatchingBarcode);
    });
  }, [products, selectedCategory, searchQuery, itemBarcodeMap]);

  // عناصر القائمة السفلية المعتمدة حرفياً
  const navItems = [
    { label: 'تسجيل الدخول', path: '/admin/login', icon: Lock },
    { label: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات والمخزون', path: '/admin/products', icon: Package },
    { label: 'إدارة الطلبات', path: '/admin/orders', icon: ClipboardList },
    { label: 'مسح الباركود', path: '/admin/scan', icon: ScanLine },
    { label: 'طلبات الزبائن', path: '/admin/requests', icon: FileText },
    { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 80, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Notification Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <ChevronLeft size={18} />
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>المنتجات والمخزون</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadAll} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> تحديث
            </button>
            <button onClick={handleOpenAdd} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> إضافة منتج
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        
        {/* Form Modal / Overlay */}
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} type="number" placeholder="السعر *" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} type="number" placeholder="الكمية" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} disabled={!!editingProduct} />
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} placeholder="الرف" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} />
              <input style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', background: '#f1f5f9', border: '1px dashed #94a3b8', borderRadius: 8, fontWeight: 600, fontSize: 13, height: '38px' }}>
                <Upload size={14} /> {uploading ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}
                <input type="file" accept="image/*" hidden onChange={e => handleImageUpload(e.target.files[0])} />
              </label>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#475569' }}>إلغاء</button>
              <button onClick={handleSave} disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} حفظ البيانات
              </button>
            </div>
          </div>
        )}

        {/* Filter and Search controls */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, maxWidth: '100%' }}>
            <button onClick={() => setSelectedCategory('all')} style={{ background: selectedCategory === 'all' ? '#2563eb' : '#f1f5f9', color: selectedCategory === 'all' ? '#fff' : '#475569', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
              الكل ({products.length})
            </button>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setSelectedCategory(c.key)} style={{ background: selectedCategory === c.key ? '#2563eb' : '#f1f5f9', color: selectedCategory === c.key ? '#fff' : '#475569', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {c.label}
              </button>
            ))}
          </div>
          
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13 }} placeholder="البحث برقم الباركود أو اسم المنتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {/* Grid display */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 10px' }} />
            <div>جاري تحميل المنتجات...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', color: '#64748b' }}>
            لا توجد منتجات تطابق البحث
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map(product => {
              const catObj = getCat(product.category);
              const barcode = items.find(i => i.product_id === product.id)?.barcode;

              return (
                <div key={product.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <img src={product.image || 'https://via.placeholder.com/60?text=No+Image'} alt={product.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', background: '#f8fafc', border: '1px solid #f1f5f9' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${catObj.color}15`, color: catObj.color, fontWeight: 800, display: 'inline-block' }}>{catObj.label}</span>
                        <h4 style={{ fontSize: 14, fontWeight: 800, margin: '4px 0', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.name}>{product.name}</h4>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#d97706' }}>{(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>المخزون: <strong style={{ color: '#0f172a' }}>{product.stock || 0}</strong></span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handlePrintBarcode(product, barcode)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#334155' }} title="طباعة ملصق الباركود">
                        <Printer size={15} />
                      </button>
                      <button onClick={() => handleOpenEdit(product)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#2563eb' }} title="تعديل">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }} title="حذف">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* الشريط السفلي المعتمد بالكامل (Mobile Bottom Navigation) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 65,
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        zIndex: 50,
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              color: isActive ? '#2563eb' : '#64748b',
              fontSize: 10,
              fontWeight: isActive ? 800 : 500,
              minWidth: 72,
              flex: 1,
              padding: '4px 0'
            }}>
              <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
              <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}