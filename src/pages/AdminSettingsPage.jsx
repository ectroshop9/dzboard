import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, User, KeyRound, Shield
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show / Hide Password Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Status & Loading State
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback({ type: 'error', text: 'يرجى ملء جميع حقول كلمة المرور' });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', text: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API}/admin/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.status === 'success')) {
        setFeedback({ type: 'success', text: data.message || 'تم تغيير كلمة المرور بنجاح!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', text: data.message || data.error || 'فشل تغيير كلمة المرور. تحقق من الكلمة الحالية.' });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setFeedback({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالسيرفر. حاول مرة أخرى.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      localStorage.removeItem('dzboard_admin_token');
      navigate('/admin');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      
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
            <Settings size={22} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 900, margin: 0, color: '#0f172a' }}>إعدادات الحساب والأمان</h1>
          </div>
          <button onClick={handleLogout} className="mobile-logout-btn" style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'none', alignItems: 'center', gap: 4 }}>
            <LogOut size={16} /> خروج
          </button>
        </header>

        {/* Content */}
        <main style={{ padding: '16px 12px', flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Card: Change Password */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: 20 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
              <Shield size={20} style={{ color: '#2563eb' }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a' }}>الأمان وحماية الحساب</h2>
            </div>

            <form onSubmit={handleChangePassword} style={{ padding: '16px' }}>
              
              {feedback.text && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: feedback.type === 'success' ? '#047857' : '#b91c1c',
                  border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Current Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    كلمة المرور الحالية
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور الحالية..." 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    كلمة المرور الجديدة
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNew ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)..." 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: 10,
                        border: '1px solid #cbd5e1',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input 
                    type="password"
                    placeholder="أعد كتابة كلمة المرور الجديدة..." 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: 6 }}>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{
                      width: '100%',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 20px',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: submitting ? 0.7 : 1,
                      transition: 'background 0.2s'
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        <span>تحديث كلمة المرور</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </div>

          {/* Info Box */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <User size={22} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', margin: '0 0 4px 0' }}>ملاحظات الأمان</h3>
              <p style={{ fontSize: 12, color: '#1e3a8a', margin: 0, lineHeight: 1.6 }}>
                يُوصى باستخدام كلمة مرور قوية تحتوي على أرقام وحروف لتأمين لوحة التحكم بشكل كامل. عند تغيير كلمة المرور سيُمكنك الاستمرار بالعمل بنفس الجلسة الحالية.
              </p>
            </div>
          </div>

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