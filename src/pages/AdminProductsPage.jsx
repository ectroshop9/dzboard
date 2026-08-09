import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X, Package, ChevronLeft, Monitor, Zap, Cpu, Search, Loader2, LogOut, Upload, QrCode, Printer } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
  { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
  { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
  { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
];

const BRANDS = ['samsung', 'lg', 'condor', 'iris', 'geant', 'stream', 'maxtor', 'kiowa'];
const API = 'https://dzboard.onrender.com/api';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'tcon', brand: 'samsung', price: '', stock: '1', description: '', image: '', shelf: '', position: '' });

  useEffect(() => { verifyAdmin(); }, []);

  const verifyAdmin = async () => {
    try {
      const data = await api.verifyAdmin();
      if (!data.success) { navigate('/admin'); return; }
      loadAll();
    } catch { navigate('/admin'); }
  };

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.getProducts(),
      fetch(`${API}/inventory/items`).then(r => r.json()),
    ]).then(([prodData, invData]) => {
      if (prodData.success) setProducts(prodData.products);
      if (invData.success) setItems(invData.items);
      setLoading(false);
    });
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    
    // 1. إنشاء المنتج في المتجر
    const prod = await api.createProduct(formData);
    
    // 2. إضافة قطع للمخزون (حسب العدد)
    if (prod.success && formData.stock > 0) {
      for (let i = 0; i < parseInt(formData.stock); i++) {
        await fetch(`${API}/inventory/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            shelf: formData.shelf,
            position: i + 1,
            price: formData.price,
            image: formData.image,
            product_id: prod.product?.id,
            category: formData.category,
            brand: formData.brand,
          }),
        });
      }
    }
    
    setShowAddForm(false);
    setFormData({ name: '', category: 'tcon', brand: 'samsung', price: '', stock: '1', description: '', image: '', shelf: '', position: '' });
    loadAll();
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await api.deleteProduct(id);
      loadAll();
    }
  };

  const handleLogout = async () => {
    try { await api.adminLogout(); navigate('/admin'); } catch { navigate('/admin'); }
  };

  const getCategoryName = (key) => CATEGORIES.find(c => c.key === key)?.label || key;
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>المنتجات والمخزون</h1>
            <Link to="/admin/scan" className="btn btn-ghost btn-sm" style={{ gap: 6 }}><QrCode size={16} /> مسح</Link>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={16} /> إضافة منتج</button>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        
        {showAddForm && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>إضافة منتج جديد (مع قطع مخزون)</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="field-input" style={{ flex: 2, minWidth: 200 }} placeholder="اسم المنتج *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="field-input" style={{ width: 120 }} placeholder="السعر (دج)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <input className="field-input" style={{ width: 80 }} placeholder="الكمية" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              <input className="field-input" style={{ width: 100 }} placeholder="الرف" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} />
              <input className="field-input" style={{ width: 200 }} placeholder="رابط الصورة" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <button onClick={handleAdd} className="btn btn-accent btn-sm"><Save size={16} /> حفظ</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16, position: 'relative' }}>
          <input className="field-input" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredProducts.map(product => {
              const productItems = items.filter(i => i.product_id === product.id);
              const available = productItems.filter(i => i.status === 'available').length;
              return (
                <div key={product.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: productItems.length > 0 ? 10 : 0 }}>
                    <img src={product.image || 'https://via.placeholder.com/56'} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700 }}>{product.name}</h4>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {getCategoryName(product.category)} • {product.brand} • 
                        <span style={{ color: available > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                          {available} قطعة متوفرة
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>{product.price?.toLocaleString('en-US')} دج</div>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                  
                  {/* قطع المخزون لهذا المنتج */}
                  {productItems.length > 0 && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                      <table style={{ width: '100%', fontSize: 12 }}>
                        <thead>
                          <tr style={{ color: '#94a3b8' }}>
                            <th style={{ padding: 4, textAlign: 'right' }}>SKU</th>
                            <th style={{ padding: 4, textAlign: 'right' }}>باركود</th>
                            <th style={{ padding: 4, textAlign: 'right' }}>الرف</th>
                            <th style={{ padding: 4, textAlign: 'right' }}>الحالة</th>
                            <th style={{ padding: 4 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productItems.map(item => (
                            <tr key={item.id}>
                              <td style={{ padding: 4, fontWeight: 700 }}>{item.sku}</td>
                              <td style={{ padding: 4, fontFamily: 'monospace', fontSize: 11 }}>{item.barcode}</td>
                              <td style={{ padding: 4 }}>{item.shelf}-{item.position}</td>
                              <td style={{ padding: 4 }}>
                                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: item.status === 'available' ? '#d1fae5' : '#fee2e2', color: item.status === 'available' ? '#065f46' : '#991b1b' }}>
                                  {item.status === 'available' ? 'متوفر' : 'مباع'}
                                </span>
                              </td>
                              <td style={{ padding: 4 }}>
                                <button onClick={() => window.open(`https://barcode.tec-it.com/barcode.ashx?data=${item.barcode}&code=Code128`, '_blank')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🖨️</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
