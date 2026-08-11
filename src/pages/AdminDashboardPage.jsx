import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, TrendingUp, Clock, Loader2, Plus, AlertCircle, RefreshCw
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: 12, color: '#2563eb' }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>جاري إعداد لوحة التحكم...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar (Desktop Only) */}
      <aside className="admin-sidebar" style={{ 
        width: sidebarOpen ? 240 : 72, 
        background: '#fff', 
        borderLeft: '1px solid #e2e8f0',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        padding: '16px 0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 50
      }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span>
              </Link>
            )}
            
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6, display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s' }} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '11px 16px',
                    margin: '0 10px', 
                    borderRadius: 10, 
                    textDecoration: 'none',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    fontWeight: isActive ? 800 : 600, 
                    fontSize: 14,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    transition: 'background 0.2s'
                  }}>
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={handleLogout}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '11px 16px',
            margin: '0 10px', 
            borderRadius: 10, 
            border: 'none', 
            cursor: 'pointer',
            background: '#fef2f2', 
            color: '#ef4444', 
            fontWeight: 700, 
            fontSize: 14,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل خروج</span>}
        </button>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: 60 }}>
        
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0f172a' }}>لوحة التحكم الرئيسية</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={loadDashboardData} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw size={14} /> <span className="btn-text">تحديث</span>
            </button>
            <Link to="/admin/products" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Plus size={16} /> <span className="btn-text">إضافة منتج</span>
            </Link>
            <Link to="/admin/requests" style={{ background: '#d97706', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <ShoppingBag size={16} /> <span className="btn-text">طلبات خاصة</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-main" style={{ padding: 24, flex: 1 }}>
          
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, color: '#2563eb', bg: '#eff6ff' },
              { icon: Clock, label: 'طلبات قيد الانتظار', value: stats?.pendingOrders || 0, color: '#d97706', bg: '#fffbeb' },
              { icon: Package, label: 'المنتجات بالمخزن', value: stats?.totalProducts || 0, color: '#10b981', bg: '#ecfdf5' },
              { icon: TrendingUp, label: 'مجموع الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#6366f1', bg: '#eef2ff' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{s.label}</span>
                    <div style={{ background: s.bg, color: s.color, width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Table Recent Orders */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a' }}>آخر الطلبات الواردة</h3>
              </div>
              <Link to="/admin/orders" style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>عرض الكل ←</Link>
            </div>

            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <AlertCircle size={32} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>لا توجد طلبات سابقة حتى الآن</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'right', minWidth: 500 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
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
                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>#{order.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{order.customer || order.name || 'عميل'}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>{order.phone || '—'}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#059669' }}>{total} دج</td>
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
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {MENU.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }

          .dashboard-main {
            padding: 16px !important;
          }

          .btn-text {
            display: none;
          }

          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            justify-content: space-around;
            align-items: center;
            padding: 8px 4px;
            z-index: 100;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
          }

          .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            text-decoration: none;
            color: #64748b;
            font-size: 10px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 8px;
            flex: 1;
          }

          .bottom-nav-item.active {
            color: #2563eb;
            font-weight: 800;
          }
        }
      `}</style>
    </div>
  );
}