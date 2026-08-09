import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, Plus, Package, Loader2 } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminInventoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', shelf: '', position: '' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    fetch(`${API}/inventory/items?search=${search}`)
      .then(r => r.json())
      .then(data => { if (data.success) setItems(data.items); setLoading(false); });
  };

  const handleAdd = async () => {
    await fetch(`${API}/inventory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm({ name: '', shelf: '', position: '' });
    loadItems();
  };

  const handleStatus = async (id, status) => {
    await fetch(`${API}/inventory/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadItems();
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /></Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>المخزون</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary btn-sm" style={{ gap: 6 }}><Plus size={16} /> إضافة قطعة</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        
        {showAdd && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>إضافة قطعة جديدة</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input className="field-input" style={{ flex: 1 }} placeholder="اسم المنتج *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="field-input" style={{ width: 150 }} placeholder="الرف (A,B,C,D)" value={form.shelf} onChange={e => setForm({...form, shelf: e.target.value})} />
              <input className="field-input" style={{ width: 100 }} placeholder="الموقع" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
              <button onClick={handleAdd} className="btn btn-accent btn-sm">حفظ</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16, position: 'relative' }}>
          <input className="field-input" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} onKeyUp={loadItems} />
          <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={32} className="spin" /></div>
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: 10 }}>SKU</th>
                  <th style={{ padding: 10 }}>المنتج</th>
                  <th style={{ padding: 10 }}>الرف</th>
                  <th style={{ padding: 10 }}>الموقع</th>
                  <th style={{ padding: 10 }}>الحالة</th>
                  <th style={{ padding: 10 }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: 10, fontWeight: 700 }}>{item.sku}</td>
                    <td style={{ padding: 10 }}>{item.name || '-'}</td>
                    <td style={{ padding: 10 }}>{item.shelf || '-'}</td>
                    <td style={{ padding: 10 }}>{item.position || '-'}</td>
                    <td style={{ padding: 10 }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: item.status === 'available' ? '#d1fae5' : '#fee2e2', color: item.status === 'available' ? '#065f46' : '#991b1b' }}>
                        {item.status === 'available' ? 'متوفر' : 'مباع'}
                      </span>
                    </td>
                    <td style={{ padding: 10 }}>
                      {item.status === 'available' ? (
                        <button onClick={() => handleStatus(item.id, 'sold')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>بيع</button>
                      ) : (
                        <button onClick={() => handleStatus(item.id, 'available')} className="btn btn-ghost btn-sm" style={{ color: '#10b981' }}>إرجاع</button>
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
