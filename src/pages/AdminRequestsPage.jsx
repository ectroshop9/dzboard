import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, CheckCircle2, XCircle, Clock, RefreshCw, Phone, Trash2, Image as ImageIcon, X 
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, fulfilled, cancelled
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const load = () => {
    setLoading(true);
    fetch(`${API}/requests`, { headers: getAuthHeader() })
      .then(r => r.json())
      .then(data => { 
        if (data.success) setRequests(data.requests || []); 
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    if (token) load(); 
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/requests/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });
      load();
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا الطلب؟')) return;
    try {
      await fetch(`${API}/requests/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      load();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      localStorage.removeItem('dzboard_admin_token');
      navigate('/admin');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', system-ui, -apple-system, sans-serif", direction: 'rtl' }}>
      
      {/* Sidebar Desktop - يختفي في أجهزة الموبايل */}
      <aside className="admin-sidebar" style={{ 
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
        boxSizing: 'border-box'
      }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6, display: 'flex', alignItems: 'center' }}>
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
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={22} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 900, margin: 0, color: '#0f172a' }}>طلبات القطع الخاصة</h1>
          </div>
          <button onClick={handleLogout} className="mobile-logout-btn" style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'none', alignItems: 'center', gap: 4 }}>
            <LogOut size={16} /> خروج
          </button>
        </header>

        {/* Content */}
        <main style={{ padding: '16px 12px', flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* رأس الصفحة الداخلي مع خيارات التحديث والمؤشر */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>متابعة وإدارة الطلبات المخصصة للزبائن</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', smWidth: 'auto', justifyContent: 'space-between' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> {pendingCount} طلب جديد
              </span>
              <button onClick={load} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          {/* أزرار الفلترة - تمرير أفقي مريح للهواتف */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {[
              { key: 'all', label: `الكل (${requests.length})` },
              { key: 'pending', label: `الجديدة (${pendingCount})` },
              { key: 'fulfilled', label: `المتوفرة (${requests.filter(r => r.status === 'fulfilled').length})` },
              { key: 'cancelled', label: `الملغاة (${requests.filter(r => r.status === 'cancelled').length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === tab.key ? '#2563eb' : '#f1f5f9',
                  color: activeTab === tab.key ? '#fff' : '#475569',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* حالة التحميل */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 10px' }} />
              <div>جاري تحميل الطلبات...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            /* حالة لا توجد طلبات */
            <div style={{ textAlign: 'center', padding: '50px 16px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Clock size={36} style={{ color: '#94a3b8', marginBottom: 12 }} />
              <h3 style={{ fontSize: 15, color: '#334155', margin: 0 }}>لا توجد طلبات في هذه القائمة</h3>
            </div>
          ) : (
            /* شبكة البطاقات - متجاوبة مع كل الأحجام */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredRequests.map(r => (
                <div key={r.id} style={{ padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', wordBreak: 'break-word' }}>{r.part_name}</span>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap', background: r.status === 'pending' ? '#fef3c7' : r.status === 'fulfilled' ? '#d1fae5' : '#fee2e2', color: r.status === 'pending' ? '#92400e' : r.status === 'fulfilled' ? '#065f46' : '#991b1b' }}>
                        {r.status === 'pending' ? 'جديد' : r.status === 'fulfilled' ? 'متوفر' : 'ملغي'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>👤 {r.customer_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                        <span style={{ direction: 'ltr' }}>📱 {r.phone}</span>
                        <a href={`tel:${r.phone}`} style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                          <Phone size={12} /> اتصل
                        </a>
                      </div>
                      {r.brand && <div>🏷️ <strong>الماركة:</strong> {r.brand}</div>}
                      {r.model && <div>📺 <strong>الموديل:</strong> {r.model}</div>}
                    </div>

                    {r.image && (
                      <div style={{ position: 'relative', height: 130, borderRadius: 8, overflow: 'hidden', marginBottom: 12, cursor: 'pointer', background: '#000' }} onClick={() => setPreviewImage(r.image)}>
                        <img src={r.image} alt={r.part_name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                        <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ImageIcon size={10} /> تكبير الصورة
                        </span>
                      </div>
                    )}
                  </div>

                  {/* الأزرار والإجراءات */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(r.id, 'fulfilled')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#10b981', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <CheckCircle2 size={14} /> توفير
                          </button>
                          <button onClick={() => updateStatus(r.id, 'cancelled')} style={{ color: '#ef4444', border: '1px solid #fee2e2', background: '#fff5f5', padding: '6px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={14} /> إلغاء
                          </button>
                        </>
                      )}
                      {r.status !== 'pending' && (
                        <button onClick={() => updateStatus(r.id, 'pending')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                          إعادة لجديد
                        </button>
                      )}
                    </div>

                    <button onClick={() => deleteRequest(r.id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', borderRadius: 6, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="حذف الطلب">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lightbox لمعاينة الصورة المكبرة */}
          {previewImage && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={() => setPreviewImage(null)}>
              <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: -40, left: 0, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: 6, cursor: 'pointer' }}>
                  <X size={20} />
                </button>
                <img src={previewImage} alt="معاينة" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8, objectFit: 'contain' }} />
                <div style={{ color: '#cbd5e1', textAlign: 'center', marginTop: 12, fontSize: 12 }}>انقر بالخارج أو على الأيقونة للإغلاق</div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Bottom Mobile Navigation Bar - للشاشات الصغيرة فقط */}
      <nav className="mobile-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'none',
        justifyContent: 'space-around',
        padding: '6px 0',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        {MENU.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: isActive ? '#2563eb' : '#64748b',
              fontSize: 10,
              fontWeight: isActive ? 800 : 600,
              padding: '4px 8px'
            }}>
              <Icon size={18} />
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
        .spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
          .mobile-logout-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}