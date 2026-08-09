import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, Package, ChevronLeft, Monitor, Zap, Cpu, Search, Loader2, LogOut, Upload, QrCode } from 'lucide-react';
import { api } from '../services/api';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tcon', price: '', stock: '1', description: '', image: '', shelf: '' });

  useEffect(() => {
    if (!localStorage.getItem('dzboard_admin_token')) { navigate('/admin'); return; }
    loadAll();
  }, []);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/inventory/items`).then(r => r.json()),
    ]).then(([a, b]) => {
      if (a.success) setProducts(a.products);
      if (b.success) setItems(b.items);
      setLoading(false);
    });
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
      if (data.success) setFormData({...formData, image: data.url});
      setUploading(false);
    };
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    const prod = await fetch(`${API}/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` },
      body: JSON.stringify(formData),
    }).then(r => r.json());
    if (prod.success && formData.stock > 0) {
      for (let i = 0; i < parseInt(formData.stock); i++) {
        await fetch(`${API}/inventory/items`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, shelf: formData.shelf, position: i + 1, price: formData.price, image: formData.image, product_id: prod.product?.id }),
        });
      }
    }
    setShowAddForm(false);
    setFormData({ name: '', category: 'tcon', price: '', stock: '1', description: '', image: '', shelf: '' });
    loadAll();
  };

  const getCategoryName = (key) => CATEGORIES.find(c => c.key === key)?.label || key;

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>المنتجات والمخزون</h1>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={16} /> إضافة منتج</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {showAddForm && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>إضافة منتج جديد</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="field-input" placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="field-input" placeholder="السعر (دج)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="field-input" placeholder="الكمية" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
<textarea className="field-input" style={{ fontSize: 13, padding: '8px 12px', maxWidth: 400 }} placeholder="الوصف" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
              <input className="field-input" placeholder="الرف" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} />
              <input className="field-input" placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, width: 'fit-content' }}>
                <Upload size={14} /> {uploading ? 'جاري...' : 'رفع صورة'}
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files[0])} />
              </label>
              <button onClick={handleAdd} className="btn btn-accent"><Save size={16} /> حفظ</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16, position: 'relative' }}>
          <input className="field-input" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.filter(p => p.name?.includes(searchQuery)).map(product => {
              const productItems = items.filter(i => i.product_id === product.id);
              return (
                <div key={product.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={product.image || 'https://via.placeholder.com/56'} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{product.name}</h4>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{getCategoryName(product.category)} • {product.price?.toLocaleString('en-US')} دج</div>
                    </div>
                    <button onClick={() => { if (window.confirm('حذف؟')) { fetch(`${API}/products/${product.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` } }).then(loadAll); } }} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
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
