import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, QrCode, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Loader2, KeyRound, Shield,
  Database, Download, Upload, Settings
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/requests', label: 'خاصة', icon: ShoppingBag },
  { path: '/admin/scan', label: 'QR', icon: QrCode },
  { path: '/admin/settings', label: 'إعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  
  // حالة تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // حالة النسخ الاحتياطي
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState({ type: '', text: '' });
  const [restoreFile, setRestoreFile] = useState(null);

  useEffect(() => { 
    if (!token) navigate('/admin'); 
  }, []);

  // تغيير كلمة المرور
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setFeedback({ type: 'error', text: 'جميع الحقول مطلوبة' });
    }
    if (newPassword.length < 6) {
      return setFeedback({ type: 'error', text: 'كلمة المرور قصيرة' });
    }
    if (newPassword !== confirmPassword) {
      return setFeedback({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/change-password`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ currentPassword, newPassword }) 
      });
      const data = await res.json();
      setFeedback({ 
        type: data.success ? 'success' : 'error', 
        text: data.message || (data.success ? 'تم التغيير' : 'فشل') 
      });
      if (data.success) { 
        setCurrentPassword(''); 
        setNewPassword(''); 
        setConfirmPassword(''); 
      }
    } catch { 
      setFeedback({ type: 'error', text: 'خطأ في الاتصال' }); 
    }
    setSubmitting(false);
  };

  // إنشاء نسخة احتياطية - الطريقة الصحيحة
  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupFeedback({ type: '', text: '' });
    
    try {
      const res = await fetch(`${API}/backup`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // لا تحاول قراءة JSON - استقبل الملف مباشرة
      const blob = await res.blob();
      
      // تحقق من نوع المحتوى
      const contentType = res.headers.get('Content-Type');
      
      if (contentType && contentType.includes('application/json')) {
        // تنزيل الملف
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setBackupFeedback({ type: 'success', text: 'تم تنزيل النسخة الاحتياطية بنجاح' });
      } else {
        // إذا كان الرد HTML (خطأ)
        const text = await blob.text();
        console.error('Server returned HTML:', text.substring(0, 200));
        throw new Error('السيرفر غير متاح حالياً');
      }
    } catch (err) {
      console.error('Backup error:', err);
      setBackupFeedback({ type: 'error', text: err.message || 'فشل إنشاء النسخة الاحتياطية' });
    }
    
    setBackupLoading(false);
  };

  // اختيار ملف للاسترجاع
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestoreFile(file);
      setBackupFeedback({ type: '', text: '' });
    }
  };

  // استرجاع النسخة الاحتياطية
  const handleRestore = async () => {
    if (!restoreFile) {
      setBackupFeedback({ type: 'error', text: 'اختر ملف النسخة الاحتياطية أولاً' });
      return;
    }

    if (!confirm('هل أنت متأكد من استرجاع النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
      return;
    }

    setRestoreLoading(true);
    setBackupFeedback({ type: '', text: '' });
    
    try {
      const reader = new FileReader();
      reader.readAsText(restoreFile);
      reader.onload = async () => {
        try {
          const backupData = JSON.parse(reader.result);
          
          const res = await fetch(`${API}/backup/restore`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(backupData)
          });
          
          const data = await res.json();
          
          if (data.success) {
            setBackupFeedback({ type: 'success', text: 'تم استرجاع البيانات بنجاح' });
            setRestoreFile(null);
            const fileInput = document.getElementById('restore-file-input');
            if (fileInput) fileInput.value = '';
          } else {
            throw new Error(data.error || 'فشل الاسترجاع');
          }
        } catch (err) {
          setBackupFeedback({ type: 'error', text: err.message || 'ملف غير صالح' });
        }
        setRestoreLoading(false);
      };
      reader.onerror = () => {
        setBackupFeedback({ type: 'error', text: 'فشل قراءة الملف' });
        setRestoreLoading(false);
      };
    } catch (err) {
      setBackupFeedback({ type: 'error', text: err.message });
      setRestoreLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', fontFamily: 'system-ui', direction: 'rtl', minHeight: '100vh', paddingBottom: 70 }}>
      <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, color: '#0f172a' }}>الإعدادات</h1>

        {/* قسم النسخ الاحتياطي */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Database size={20} style={{ color: '#059669' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>النسخ الاحتياطي والاسترجاع</h2>
          </div>

          {backupFeedback.text && (
            <div style={{ 
              padding: 12, 
              borderRadius: 10, 
              marginBottom: 16, 
              fontSize: 13, 
              fontWeight: 700, 
              background: backupFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2', 
              color: backupFeedback.type === 'success' ? '#047857' : '#b91c1c', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              {backupFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {backupFeedback.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={handleBackup} 
              disabled={backupLoading}
              style={{ 
                width: '100%', 
                background: '#059669', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 10, 
                padding: 12, 
                fontWeight: 800, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8, 
                opacity: backupLoading ? 0.7 : 1 
              }}
            >
              {backupLoading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
              {backupLoading ? 'جاري إنشاء النسخة...' : 'إنشاء نسخة احتياطية'}
            </button>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 13, 
                fontWeight: 700, 
                color: '#475569', 
                marginBottom: 8 
              }}>
                استرجاع من ملف نسخة احتياطية:
              </label>
              
              <input 
                id="restore-file-input"
                type="file" 
                accept=".json" 
                onChange={handleFileSelect}
                style={{ 
                  width: '100%', 
                  padding: 10, 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 10, 
                  marginBottom: 10,
                  fontSize: 13
                }} 
              />
              
              <button 
                onClick={handleRestore} 
                disabled={!restoreFile || restoreLoading}
                style={{ 
                  width: '100%', 
                  background: '#d97706', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 10, 
                  padding: 12, 
                  fontWeight: 800, 
                  cursor: restoreFile ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  opacity: restoreLoading ? 0.7 : (restoreFile ? 1 : 0.5) 
                }}
              >
                {restoreLoading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
                {restoreLoading ? 'جاري الاسترجاع...' : 'استرجاع البيانات'}
              </button>
            </div>
          </div>
        </div>

        {/* قسم تغيير كلمة المرور */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={20} style={{ color: '#2563eb' }} />
            <h2 style={{ fontSize: 16, fontWeight: 800 }}>تغيير كلمة المرور</h2>
          </div>

          {feedback.text && (
            <div style={{ 
              padding: 12, 
              borderRadius: 10, 
              marginBottom: 16, 
              fontSize: 13, 
              fontWeight: 700, 
              background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2', 
              color: feedback.type === 'success' ? '#047857' : '#b91c1c', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input 
                type={showCurrent ? 'text' : 'password'} 
                className="field-input" 
                placeholder="كلمة المرور الحالية" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#94a3b8' 
                }}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                type={showNew ? 'text' : 'password'} 
                className="field-input" 
                placeholder="كلمة المرور الجديدة" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#94a3b8' 
                }}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <input 
              type="password" 
              className="field-input" 
              placeholder="تأكيد كلمة المرور الجديدة" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
            
            <button 
              type="submit" 
              disabled={submitting} 
              style={{ 
                width: '100%', 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 10, 
                padding: 12, 
                fontWeight: 800, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8, 
                opacity: submitting ? 0.7 : 1 
              }}
            >
              {submitting ? <Loader2 size={18} className="spin" /> : <KeyRound size={18} />}
              {submitting ? 'جاري...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        </div>
      </main>

      <nav style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#fff', 
        borderTop: '1px solid #e2e8f0', 
        justifyContent: 'space-around', 
        padding: '8px 0', 
        zIndex: 40 
      }}>
        {MENU.map(item => {
          const Icon = item.icon; 
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2, 
                textDecoration: 'none', 
                color: isActive ? '#2563eb' : '#64748b', 
                fontWeight: isActive ? 800 : 600, 
                fontSize: 10 
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}