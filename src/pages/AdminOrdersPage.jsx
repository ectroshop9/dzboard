import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, QrCode, Settings, Search, Truck, Eye, Check, X } from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات والمخزون', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetch('https://dzboard.onrender.com/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.success) setOrders(data.orders); setLoading(false); });
  }, []);

  const handleStatus = async (id, status) => {
    await fetch(`https://dzboard.onrender.com/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o => o.customer?.includes(searchQuery) || String(o.id).includes(searchQuery));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      <div style={{ width: sidebarOpen ? 220 : 64, background: '#fff', borderLeft: '1px solid #e2e8f0', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 0', flexShrink: 0 }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 18, color: '#3b82f6' }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
              {sidebarOpen ? <ChevronRight size={18} /> : <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />}
            </button>
          </div>
          {MENU.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 8, textDecoration: 'none',
                  background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#3b82f6' : '#64748b', fontWeight: isActive ? 700 : 500, fontSize: 14, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
        <button onClick={() => { localStorage.removeItem('dzboard_admin_token'); navigate('/admin'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#ef4444', fontWeight: 500, fontSize: 14, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل خروج</span>}
        </button>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>الطلبات</h1>
        
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <input className="field-input" placeholder="بحث..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(o => (
            <div key={o.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900 }}>#{o.id} - {o.customer}</span>
                <span>{(parseFloat(o.amount) + parseFloat(o.shipping || 0)).toLocaleString('en-US')} دج</span>
                <span>{o.status}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {o.status === 'pending' && <button onClick={() => handleStatus(o.id, 'confirmed')} className="btn btn-primary btn-sm"><Check size={12} /> تأكيد</button>}
                  {o.status === 'confirmed' && <button onClick={() => handleStatus(o.id, 'shipped')} className="btn btn-accent btn-sm"><Truck size={12} /> شحن</button>}
                  {o.status === 'shipped' && <button onClick={() => handleStatus(o.id, 'delivered')} className="btn btn-primary btn-sm"><Check size={12} /> تم</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
