import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, Plus, QrCode, Package, Loader2, Check, X } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminInventoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterShelf, setFilterShelf] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ product_id: '', shelf_id: '', position: '' });

  useEffect(() => {
    const token = localStorage.getItem('dzboard_admin_token');
    if (!token) { navigate('/admin'); return; }
    loadData();
  }, [filterShelf, filterStatus, search]);

  const loadData = async () => {
    const [itemsRes, shelvesRes, productsRes] = await Promise.all([
      fetch(`${API}/inventory/items?shelf=${filterShelf}&status=${filterStatus}&search=${search}`).then(r => r.json()),
      fetch(`${API}/inventory/shelves`).then(r => r.json()),
      fetch(`${API}/products`).then(r => r.json()),
    ]);
    if (itemsRes.success) setItems(itemsRes.items);
    if (shelvesRes.success) setShelves(shelvesRes.shelves);
    if (productsRes.success) setProducts(productsRes.products);
    setLoading(false);
  };

  const handleAdd = async () => {
    await fetch(`${API}/inventory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm({ product_id: '', shelf_id: '', position: '' });
    loadData();
  };

  const handleStatus = async (id, status) => {
    await fetch(`${API}/inventory/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const getShelfName = (id) => shelves.find(s => s.id === id)?.name || '-';
  const getProductName = (id) => products.find(p => p.id === id)?.name || '-';

  const statusColors = {
    available: { bg: '#d1fae5', color: '#065f46', label: 'متوفر' },
    sold: { bg: '#fee2e2', color: '#991b1b', label: 'مباع' },
    reserved: { bg: '#fef3c7', color: '#92400e', label: 'محجوز' },
    damaged: { bg: '#e5e7eb', color: '#374151', label: 'تالف' },
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>إدارة المخزون</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={16} /> إضافة قطعة</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        
        {/* Filters */}
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input className="field-input" placeholder="بحث بـ SKU أو باركود..." value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <select className="field-input" style={{ width: 'auto' }} value={filterShelf} onChange={e => setFilterShelf(e.target.value)}>
              <option value="all">كل الرفوف</option>
              {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="field-input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="available">متوفر</option>
              <option value="sold">مباع</option>
              <option value="reserved">محجوز</option>
              <option value="damaged">تالف</option>
            </select>
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <select className="field-input" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}>
                <option value="">اختر المنتج</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="field-input" value={form.shelf_id} onChange={e => setForm({...form, shelf_id: e.target.value})}>
                <option value="">اختر الرف</option>
                {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input className="field-input" type="number" placeholder="الموقع" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
            </div>
            <button onClick={handleAdd} className="btn btn-accent btn-sm" style={{ marginTop: 10 }}>حفظ</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {['available', 'reserved', 'sold', 'damaged'].map(s => {
            const count = items.filter(i => i.status === s).length;
            const c = statusColors[s];
            return (
              <div key={s} className="card" style={{ padding: 12, textAlign: 'center', background: c.bg, borderColor: c.color }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{count}</div>
                <div style={{ fontSize: 12, color: c.color }}>{c.label}</div>
              </div>
            );
          })}
        </div>

        {/* Items Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['SKU', 'باركود', 'المنتج', 'الرف', 'الموقع', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{item.sku}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.barcode}</td>
                    <td style={{ padding: '10px 12px' }}>{getProductName(item.product_id)}</td>
                    <td style={{ padding: '10px 12px' }}>{getShelfName(item.shelf_id)}</td>
                    <td style={{ padding: '10px 12px' }}>{item.position || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: statusColors[item.status]?.bg, color: statusColors[item.status]?.color, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {statusColors[item.status]?.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                      {item.status === 'available' && (
                        <button onClick={() => handleStatus(item.id, 'sold')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><X size={12} /> بيع</button>
                      )}
                      {item.status === 'sold' && (
                        <button onClick={() => handleStatus(item.id, 'available')} className="btn btn-ghost btn-sm" style={{ color: '#10b981' }}><Check size={12} /> إرجاع</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
