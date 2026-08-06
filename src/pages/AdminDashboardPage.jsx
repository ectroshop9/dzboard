import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, Truck, DollarSign, TrendingUp, 
  LogOut, Plus, List, ChevronLeft, BarChart3 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('dzboard_admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    // Mock stats
    setStats({
      totalOrders: 156,
      pendingOrders: 23,
      totalProducts: 48,
      totalRevenue: 452000,
      recentOrders: [
        { id: 1256, customer: 'أحمد محمد', wilaya: 'الجزائر', amount: 8500, status: 'pending', date: '2026-08-06' },
        { id: 1255, customer: 'فاطمة زهرة', wilaya: 'وهران', amount: 3200, status: 'confirmed', date: '2026-08-06' },
        { id: 1254, customer: 'كريم بن علي', wilaya: 'قسنطينة', amount: 15000, status: 'shipped', date: '2026-08-05' },
        { id: 1253, customer: 'سمير عبدلي', wilaya: 'البليدة', amount: 6200, status: 'delivered', date: '2026-08-05' },
        { id: 1252, customer: 'نورة سعيد', wilaya: 'تيبازة', amount: 4100, status: 'pending', date: '2026-08-04' },
      ]
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dzboard_admin_token');
    navigate('/admin');
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
    return (
      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: badge.bg, color: badge.color, fontWeight: 700 }}>
        {badge.label}
      </span>
    );
  };

  if (!stats) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BarChart3 size={40} className="spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" className="btn btn-ghost btn-sm">
              <ChevronLeft size={18} /> المتجر
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>لوحة التحكم</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
            <LogOut size={16} /> خروج
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats.totalOrders, color: '#3b82f6' },
            { icon: Package, label: 'المنتجات', value: stats.totalProducts, color: '#10b981' },
            { icon: Truck, label: 'طلبات معلقة', value: stats.pendingOrders, color: '#f59e0b' },
            { icon: DollarSign, label: 'الإيرادات', value: `${(stats.totalRevenue / 100).toLocaleString()} دج`, color: '#6366f1' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="icon-box" style={{ background: `${stat.color}18`, color: stat.color, width: 36, height: 36 }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-primary" style={{ gap: 6 }}>
            <Plus size={16} /> إضافة منتج
          </Link>
          <Link to="/admin/orders" className="btn btn-ghost" style={{ gap: 6 }}>
            <List size={16} /> كل الطلبات
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>آخر الطلبات</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'العميل', 'الولاية', 'المبلغ', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>#{order.id}</td>
                    <td style={{ padding: '10px 12px' }}>{order.customer}</td>
                    <td style={{ padding: '10px 12px' }}>{order.wilaya}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{order.amount.toLocaleString()} دج</td>
                    <td style={{ padding: '10px 12px' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{order.date}</td>
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
