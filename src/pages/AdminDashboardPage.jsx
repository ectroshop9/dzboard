import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ShoppingBag, Truck, DollarSign, LogOut, Plus, List, ChevronLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    
    Promise.all([
      api.getProducts(),
      api.getOrders(token),
    ]).then(([productsData, ordersData]) => {
      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalProducts: products.length,
        totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.amount) + parseFloat(o.shipping || 0)), 0),
        recentOrders: orders.slice(0, 5),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [navigate, token]);

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
    return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: badge.bg, color: badge.color, fontWeight: 700 }}>{badge.label}</span>;
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="spin" /></div>;

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" className="btn btn-ghost btn-sm"><ChevronLeft size={18} /> المتجر</Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>لوحة التحكم</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}><LogOut size={16} /> خروج</button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: ShoppingBag, label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, color: '#3b82f6' },
            { icon: Package, label: 'المنتجات', value: stats?.totalProducts || 0, color: '#10b981' },
            { icon: Truck, label: 'طلبات معلقة', value: stats?.pendingOrders || 0, color: '#f59e0b' },
            { icon: DollarSign, label: 'الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#6366f1' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="icon-box" style={{ background: `${stat.color}18`, color: stat.color, width: 36, height: 36 }}><Icon size={18} /></div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Link to="/admin/products" className="btn btn-primary" style={{ gap: 6 }}><Plus size={16} /> إضافة منتج</Link>
          <Link to="/admin/orders" className="btn btn-ghost" style={{ gap: 6 }}><List size={16} /> كل الطلبات</Link>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ fontSize: 15, fontWeight: 800 }}>آخر الطلبات</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>{['#', 'العميل', 'الولاية', 'المبلغ', 'الحالة', 'التاريخ'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: 12 }}>{h}</th>)}</tr></thead>
              <tbody>
                {stats?.recentOrders?.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>#{o.id}</td>
                    <td style={{ padding: '10px 12px' }}>{o.customer}</td>
                    <td style={{ padding: '10px 12px' }}>{o.wilayaId}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{(parseFloat(o.amount) + parseFloat(o.shipping || 0)).toLocaleString('en-US')} دج</td>
                    <td style={{ padding: '10px 12px' }}>{getStatusBadge(o.status)}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 12 }}>{o.createdAt?.slice(0, 10)}</td>
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
