import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, QrCode, TrendingUp, Clock, Loader2, AlertCircle, Users, Truck, Bot, Percent, LogOut } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (!token) { 
      navigate('/admin'); 
      return; 
    } 
    loadData(); 
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/bot-orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([p, o, b]) => {
      const products = p.products || []; 
      const orders = o.orders || [];
      const botOrders = b.orders || [];
      
      const deliveredOrders = orders.filter(x => x.status === 'delivered').length;
      const deliveryRate = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 0;
      
      const regularCustomers = [...new Set(orders.map(x => x.phone || x.customer).filter(Boolean))];
      const botCustomers = botOrders.map(x => x.phone).filter(Boolean);
      const allCustomers = new Set([...regularCustomers, ...botCustomers]);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(x => x.status === 'pending').length,
        totalProducts: products.length,
        totalStock: products.reduce((s, p) => s + (p.stock || 0), 0),
        totalRevenue: orders.reduce((s, x) => s + (parseFloat(x.amount)||0) + (parseFloat(x.shipping)||0), 0),
        recentOrders: orders.slice(0, 6),
        botOrdersCount: botOrders.length,
        totalCustomers: allCustomers.size,
        deliveryRate,
      });
    }).catch(err => {
      console.error('Error loading data:', err);
    }).finally(() => setLoading(false));
  };

  // ✅ تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('dzboard_admin_token');
    navigate('/admin');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 size={36} className="spin" />
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', fontFamily: 'system-ui', direction: 'rtl', minHeight: '100vh', paddingBottom: 120 }}>
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>لوحة التحكم</h1>
          {/* ✅ زر تسجيل الخروج بدل تحديث */}
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              padding: '8px 16px', background: '#ef4444', color: '#fff', 
              border: 'none', borderRadius: 8, cursor: 'pointer', 
              fontSize: 13, fontWeight: 700 
            }}
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { icon: ShoppingBag, label: 'الطلبات', value: stats?.totalOrders || 0, color: '#d97706', bg: '#fffbeb' },
            { icon: Clock, label: 'معلقة', value: stats?.pendingOrders || 0, color: '#f59e0b', bg: '#fef3c7' },
            { icon: Package, label: 'المنتجات', value: stats?.totalProducts || 0, color: '#10b981', bg: '#ecfdf5' },
            { icon: Package, label: 'المخزون', value: stats?.totalStock || 0, color: '#6366f1', bg: '#eef2ff' },
            { icon: TrendingUp, label: 'الإيرادات', value: `${(stats?.totalRevenue || 0).toLocaleString('en-US')} دج`, color: '#059669', bg: '#e6fffa' },
            { icon: Truck, label: 'نسبة التوصيل', value: `${stats?.deliveryRate || 0}%`, color: '#8b5cf6', bg: '#f5f3ff' },
            { icon: Users, label: 'العملاء', value: stats?.totalCustomers || 0, color: '#ec4899', bg: '#fdf2f8' },
            { icon: Bot, label: 'طلبات البوت', value: stats?.botOrdersCount || 0, color: '#06b6d4', bg: '#ecfeff' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, borderRight: `4px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
                  <div style={{ background: s.bg, color: s.color, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} />
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>آخر الطلبات</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px' }}>#</th>
                  <th style={{ padding: '10px 14px' }}>العميل</th>
                  <th style={{ padding: '10px 14px' }}>المبلغ</th>
                  <th style={{ padding: '10px 14px' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(o => {
                  const statusMap = {
                    pending: { label: 'معلقة', bg: '#fef3c7', color: '#b45309' },
                    confirmed: { label: 'مؤكدة', bg: '#dbeafe', color: '#1d4ed8' },
                    shipped: { label: 'تم الشحن', bg: '#e0e7ff', color: '#4338ca' },
                    delivered: { label: 'تم التسليم', bg: '#d1fae5', color: '#047857' },
                    cancelled: { label: 'ملغية', bg: '#fee2e2', color: '#b91c1c' }
                  };
                  const st = statusMap[o.status] || { label: o.status, bg: '#f1f5f9', color: '#475569' };
                  
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>#{o.id}</td>
                      <td style={{ padding: '10px 14px' }}>{o.customer}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#10b981' }}>
                        {(parseFloat(o.amount||0)+parseFloat(o.shipping||0)).toLocaleString('en-US')} دج
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}