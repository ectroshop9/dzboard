import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Truck, Loader2, Eye, Check, X, MapPin, Phone, PackageOpen } from 'lucide-react';
import { api } from '../services/api';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
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

  const loadOrders = useCallback(() => {
    setLoading(true);
    api.getOrders(token)
      .then(data => {
        if (data.success) setOrders(data.orders || []);
      })
      .catch((err) => console.error('فشل جلب الطلبات:', err))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) { 
      navigate('/admin'); 
      return; 
    }
    loadOrders();
  }, [navigate, token, loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, token);
      if (res?.success || res?.status === 200) {
        // تحديث الحالة فوراً في القائمة المحلية دون الحاجة لإعادة تحميل القائمة بأكملها
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        loadOrders(); // إعادة الجلب في حالة وجود خلل في الاستجابة
      }
    } catch (err) {
      console.error('فشل تحديث حالة الطلب:', err);
    } finally {
      setUpdatingId(null);
    }
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

  // تصفية الطلبات مع معالجة الأخطاء المحتملة في النصوص
  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      (o.customer || '').toLowerCase().includes(query) ||
      String(o.id || '').includes(query) ||
      (o.phone || '').includes(query) ||
      (o.tracking || '').toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // حساب إجمالي الإيرادات بشكل آمن من أخطاء البيانات غير الرقمية
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.amount) || 0) + (Number(o.shipping) || 0), 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={40} className="spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      {/* الشريط العلوي */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', sticky: 'top', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm">
              <ChevronLeft size={18} /> لوحة التحكم
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>إدارة الطلبات</h1>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
            الإيرادات: {totalRevenue.toLocaleString('en-US')} دج
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        {/* شريط الفلاتر والبحث */}
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {statuses.map(s => (
                <button 
                  key={s.key} 
                  onClick={() => setStatusFilter(s.key)} 
                  className={`btn ${statusFilter === s.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input 
                className="field-input" 
                placeholder="ابحث برقم الطلب، العميل..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                style={{ paddingRight: 36 }}
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        {/* قائمة الطلبات */}
        {filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <PackageOpen size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>لا توجد طلبات تطابق الخيارات المحددة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredOrders.map(order => {
              const isUpdating = updatingId === order.id;
              const orderTotal = (Number(order.amount) || 0) + (Number(order.shipping) || 0);

              return (
                <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: selectedOrder === order.id ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 900, fontSize: 15 }}>#{order.id}</span>
                      {getStatusBadge(order.status)}
                      {order.tracking && (
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Truck size={12} /> {order.tracking}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                        {orderTotal.toLocaleString('en-US')} دج
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {order.createdAt ? order.createdAt.slice(0, 10) : '—'}
                      </span>

                      {/* أزرار الإجراءات */}
                      {isUpdating ? (
                        <Loader2 size={16} className="spin" style={{ color: '#3b82f6' }} />
                      ) : (
                        <>
                          {order.status === 'pending' && (
                            <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="btn btn-primary btn-sm">
                              <Check size={12} /> تأكيد
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button onClick={() => handleStatusChange(order.id, 'shipped')} className="btn btn-accent btn-sm">
                              <Truck size={12} /> شحن
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button onClick={() => handleStatusChange(order.id, 'delivered')} className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }}>
                              <Check size={12} /> تم التوصيل
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
                              <X size={12} /> إلغاء
                            </button>
                          )}
                        </>
                      )}

                      <button onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)} className="btn btn-ghost btn-sm">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* تفاصيل الطلب المتروكة عند الضغط على الأيقونة */}
                  {selectedOrder === order.id && (
                    <div style={{ padding: 16, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <MapPin size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>العميل:</span>
                          </div>
                          <span style={{ fontWeight: 700 }}>{order.customer || 'غير محدد'}</span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Phone size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>الهاتف:</span>
                          </div>
                          <span style={{ fontWeight: 700, direction: 'ltr', display: 'inline-block' }}>{order.phone || 'غير محدد'}</span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <MapPin size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>العنوان:</span>
                          </div>
                          <span style={{ fontWeight: 700 }}>{order.commune}</span>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{order.address}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                        <span>الإجمالي الإجمالي:</span>
                        <span style={{ color: '#f59e0b' }}>{orderTotal.toLocaleString('en-US')} دج</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}