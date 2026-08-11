import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, Search, Truck, Eye, Check, X, Loader2, AlertCircle, RefreshCw, Filter, Phone, MapPin, Menu
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات والمخزون', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
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

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!token) { 
      navigate('/admin'); 
      return; 
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API}/orders`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.json())
      .then(data => { 
        if (data.success || data.orders) {
          setOrders(data.orders || data.data || []);
        }
        setLoading(false); 
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  };

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const customerName = (o.customer || o.name || '').toLowerCase();
    const phone = (o.phone || '').toString();
    const orderId = String(o.id || '');
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = customerName.includes(q) || phone.includes(q) || orderId.includes(q);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      localStorage.removeItem('dzboard_admin_token');
      navigate('/admin');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 40 }} 
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ 
        width: sidebarOpen ? 240 : 72, 
        background: '#fff', 
        borderLeft: '1px solid #e2e8f0',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 50
      }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: (sidebarOpen || mobileMenuOpen) ? 'space-between' : 'center' }}>
            {(sidebarOpen || mobileMenuOpen) && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span>
              </Link>
            )}
            
            {/* Desktop Toggle Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="desktop-toggle-btn"
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6, display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s' }} />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="mobile-close-btn"
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6 }}
            >
              <X size={18} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
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
                    justifyContent: (sidebarOpen || mobileMenuOpen) ? 'flex-start' : 'center',
                    transition: 'background 0.2s'
                  }}>
                  <Icon size={20} />
                  {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
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
            justifyContent: (sidebarOpen || mobileMenuOpen) ? 'flex-start' : 'center',
          }}>
          <LogOut size={20} />
          {(sidebarOpen || mobileMenuOpen) && <span>تسجيل خروج</span>}
        </button>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="mobile-hamburger-btn"
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#334155' }}
            >
              <Menu size={20} />
            </button>
            <ShoppingBag size={22} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0f172a' }}>إدارة الطلبات</h1>
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
              {filteredOrders.length} طلب
            </span>
          </div>

          <button onClick={fetchOrders} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> <span className="btn-text">تحديث Data</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="orders-main" style={{ padding: 24, flex: 1 }}>
          
          {/* Controls Bar: Search + Filters */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 240, flex: 1 }}>
              <input 
                type="text" 
                placeholder="بحث باسم العميل، الرقم، أو رفرنس الطلب..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            {/* Status Tabs / Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4, width: '100%', maxWidth: '100%' }}>
              <Filter size={16} style={{ color: '#64748b', marginLeft: 4, flexShrink: 0 }} />
              {[
                { key: 'all', label: 'الكل' },
                { key: 'pending', label: 'قيد الانتظار' },
                { key: 'confirmed', label: 'مؤكد' },
                { key: 'shipped', label: 'تم الشحن' },
                { key: 'delivered', label: 'تم التسليم' },
                { key: 'cancelled', label: 'ملغى' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: statusFilter === tab.key ? '#2563eb' : '#f1f5f9',
                    color: statusFilter === tab.key ? '#fff' : '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

          {/* Orders Table Area */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {loading ? (
              <div style={{ padding: 50, textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 10, color: '#2563eb' }} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>جاري تحميل قائمة الطلبات...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ padding: 50, textAlign: 'center', color: '#94a3b8' }}>
                <AlertCircle size={36} style={{ marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>لا توجد طلبات تطابق خيارات البحث الحالية</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'right', minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>رقم الطلب</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>العميل</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>رقم الهاتف</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>الولاية / العنوان</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>الإجمالي</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700 }}>الحالة</th>
                      <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => {
                      const st = STATUS_MAP[o.status] || { label: o.status || 'قيد الانتظار', bg: '#f1f5f9', color: '#475569' };
                      const totalAmount = (parseFloat(o.amount || o.total || 0) + parseFloat(o.shipping || 0)).toLocaleString('en-US');
                      const isUpdating = updatingId === o.id;

                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>#{o.id}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b' }}>
                            {o.customer || o.name || 'عميل'}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569', direction: 'ltr', textAlign: 'right' }}>
                            {o.phone || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {o.wilaya ? `${o.wilaya} - ${o.address || ''}` : o.address || 'غير محدد'}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#059669' }}>
                            {totalAmount} دج
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color, display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              
                              {/* View Modal Trigger */}
                              <button 
                                onClick={() => setSelectedOrder(o)}
                                title="معاينة التفاصيل"
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
                              >
                                <Eye size={14} /> <span className="action-label">التفاصيل</span>
                              </button>

                              {/* Action status buttons */}
                              {isUpdating ? (
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                              ) : (
                                <>
                                  {o.status === 'pending' && (
                                    <button onClick={() => handleStatus(o.id, 'confirmed')} style={{ background: '#dbeafe', border: 'none', color: '#1d4ed8', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                      <Check size={14} /> تأكيد
                                    </button>
                                  )}
                                  {o.status === 'confirmed' && (
                                    <button onClick={() => handleStatus(o.id, 'shipped')} style={{ background: '#e0e7ff', border: 'none', color: '#4338ca', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                      <Truck size={14} /> شحن
                                    </button>
                                  )}
                                  {o.status === 'shipped' && (
                                    <button onClick={() => handleStatus(o.id, 'delivered')} style={{ background: '#d1fae5', border: 'none', color: '#047857', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                      <Check size={14} /> تم التسليم
                                    </button>
                                  )}
                                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                                    <button onClick={() => handleStatus(o.id, 'cancelled')} title="إلغاء الطلب" style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                      <X size={14} />
                                    </button>
                                  )}
                                </>
                              )}

                            </div>
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

      {/* Modal - View Order Details */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>تفاصيل الطلب #{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              
              {/* Customer Info */}
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>بيانات العميل</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569' }}>
                  <div><strong>الاسم:</strong> {selectedOrder.customer || selectedOrder.name || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> <span style={{ direction: 'ltr' }}>{selectedOrder.phone || '—'}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {selectedOrder.wilaya ? `${selectedOrder.wilaya} - ` : ''}{selectedOrder.address || 'غير محدد'}</div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>المنتجات المطلوبة</div>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                        <span style={{ fontWeight: 700 }}>{item.title || item.name || 'منتج'} x {item.quantity || 1}</span>
                        <span style={{ fontWeight: 800, color: '#059669' }}>{(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString('en-US')} دج</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>تفاصيل العناصر المطلوبة غير متوفرة بشكل تفصيلي</div>
                )}
              </div>

              {/* Financial summary */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>سعر المنتجات:</span>
                  <span>{parseFloat(selectedOrder.amount || selectedOrder.total || 0).toLocaleString('en-US')} دج</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>رسوم الشحن:</span>
                  <span>{parseFloat(selectedOrder.shipping || 0).toLocaleString('en-US')} دج</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 15, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: 8, marginTop: 4 }}>
                  <span>الإجمالي الكلي:</span>
                  <span style={{ color: '#2563eb' }}>{(parseFloat(selectedOrder.amount || selectedOrder.total || 0) + parseFloat(selectedOrder.shipping || 0)).toLocaleString('en-US')} دج</span>
                </div>
              </div>

            </div>

            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        .mobile-hamburger-btn { display: none; }
        .mobile-close-btn { display: none; }
        .desktop-toggle-btn { display: flex; }

        @media (max-width: 768px) {
          .mobile-hamburger-btn { display: flex; }
          .mobile-close-btn { display: flex; }
          .desktop-toggle-btn { display: none; }
          
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            right: 0;
            bottom: 0;
            height: 100vh !important;
            width: 260px !important;
            transform: translateX(100%);
            box-shadow: -4px 0 20px rgba(0,0,0,0.1);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .orders-main {
            padding: 16px !important;
          }

          .btn-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}