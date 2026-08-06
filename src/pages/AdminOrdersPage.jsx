import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Search, Truck, Loader2, Eye, Check, X, MapPin, Phone, Package 
} from 'lucide-react';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
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
    const token = localStorage.getItem('dzboard_admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    setTimeout(() => {
      setOrders([
        {
          id: 1256,
          customer: 'أحمد محمد',
          phone: '0555123456',
          wilaya: 'الجزائر',
          commune: 'باب الوادي',
          address: 'شارع العربي بن مهيدي، رقم 12',
          amount: 8500,
          shipping: 400,
          status: 'pending',
          items: [
            { name: 'T-Con Samsung 32"', quantity: 1, price: 4500 },
            { name: 'LED Strips 50"', quantity: 2, price: 2000 },
          ],
          tracking: null,
          date: '2026-08-06',
          notes: '',
        },
        {
          id: 1255,
          customer: 'فاطمة زهرة',
          phone: '0665987654',
          wilaya: 'وهران',
          commune: 'بئر الجير',
          address: 'حي 500 مسكن، عمارة 5',
          amount: 3200,
          shipping: 800,
          status: 'confirmed',
          items: [
            { name: 'Power Supply LG 43"', quantity: 1, price: 3200 },
          ],
          tracking: 'ECG4SU06082001',
          date: '2026-08-06',
          notes: 'الاتصال قبل التوصيل',
        },
        {
          id: 1254,
          customer: 'كريم بن علي',
          phone: '0777123123',
          wilaya: 'قسنطينة',
          commune: 'الخروب',
          address: 'نهج فلسطين',
          amount: 15000,
          shipping: 800,
          status: 'shipped',
          items: [
            { name: 'Main Board Condor 40"', quantity: 1, price: 4500 },
            { name: 'T-Con Geant 28"', quantity: 2, price: 2000 },
            { name: 'Alimentation Stream 32"', quantity: 1, price: 2800 },
          ],
          tracking: 'ECG4SU06082002',
          date: '2026-08-05',
          notes: '',
        },
        {
          id: 1253,
          customer: 'سمير عبدلي',
          phone: '0555444333',
          wilaya: 'البليدة',
          commune: 'بوفاريك',
          address: 'شارع الاستقلال',
          amount: 6200,
          shipping: 650,
          status: 'delivered',
          items: [
            { name: 'T-Con Kiowa 24"', quantity: 1, price: 1500 },
            { name: 'LED Strips Iris 50"', quantity: 1, price: 1800 },
            { name: 'Main Board Maxtor 50"', quantity: 1, price: 5200 },
          ],
          tracking: 'ECG4SU06082003',
          date: '2026-08-05',
          notes: 'تم التسليم بنجاح',
        },
        {
          id: 1252,
          customer: 'نورة سعيد',
          phone: '0666111222',
          wilaya: 'تيبازة',
          commune: 'شرشال',
          address: 'حي الأمير عبد القادر',
          amount: 4100,
          shipping: 650,
          status: 'cancelled',
          items: [
            { name: 'Alimentation Geant 40"', quantity: 1, price: 2800 },
          ],
          tracking: null,
          date: '2026-08-04',
          notes: 'العميل ألغى الطلب',
        },
      ]);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toString().includes(searchQuery) ||
      o.phone.includes(searchQuery) ||
      (o.tracking && o.tracking.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.amount + o.shipping : sum, 0);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm">
              <ChevronLeft size={18} /> لوحة التحكم
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>إدارة الطلبات</h1>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
            الإيرادات: {totalRevenue.toLocaleString()} دج
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        
        {/* Filters */}
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Filter */}
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

            {/* Search */}
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input
                className="field-input"
                placeholder="ابحث برقم الطلب، العميل، الهاتف..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
              
              {/* Order Header */}
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: selectedOrder === order.id ? '1px solid var(--border)' : 'none',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 900, fontSize: 15 }}>#{order.id}</span>
                  {getStatusBadge(order.status)}
                  {order.tracking && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <Truck size={12} style={{ marginLeft: 4 }} />
                      {order.tracking}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {(order.amount + order.shipping).toLocaleString()} دج
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.date}</span>
                  
                  {/* Status Actions */}
                  {order.status === 'pending' && (
                    <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                      <Check size={12} /> تأكيد
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => handleStatusChange(order.id, 'shipped')} className="btn btn-accent btn-sm" style={{ gap: 4 }}>
                      <Truck size={12} /> شحن
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button onClick={() => handleStatusChange(order.id, 'delivered')} className="btn btn-primary btn-sm" style={{ gap: 4, background: '#10b981', borderColor: '#10b981' }}>
                      <Check size={12} /> تم التوصيل
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}>
                      <X size={12} /> إلغاء
                    </button>
                  )}

                  <button 
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)} 
                    className="btn btn-ghost btn-sm"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {selectedOrder === order.id && (
                <div style={{ padding: 16, background: 'var(--bg-secondary)' }}>
                  
                  {/* Customer Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>العميل:</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{order.customer}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>الهاتف:</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{order.phone}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>العنوان:</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{order.wilaya} - {order.commune}</span>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.address}</div>
                    </div>
                  </div>

                  {order.notes && (
                    <div style={{ marginBottom: 16, padding: 10, background: 'var(--bg-primary)', borderRadius: 8, fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>ملاحظات: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Package size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 12, fontWeight: 700 }}>المنتجات:</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: index < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span>{item.name} ×{item.quantity}</span>
                          <span style={{ fontWeight: 700 }}>{item.price.toLocaleString()} دج</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>الشحن:</span>
                        <span>{order.shipping.toLocaleString()} دج</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                        <span>الإجمالي:</span>
                        <span style={{ color: 'var(--accent)' }}>{(order.amount + order.shipping).toLocaleString()} دج</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)' }}>لا توجد طلبات</p>
          </div>
        )}
      </div>
    </div>
  );
}
