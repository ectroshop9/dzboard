import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, TrendingUp, Clock, Loader2, Menu
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات والمخزون', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    Promise.all([
      fetch('https://dzboard.onrender.com/api/products').then(r => r.json()),
      fetch('https://dzboard.onrender.com/api/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([p, o]) => {
      const products = p.products || [];
      const orders = o.orders || [];
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(x => x.status === 'pending').length,
        totalProducts: products.length,
        totalRevenue: orders.reduce((s, x) => s + (parseFloat(x.amount) + parseFloat(x.shipping || 0)), 0),
        recentOrders: orders.slice(0, 5),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><Loader2 size={40} className="spin" /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? 220 : 64, 
        background: '#fff', 
        borderLeft: '1px solid #e2e8f0',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 0',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 18, color: '#3b82f6' }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
              {sidebarOpen ? <ChevronRight size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {MENU.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  margin: '2px 8px', borderRadius: 8, textDecoration: 'none',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#3b82f6' : '#64748b',
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}>
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <button onClick={() => { localStorage.removeItem('dzboard_admin_token'); navigate('/admin'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            margin: '2px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#ef4444', fontWeight: 500, fontSize: 14,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل خروج</span>}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 900 }}>لوحة التحكم</h1>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { icon: ShoppingBag, label: 'الطلبات', value: stats?.totalOrders || 0, color: '#3b82f6', bg: '#eff6ff' },
              { icon: Package, label: 'المنتجات', value: stats?.totalProducts || 0, color: '#10b981', bg: '#ecfdf5' },
              { icon: Clock, label: 'معلقة', value: stats?.pendingOrders || 0, color: '#f59e0b', bg: '#fffbeb' },
              { icon: TrendingUp, label: 'الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#6366f1', bg: '#eef2ff' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ background: s.bg, color: s.color, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} /></div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Orders */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800 }}>آخر الطلبات</h3>
              <Link to="/admin/orders" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none' }}>عرض الكل</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: 11 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>#</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>العميل</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>المبلغ</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>#{o.id}</td>
                    <td style={{ padding: '8px 12px' }}>{o.customer}</td>
                    <td style={{ padding: '8px 12px' }}>{(parseFloat(o.amount) + parseFloat(o.shipping || 0)).toLocaleString('en-US')} دج</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: o.status === 'pending' ? '#fef3c7' : o.status === 'confirmed' ? '#dbeafe' : o.status === 'shipped' ? '#e0e7ff' : '#d1fae5',
                        color: o.status === 'pending' ? '#92400e' : o.status === 'confirmed' ? '#1e40af' : o.status === 'shipped' ? '#3730a3' : '#065f46',
                      }}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
