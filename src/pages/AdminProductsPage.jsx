import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X, Package, ChevronLeft, Monitor, Zap, Cpu, Search, Loader2, LogOut, Upload } from 'lucide-react';
import { api } from '../services/api';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tcon', brand: 'samsung', price: '', stock: '', description: '', image: '' });

  const categories = [
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
    { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
  ];

  const brands = ['samsung', 'lg', 'condor', 'iris', 'geant', 'stream', 'maxtor', 'kiowa'];

  useEffect(() => {
    verifyAdmin();
  }, [navigate]);

  const verifyAdmin = async () => {
    try {
      const data = await api.verifyAdmin();
      if (!data.success) {
        navigate('/admin');
        return;
      }
      loadProducts();
    } catch (error) {
      navigate('/admin');
    }
  };

  const loadProducts = () => {
    setLoading(true);
    api.getProducts().then(data => {
      if (data.success) setProducts(data.products);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // ✅ رفع الصورة إلى Cloudinary
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/products/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: reader.result })
        });
        const data = await res.json();
        if (data.success) {
          setFormData({...formData, image: data.url});
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
      setUploading(false);
    };
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    if (editingId) {
      await api.updateProduct(editingId, formData);
      setEditingId(null);
    }
    loadProducts();
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    await api.createProduct(formData);
    setShowAddForm(false);
    setFormData({ name: '', category: 'tcon', brand: 'samsung', price: '', stock: '', description: '', image: '' });
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
      navigate('/admin');
    } catch (error) {
      navigate('/admin');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, category: product.category, brand: product.brand, price: product.price.toString(), stock: product.stock.toString(), description: product.description, image: product.image });
  };

  const getCategoryName = (key) => categories.find(c => c.key === key)?.label || key;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));

  const FormFields = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input className="field-input" placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <select className="field-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => (<option key={c.key} value={c.key}>{c.label}</option>))}
        </select>
        <select className="field-input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
          {brands.map(b => (<option key={b} value={b}>{b}</option>))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input className="field-input" type="number" placeholder="السعر (دج) *" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        <input className="field-input" type="number" placeholder="المخزون *" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
      </div>
      <textarea className="field-input" placeholder="الوصف" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
      
      {/* ✅ حقل رفع الصورة */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input className="field-input" placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
          <Upload size={14} />
          {uploading ? 'جاري...' : 'رفع'}
          <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files[0])} />
        </label>
      </div>
      {formData.image && (
        <img src={formData.image} alt="Preview" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
      )}
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /> لوحة التحكم</Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>إدارة المنتجات</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={16} /> إضافة منتج</button>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="تسجيل الخروج" style={{ color: '#ef4444' }}><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        
        {showAddForm && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>إضافة منتج جديد</h3>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <FormFields />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={handleAdd} className="btn btn-accent" disabled={!formData.name || !formData.price} style={{ gap: 6 }}><Save size={16} /> حفظ المنتج</button>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">إلغاء</button>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input className="field-input" placeholder="ابحث عن منتج..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={40} className="spin" style={{ color: '#3b82f6' }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredProducts.map(product => (
              <div key={product.id} className="card" style={{ padding: 14 }}>
                {editingId === product.id ? (
                  <div>
                    <FormFields />
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button onClick={handleSave} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Save size={14} /> حفظ</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm"><X size={14} /> إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                      <img src={product.image || 'https://via.placeholder.com/56'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{product.name}</h4>
                      <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                        <span>{getCategoryName(product.category)}</span><span>•</span><span>{product.brand}</span><span>•</span><span>المخزون: {product.stock}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b', marginRight: 'auto', marginLeft: 16 }}>{product.price?.toLocaleString('en-US')} دج</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleEdit(product)} className="btn btn-ghost btn-sm" title="تعديل"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-ghost btn-sm" title="حذف" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}