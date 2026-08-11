import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, QrCode, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound, Shield } from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/requests', label: 'خاصة', icon: ShoppingBag },
  { path: '/admin/scan', label: 'QR', icon: QrCode },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => { if (!token) navigate('/admin'); }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return setFeedback({ type: 'error', text: 'جميع الحقول مطلوبة' });
    if (newPassword.length < 6) return setFeedback({ type: 'error', text: 'كلمة المرور قصيرة' });
    if (newPassword !== confirmPassword) return setFeedback({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      setFeedback({ type: data.success ? 'success' : 'error', text: data.message || (data.success ? 'تم التغيير' : 'فشل') });
      if (data.success) { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    } catch { setFeedback({ type: 'error', text: 'خطأ في الاتصال' }); }
    setSubmitting(false);
  };

  return (
    <div style={{ background: '#f8fafc', fontFamily: 'system-ui', direction: 'rtl', minHeight: '100vh', paddingBottom: 70 }}>
      <main style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: '#0f172a' }}>الإعدادات</h1>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Shield size={20} style={{ color: '#2563eb' }} /><h2 style={{ fontSize: 16, fontWeight: 800 }}>تغيير كلمة المرور</h2></div>

          {feedback.text && <div style={{ padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 700, background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2', color: feedback.type === 'success' ? '#047857' : '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>{feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{feedback.text}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}><input type={showCurrent ? 'text' : 'password'} className="field-input" placeholder="كلمة المرور الحالية" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /><button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <div style={{ position: 'relative' }}><input type={showNew ? 'text' : 'password'} className="field-input" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={e => setNewPassword(e.target.value)} /><button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <input type="password" className="field-input" placeholder="تأكيد كلمة المرور الجديدة" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button type="submit" disabled={submitting} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <Loader2 size={18} className="spin" /> : <KeyRound size={18} />}
              {submitting ? 'جاري...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        </div>
      </main>

      <nav style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-around', padding: '8px 0', zIndex: 40 }}>
        {MENU.map(item => {
          const Icon = item.icon; const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 800 : 600, fontSize: 10 }}><Icon size={20} /><span>{item.label}</span></Link>;
        })}
      </nav>
    </div>
  );
}