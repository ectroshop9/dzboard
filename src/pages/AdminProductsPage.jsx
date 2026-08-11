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

  useEffect(() => {
    const token = localStorage.getItem('dzboard_admin_token');
    if (!token) { navigate('/admin'); return; }
    loadAll();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${API}/inventory/items`).then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([a, b]) => {
      if (a?.success) setProducts(a.products || []);
      if (b?.success) setItems(b.items || []);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const res = await fetch(`${API}/products/upload`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: reader.result }),
      });
      const data = await res.json();
      if (data.success) setFormData(prev => ({ ...prev, image: data.url }));
      else showToast('فشل رفع الصورة', 'error');
      setUploading(false);
    };
  };

  const handleOpenAdd = () => { setEditingProduct(null); setFormData(initialForm); setShowForm(true); };
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name || '', category: product.category || 'tcon', price: product.price || '', stock: product.stock || '1', description: product.description || '', image: product.image || '', shelf: product.shelf || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) { showToast('الاسم والسعر مطلوبان', 'error'); return; }
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` };
    try {
      if (editingProduct) {
        await fetch(`${API}/products/${editingProduct.id}`, { method: 'PUT', headers, body: JSON.stringify(formData) });
        showToast('تم تحديث المنتج');
      } else {
        const res = await fetch(`${API}/products`, { method: 'POST', headers, body: JSON.stringify(formData) });
        const prod = await res.json();
        if (prod.success && parseInt(formData.stock) > 0) {
          for (let i = 0; i < parseInt(formData.stock); i++) {
            await fetch(`${API}/inventory/items`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: formData.name, shelf: formData.shelf, position: i + 1, price: formData.price, image: formData.image, product_id: prod.product?.id }),
            });
          }
          showToast('تمت إضافة المنتج مع المخزون');
        }
      }
      setShowForm(false); setFormData(initialForm); setEditingProduct(null); loadAll();
    } catch { showToast('خطأ في الاتصال', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف المنتج؟')) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` } });
    showToast('تم حذف المنتج');
    loadAll();
  };

  const getCategoryObj = (key) => CATEGORIES.find(c => c.key === key) || { label: key, color: '#64748b' };
  const filteredProducts = products.filter(p => {
    const matchName = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchName && matchCat;
  });

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: 'system-ui' }}>
      {notification && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 700 }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}{notification.message}
        </div>
      )}

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><ChevronLeft size={18} /></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>إدارة المنتجات والمخزون</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadAll} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}><RefreshCw size={14} /> تحديث</button>
            <button onClick={handleOpenAdd} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}><Plus size={16} /> إضافة منتج</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #3b82f6', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>اسم المنتج *</label><input style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="اسم المنتج" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>التصنيف</label><select style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13, background: '#fff' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
              <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>السعر (دج) *</label><input type="number" style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="4500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>الكمية</label><input type="number" style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="1" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>الرف</label><input style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="A-12" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>الوصف</label><textarea style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13, resize: 'vertical' }} placeholder="وصف المنتج..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} /></div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px dashed #e2e8f0', paddingTop: 14 }}>
                <div style={{ flex: 1, minWidth: 200 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>رابط الصورة</label><input style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: 8, fontWeight: 700, fontSize: 13 }}><Upload size={15} /> {uploading ? 'جاري...' : 'رفع صورة'}<input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files[0])} /></label>
                  {formData.image && <img src={formData.image} alt="Preview" style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #e2e8f0', objectFit: 'cover' }} />}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#64748b' }}>إلغاء</button>
              <button onClick={handleSave} style={{ padding: '10px 22px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Save size={16} /> {editingProduct ? 'تحديث' : 'حفظ'}</button>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            <button onClick={() => setSelectedCategory('all')} style={{ padding: '6px 12px', borderRadius: 6, border: selectedCategory === 'all' ? '1px solid #3b82f6' : '1px solid #e2e8f0', background: selectedCategory === 'all' ? '#eff6ff' : '#fff', color: selectedCategory === 'all' ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>الكل ({products.length})</button>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setSelectedCategory(c.key)} style={{ padding: '6px 12px', borderRadius: 6, border: selectedCategory === c.key ? `1px solid ${c.color}` : '1px solid #e2e8f0', background: selectedCategory === c.key ? `${c.color}15` : '#fff', color: selectedCategory === c.key ? c.color : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{c.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input style={{ width: '100%', padding: '8px 34px 8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13 }} placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filteredProducts.map(product => {
              const catObj = getCategoryObj(product.category);
              const barcode = items.find(i => i.product_id === product.id)?.barcode;
              const productItems = items.filter(i => i.product_id === product.id);
              return (
                <div key={product.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <img src={product.image || 'https://via.placeholder.com/60'} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${catObj.color}15`, color: catObj.color }}>{catObj.label}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, margin: '4px 0' }}>{product.name}</h4>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#d97706' }}>{(parseFloat(product.price) || 0).toLocaleString('en-US')} دج</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: 12 }}>
                    <span>المخزون: <strong>{productItems.length || product.stock || 0}</strong> قطعة</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleOpenEdit(product)} style={{ padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: 6, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}><Edit3 size={14} /> تعديل</button>
                      <button onClick={() => handleDelete(product.id)} style={{ padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}><Trash2 size={14} /></button>
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