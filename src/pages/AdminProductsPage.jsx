import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, Package, ChevronLeft, Monitor, Zap, Cpu, Search, Loader2, Upload, Edit3, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

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
  const initialForm = { name: '', category: 'tcon', price: '', stock: '1', description: '', image: '', shelf: '' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { if (!localStorage.getItem('dzboard_admin_token')) navigate('/admin'); else loadAll(); }, []);

  const showToast = (m, t = 'success') => { setNotification({ message: m, type: t }); setTimeout(() => setNotification(null), 3000); };
  const loadAll = () => {
    setLoading(true);
    Promise.all([fetch(`${API}/products`).then(r => r.json()), fetch(`${API}/inventory/items`).then(r => r.json())])
      .then(([a, b]) => { if (a?.success) setProducts(a.products || []); if (b?.success) setItems(b.items || []); })
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (file) => {
    if (!file) return; setUploading(true);
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = async () => {
      const res = await fetch(`${API}/products/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: reader.result }) });
      const data = await res.json();
      if (data.success) setFormData(p => ({ ...p, image: data.url })); else showToast('فشل الرفع', 'error');
      setUploading(false);
    };
  };

  const handleOpenAdd = () => { setEditingProduct(null); setFormData(initialForm); setShowForm(true); };
  const handleOpenEdit = (p) => { setEditingProduct(p); setFormData({ name: p.name || '', category: p.category || 'tcon', price: p.price || '', stock: p.stock || '1', description: p.description || '', image: p.image || '', shelf: p.shelf || '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!formData.name || !formData.price) { showToast('الاسم والسعر مطلوبان', 'error'); return; }
    const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` };
    try {
      if (editingProduct) {
        await fetch(`${API}/products/${editingProduct.id}`, { method: 'PUT', headers: h, body: JSON.stringify(formData) });
      } else {
        const res = await fetch(`${API}/products`, { method: 'POST', headers: h, body: JSON.stringify(formData) });
        const prod = await res.json();
        if (prod.success && parseInt(formData.stock) > 0)
          for (let i = 0; i < parseInt(formData.stock); i++)
            await fetch(`${API}/inventory/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.name, shelf: formData.shelf, position: i + 1, price: formData.price, image: formData.image, product_id: prod.product?.id }) });
      }
      showToast('تم الحفظ'); setShowForm(false); setEditingProduct(null); loadAll();
    } catch { showToast('خطأ', 'error'); }
  };

  const handleDelete = async (id) => { if (!confirm('حذف؟')) return; await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` } }); loadAll(); };

  const getCat = (k) => CATEGORIES.find(c => c.key === k) || { label: k, color: '#64748b' };
  const filtered = products.filter(p => (p.name || '').includes(searchQuery) && (selectedCategory === 'all' || p.category === selectedCategory));

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: 'system-ui' }}>
      {notification && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>{notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}{notification.message}</div>}

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Link to="/admin/dashboard" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><ChevronLeft size={18} /></Link><h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>المنتجات والمخزون</h1></div>
          <div style={{ display: 'flex', gap: 8 }}><button onClick={loadAll} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><RefreshCw size={14} /> تحديث</button><button onClick={handleOpenAdd} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}><Plus size={16} /> إضافة منتج</button></div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><h3 style={{ fontSize: 16, fontWeight: 800 }}>{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h3><button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <input className="field-input" placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select className="field-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
              <input className="field-input" type="number" placeholder="السعر *" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="field-input" type="number" placeholder="الكمية" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              <input className="field-input" placeholder="الرف" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} />
              <input className="field-input" placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '10px', background: '#f1f5f9', borderRadius: 8, fontWeight: 600, fontSize: 13, width: 'fit-content' }}><Upload size={14} /> {uploading ? 'جاري...' : 'رفع صورة'}<input type="file" accept="image/*" hidden onChange={e => handleImageUpload(e.target.files[0])} /></label>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">إلغاء</button><button onClick={handleSave} className="btn btn-accent btn-sm"><Save size={14} /> حفظ</button></div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}><button onClick={() => setSelectedCategory('all')} className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>الكل ({products.length})</button>{CATEGORIES.map(c => <button key={c.key} onClick={() => setSelectedCategory(c.key)} className={`btn ${selectedCategory === c.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{c.label}</button>)}</div>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}><input className="field-input" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /></div>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(product => {
              const catObj = getCat(product.category);
              const barcode = items.find(i => i.product_id === product.id)?.barcode;
              return (
                <div key={product.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <img src={product.image || 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${catObj.color}15`, color: catObj.color, fontWeight: 700 }}>{catObj.label}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, margin: '4px 0' }}>{product.name}</h4>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>{(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>المخزون: <strong>{product.stock || 0}</strong></span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${barcode || product.id}`, '_blank')} className="btn btn-ghost btn-sm" title="طباعة">🖨️</button>
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
    </div>
  );
}