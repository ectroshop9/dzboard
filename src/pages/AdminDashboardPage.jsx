import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, 
  QrCode, Settings, TrendingUp, Clock, Loader2, Plus, AlertCircle, RefreshCw, LogOut
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/requests', label: 'خاصة', icon: ShoppingBag },
  { path: '/admin/scan', label: 'QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', bg: '#fef3c7', color: '#b45309' },
  confirmed: { label: 'مؤكد', bg: '#dbeafe', color: '#1d4ed8' },
  shipped: { label: 'تم الشحن', bg: '#e0e7ff', color: '#4338ca' },
  delivered: { label: 'تم التسليم', bg: '#d1fae5', color: '#047857' },
  cancelled: { label: 'ملغى', bg: '#fee2e2', color: '#b91c1c' },
};

const API = 'https://dzboard.onrender.com/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!token) { navigate('/admin'); return; } loadDashboardData(); }, []);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()).catch(() => ({ products: [] })),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ orders: [] })),
    ]).then(([p, o]) => {
      const products = p.products || []; const orders = o.orders || [];
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(x => x.status === 'pending').length,
        totalProducts: products.length,
        totalRevenue: orders.reduce((s, x) => s + (parseFloat(x.amount)||0) + (parseFloat(x.shipping)||0), 0),
        recentOrders: orders.slice(0, 6),
      });
    }).finally(() => setLoading(false));
  };

  const handleLogout = () => { localStorage.removeItem('dzboard_admin_token'); navigate('/admin'); };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><Loader2 size={36} className="spin" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui', direction: 'rtl' }}>
      
      {/* Top Navbar */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></Link>
            <nav style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
              {MENU.map(item => {
                const Icon = item.icon; const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 800 : 600, fontSize: 13, whiteSpace: 'nowrap' }}><Icon size={15} /><span className="nav-label">{item.label}</span></Link>;
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadDashboardData} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}><RefreshCw size={14} /></button>
            <Link to="/admin/products" style={{ background: '#2563eb', color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ منتج</Link>
            <button onClick={handleLogout} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { icon: ShoppingBag, label: 'الطلبات', value: stats?.totalOrders || 0, color: '#d97706', bg: '#fffbeb' },
            { icon: Clock, label: 'معلقة', value: stats?.pendingOrders || 0, color: '#f59e0b', bg: '#fef3c7' },
            { icon: Package, label: 'المنتجات', value: stats?.totalProducts || 0, color: '#10b981', bg: '#ecfdf5' },
            { icon: TrendingUp, label: 'الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#059669', bg: '#e6fffa' },
          ].map((s, i) => {
            const Icon = s.icon;
            return <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, borderRight: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{s.label}</span><div style={{ background: s.bg, color: s.color, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} /></div></div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{s.value}</div>
            </div>;
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>آخر الطلبات</h3>
            <Link to="/admin/orders" style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>عرض الكل</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead><tr style={{ background: '#f8fafc', color: '#64748b' }}><th style={{ padding: '10px 14px' }}>#</th><th style={{ padding: '10px 14px' }}>العميل</th><th style={{ padding: '10px 14px' }}>الهاتف</th><th style={{ padding: '10px 14px' }}>المبلغ</th><th style={{ padding: '10px 14px' }}>الحالة</th></tr></thead>
              <tbody>
                {stats?.recentOrders?.map(o => {
                  const st = STATUS_MAP[o.status] || { label: o.status || 'معلق', bg: '#f1f5f9', color: '#475569' };
                  return <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 14px', fontWeight: 800 }}>#{o.id}</td><td style={{ padding: '10px 14px' }}>{o.customer}</td><td style={{ padding: '10px 14px', direction: 'ltr', textAlign: 'right' }}>{o.phone}</td><td style={{ padding: '10px 14px', fontWeight: 800, color: '#10b981' }}>{(parseFloat(o.amount||0)+parseFloat(o.shipping||0)).toLocaleString('en-US')} دج</td><td style={{ padding: '10px 14px' }}><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color }}>{st.label}</span></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Mobile Navigation */}
      <nav style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-around', padding: '8px 0', zIndex: 40 }}>
        {MENU.map(item => {
          const Icon = item.icon; const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 800 : 600, fontSize: 10 }}><Icon size={20} /><span>{item.label}</span></Link>;
        })}
      </nav>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}@media(min-width:769px){.bottom-nav{display:none}.nav-label{display:inline}}@media(max-width:768px){.nav-label{display:none}}`}</style>
    </div>
  );
}