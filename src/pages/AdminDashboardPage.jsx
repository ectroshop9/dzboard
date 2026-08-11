import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, 
  QrCode, Settings, TrendingUp, Clock, Loader2, Plus, AlertCircle, RefreshCw,
  Sun, Moon, LogOut
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

  // وضع Dark Mode يعمل على جميع الشاشات
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dzboard_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('dzboard_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (!token) { 
      navigate('/admin'); 
      return; 
    }
    loadDashboardData();
  }, [token, navigate]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()).catch(() => ({ success: false, products: [] })),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ success: false, orders: [] })),
    ]).then(([p, o]) => {
      const products = p.products || p.data || [];
      const orders = o.orders || o.data || [];
      
      const pendingCount = orders.filter(x => x.status === 'pending' || x.status === 'قيد الانتظار').length;
      const totalRevenue = orders.reduce((sum, item) => {
        const amt = parseFloat(item.amount || item.total_price || item.total || 0);
        const shp = parseFloat(item.shipping || item.shipping_fee || 0);
        return sum + (isNaN(amt) ? 0 : amt) + (isNaN(shp) ? 0 : shp);
      }, 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        totalProducts: products.length,
        totalRevenue: totalRevenue,
        recentOrders: orders.slice(0, 6),
      });
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching dashboard stats:', err);
      setLoading(false);
    });
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج من لوحة التحكم؟')) {
      localStorage.removeItem('dzboard_admin_token');
      navigate('/admin');
    }
  };

  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    cardBg: darkMode ? '#1e293b' : '#ffffff',
    textMain: darkMode ? '#f8fafc' : '#0f172a',
    textSub: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#334155' : '#e2e8f0',
    tableHeaderBg: darkMode ? '#0f172a' : '#f8fafc',
    rowBorder: darkMode ? '#334155' : '#f1f5f9',
    headerBg: darkMode ? '#1e293b' : '#ffffff',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: theme.bg, color: theme.textSub }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: 12, color: '#d97706' }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>جاري إعداد لوحة التحكم...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.textMain, fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl', transition: 'background 0.25s, color 0.25s' }}>
      
      {/* Top Universal Navbar */}
      <header style={{ background: theme.headerBg, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 50, transition: 'background 0.25s, border 0.25s' }}>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          
          {/* Logo & Main Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <span style={{ fontWeight: 900, fontSize: 22, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {MENU.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 14px',
                      borderRadius: 10, 
                      textDecoration: 'none',
                      background: isActive ? (darkMode ? '#3b82f620' : '#eff6ff') : 'transparent',
                      color: isActive ? '#3b82f6' : theme.textSub,
                      fontWeight: isActive ? 800 : 600, 
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action Controls & Dark Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button 
              onClick={toggleDarkMode}
              style={{
                background: darkMode ? '#0f172a' : '#f1f5f9',
                border: `1px solid ${theme.border}`,
                color: darkMode ? '#fef08a' : '#d97706',
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'نهاري' : 'داكن'}</span>
            </button>

            <button onClick={loadDashboardData} style={{ background: darkMode ? '#0f172a' : '#f1f5f9', border: `1px solid ${theme.border}`, color: theme.textSub, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> <span>تحديث</span>
            </button>

            <Link to="/admin/products" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> <span>منتج جديد</span>
            </Link>

            <button onClick={handleLogout} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, color: '#d97706', bg: darkMode ? 'rgba(217, 119, 6, 0.15)' : '#fffbe3' },
            { icon: Clock, label: 'طلبات قيد الانتظار', value: stats?.pendingOrders || 0, color: '#f59e0b', bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' },
            { icon: Package, label: 'المنتجات بالمخزن', value: stats?.totalProducts || 0, color: '#10b981', bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5' },
            { icon: TrendingUp, label: 'مجموع الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#059669', bg: darkMode ? 'rgba(5, 150, 105, 0.15)' : '#e6fffa' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ 
                background: theme.cardBg, 
                border: `1px solid ${theme.border}`, 
                borderRadius: 16, 
                padding: 18, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                borderRight: `4px solid ${s.color}`,
                transition: 'background 0.25s, border 0.25s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: theme.textSub, fontWeight: 700 }}>{s.label}</span>
                  <div style={{ background: s.bg, color: s.color, width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} />
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: theme.textMain }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Table Recent Orders */}
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', transition: 'background 0.25s, border 0.25s' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: theme.textMain }}>آخر الطلبات الواردة</h3>
            </div>
            <Link to="/admin/orders" style={{ fontSize: 13, color: '#d97706', fontWeight: 700, textDecoration: 'none' }}>عرض الكل ←</Link>
          </div>

          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center', color: theme.textSub }}>
              <AlertCircle size={32} style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>لا توجد طلبات سابقة حتى الآن</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'right', minWidth: 500 }}>
                <thead>
                  <tr style={{ background: theme.tableHeaderBg, color: theme.textSub, borderBottom: `1px solid ${theme.border}` }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>رقم الطلب</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>العميل</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>الهاتف</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>المبلغ الكلي</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => {
                    const st = STATUS_MAP[order.status] || { label: order.status || 'معلق', bg: '#f1f5f9', color: '#475569' };
                    const total = (parseFloat(order.amount || order.total || 0) + parseFloat(order.shipping || 0)).toLocaleString('en-US');

                    return (
                      <tr key={order.id} style={{ borderBottom: `1px solid ${theme.rowBorder}` }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: theme.textMain }}>#{order.id}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: theme.textMain }}>{order.customer || order.name || 'عميل'}</td>
                        <td style={{ padding: '12px 16px', color: theme.textSub, direction: 'ltr', textAlign: 'right' }}>{order.phone || '—'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10b981' }}>{total} دج</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color, display: 'inline-block', whiteSpace: 'nowrap' }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}