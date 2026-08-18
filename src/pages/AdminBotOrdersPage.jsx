import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, Loader2, Search, Phone, Package } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminBotOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!token) navigate('/admin');
    else fetchOrders();
  }, [token]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API}/bot-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bot-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (!confirm('حذف هذا الطلب؟')) return;
    await fetch(`${API}/bot-orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchOrders();
  };

  const filtered = orders.filter(o => {
    const matchSearch = (o.customer_name || '').includes(searchQuery) || (o.phone || '').includes(searchQuery) || (o.product_name || '').includes(searchQuery);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_MAP = {
    pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#b45309' },
    confirmed: { label: 'مؤكد', bg: '#dbeafe', color: '#1d4ed8' },
    completed: { label: 'مكتمل', bg: '#d1fae5', color: '#047857' },
    cancelled: { label: 'ملغي', bg: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 100, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900 }}>طلبات البوت 🤖</h1>
          <button onClick={fetchOrders} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 35px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Search size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} className="spin" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: '#fff', borderRadius: 12, color: '#64748b' }}>لا توجد طلبات</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map(o => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
              return (
                <div key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>{o.customer_name}</strong>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div><Phone size={14} /> {o.phone}</div>
                    <div><Package size={14} /> {o.product_name}</div>
                    <div>💰 {o.price} دج</div>
                    <div>🕐 {new Date(o.created_at).toLocaleString('ar-DZ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    <button onClick={() => deleteOrder(o.id)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
