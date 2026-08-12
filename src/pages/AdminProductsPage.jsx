import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Package, Monitor, Zap, Cpu, 
  Search, Loader2, Upload, Edit3, X, CheckCircle, AlertCircle,
  LayoutDashboard, ClipboardList, ScanLine, FileText
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
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const initialForm = { 
    name: '', 
    category: 'tcon', 
    price: '', 
    stock: '1', 
    description: '', 
    image: '', 
    shelf: '', 
    position: '',
    brand: 'generic'
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { 
    if (!localStorage.getItem('dzboard_admin_token')) navigate('/admin'); 
    else loadAll(); 
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
      .catch(() => showToast('حدث خطأ أثناء تحميل البيانات', 'error'))
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
        if (data.success) setFormData(p => ({ ...p, image: data.url })); 
        else showToast('فشل رفع الصورة', 'error');
      } catch {
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
    
    // العثور على مكان الرف والوضعية من القطعة المرتبطة بها
    const relatedItem = items.find(i => i.product_id === p.id);

    setFormData({ 
      name: p.name || '', 
      category: p.category || 'tcon', 
      price: p.price || '', 
      stock: p.stock || '1', 
      description: p.description || '', 
      image: p.image || '', 
      shelf: relatedItem?.shelf || '',
      position: relatedItem?.position || '',
      brand: p.brand || 'generic'
    }); 
    setShowForm(true); 
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) { 
      showToast('الاسم والسعر مطلوبان', 'error'); 
      return; 
    }

    try {
      if (editingProduct) {
        // 1. تحديث منتج موجود في جدول products
        const res = await fetch(`${API}/products/${editingProduct.id}`, { 
          method: 'PUT', 
          headers: getAuthHeader(), 
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price) || 0,
            image: formData.image,
            brand: formData.brand,
            description: formData.shelf ? `${formData.shelf} - ${formData.position || ''}` : ''
          }) 
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // 2. إضافة منتج جديد وقطع المخزون المرافقة له
        const res = await fetch(`${API}/inventory/items`, { 
          method: 'POST', 
          headers: getAuthHeader(), 
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            brand: formData.brand,
            price: parseFloat(formData.price) || 0,
            quantity: Math.max(1, parseInt(formData.stock, 10) || 1),
            shelf: formData.shelf,
            position: formData.position,
            image: formData.image
          }) 
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'فشل حفظ القطعة');
      }

      showToast('تم الحفظ بنجاح'); 
      setShowForm(false); 
      setEditingProduct(null); 
      loadAll();
    } catch (err) { 
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error'); 
    }
  };

  const handleDelete = async (id) => { 
    if (!confirm('هل أنت تأكد من الحذف؟')) return; 
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: getAuthHeader() });
      const data = await res.json();
      if (data.success) {
        showToast('تم الحذف بنجاح');
        loadAll(); 
      } else {
        showToast('فشل عملية الحذف', 'error');
      }
    } catch {
      showToast('خطأ أثناء الاتصال بالخادم', 'error');
    }
  };

  const handlePrintBarcode = (product, barcodeCode) => {
    const code = barcodeCode || product.id;
    const printWindow = window.open('', '_blank', 'width=500,height=500');
    printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>${product.name}</title><style>@page{size:auto;margin:0}body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#fff}.card{border:2px dashed #000;padding:16px;text-align:center;max-width:280px;border-radius:8px}.title{font-size:16px;font-weight:800;margin-bottom:8px;word-break:break-word}img{width:140px;height:140px}.code{font-size:12px;font-family:monospace;margin-top:4px}.price{font-size:15px;font-weight:bold;margin-top:6px;border-top:1px solid #ddd;padding-top:4px}</style></head><body><div class="card"><div class="title">${product.name}</div><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}" /><div class="code">ID: ${code}</div><div class="price">${(parseFloat(product.price)||0).toLocaleString('en-US')} دج</div></div><script>setTimeout(()=>{window.print();window.close()},500)</script></body></html>`);
    printWindow.document.close();
  };

  const getCat = (k) => CATEGORIES.find(c => c.key === k) || { label: k, color: '#94a3b8' };
  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) && (selectedCategory === 'all' || p.category === selectedCategory));

  const NAV = [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', path: '/admin/products', icon: Package },
    { label: 'الطلبات', path: '/admin/orders', icon: ClipboardList },
    { label: 'QR', path: '/admin/scan', icon: ScanLine },
    { label: 'الطلبات الخاصة', path: '/admin/requests', icon: FileText },
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', paddingBottom: 70, fontFamily: 'system-ui' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>المنتجات والمخزون</h1>
          <div style={{ display: 'flex', gap: 8 }}>
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
              {!editingProduct && (
                <input className="field-input" type="number" placeholder="الكمية *" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              )}
              <input className="field-input" placeholder="الرف" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} />
              <input className="field-input" placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', background: '#f1f5f9', borderRadius: 8, fontWeight: 600, fontSize: 13, width: 'fit-content' }}>
                <Upload size={14} /> {uploading ? 'جاري...' : 'رفع صورة'}
                <input type="file" accept="image/*" hidden onChange={e => handleImageUpload(e.target.files[0])} />
              </label>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">إلغاء</button>
              <button onClick={handleSave} className="btn btn-accent btn-sm"><Save size={14} /> حفظ</button>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            <button onClick={() => setSelectedCategory('all')} className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>الكل ({products.length})</button>
            {CATEGORIES.map(c => <button key={c.key} onClick={() => setSelectedCategory(c.key)} className={`btn ${selectedCategory === c.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{c.label}</button>)}
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
              return (
                <div key={product.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <img src={product.image || 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} alt={product.name} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${catObj.color}15`, color: catObj.color, fontWeight: 700 }}>{catObj.label}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, margin: '4px 0' }}>{product.name}</h4>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>المخزون: <strong>{product.stock || 0}</strong></span>
                    <div style={{ display: 'flex', gap: 6 }}>
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

      <nav style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-around', padding: '8px 0', zIndex: 40 }}>
        {NAV.map(item => {
          const Icon = item.icon; 
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 800 : 600, fontSize: 10 }}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}