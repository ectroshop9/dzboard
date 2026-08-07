import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Truck, Loader2, Eye, Check, X, MapPin, Phone, Package } from 'lucide-react';
import { api } from '../services/api';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'قيد الانتظار' },
    { key: 'confirmed', label: 'مؤكد' },
    { key: 'shipped', label: 'في الطريق' },
    { key: 'delivered', label: 'تم التوصيل' },
    { key: 'cancelled', label: 'ملغي' },
  ];

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    loadOrders();
  }, [navigate, token]);

  const loadOrders = () => {
    setLoading(true);
    api.getOrders(token).then(data => {
      if (data.success) setOrders(data.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await api.updateOrderStatus(orderId, newStatus, token);
    loadOrders();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'قيد الانتظار', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
      confirmed: { label: 'مؤكد', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
      shipped: { label: 'في الطريق', bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
      delivered: { label: 'تم التوصيل', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
      cancelled: { label: 'ملغي', bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    };
    const badge = badges[status] || badges.pending;
    return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: badge.bg, color: badge.color, fontWeight: 700 }}>{badge.label}</span>;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(o.id).includes(searchQuery) || (o.phone || '').includes(searchQuery) || (o.tracking || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (parseFloat(o.amount) + parseFloat(o.shipping || 0)), 0);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="spin" /></div>;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /> لوحة التحكم</Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>إدارة الطلبات</h1>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>الإيرادات: {totalRevenue.toLocaleString('en-US')} دج</div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {statuses.map(s => <button key={s.key} onClick={() => setStatusFilter(s.key)} className={`btn ${statusFilter === s.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{s.label}</button>)}
            </div>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input className="field-input" placeholder="ابحث برقم الطلب، العميل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: selectedOrder === order.id ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 900, fontSize: 15 }}>#{order.id}</span>
                  {getStatusBadge(order.status)}
                  {order.tracking && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}><Truck size={12} /> {order.tracking}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{(parseFloat(order.amount) + parseFloat(order.shipping || 0)).toLocaleString('en-US')} دج</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.createdAt?.slice(0, 10)}</span>
                  {order.status === 'pending' && <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="btn btn-primary btn-sm"><Check size={12} /> تأكيد</button>}
                  {order.status === 'confirmed' && <button onClick={() => handleStatusChange(order.id, 'shipped')} className="btn btn-accent btn-sm"><Truck size={12} /> شحن</button>}
                  {order.status === 'shipped' && <button onClick={() => handleStatusChange(order.id, 'delivered')} className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }}><Check size={12} /> تم التوصيل</button>}
                  {(order.status === 'pending' || order.status === 'confirmed') && <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><X size={12} /> إلغاء</button>}
                  <button onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)} className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                </div>
              </div>
              {selectedOrder === order.id && (
                <div style={{ padding: 16, background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><MapPin size={14} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>العميل:</span></div><span style={{ fontWeight: 700 }}>{order.customer}</span></div>
                    <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Phone size={14} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>الهاتف:</span></div><span style={{ fontWeight: 700 }}>{order.phone}</span></div>
                    <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><MapPin size={14} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>العنوان:</span></div><span style={{ fontWeight: 700 }}>{order.commune}</span><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.address}</div></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, paddingTop: 8, borderTop: '1px solid var(--border)' }}><span>الإجمالي:</span><span style={{ color: 'var(--accent)' }}>{(parseFloat(order.amount) + parseFloat(order.shipping || 0)).toLocaleString('en-US')} دج</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
