import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Shield, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const recaptchaRef = useRef<any>(null);

  // ✅ تحميل سكربت reCAPTCHA
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const scriptId = 'recaptcha-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ✅ الحصول على توكن reCAPTCHA
  const getRecaptchaToken = async (): Promise<string> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return '';
    
    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'login' });
          resolve(token);
        } catch {
          resolve('');
        }
      });
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { 
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور'); 
      return; 
    }

    if (attempts >= 5) {
      setError('تم حظر المحاولات - انتظر 15 دقيقة');
      return;
    }

    setLoading(true); 
    setError('');
    try {
      // ✅ جلب توكن reCAPTCHA
      const recaptchaToken = await getRecaptchaToken();

      const data = await api.adminLogin(username, password, recaptchaToken);
      if (data && data.success) {
        const tokenData = {
          token: data.token,
          expires: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('dzboard_admin_token', JSON.stringify(tokenData));
        navigate('/admin/dashboard');
      } else {
        setAttempts(prev => prev + 1);
        const remaining = 5 - (attempts + 1);
        setError(remaining > 0 
          ? `${data?.message || 'بيانات الدخول غير صحيحة'} - محاولات متبقية: ${remaining}` 
          : 'تم حظر المحاولات - انتظر 15 دقيقة');
      }
    } catch { 
      setAttempts(prev => prev + 1);
      setError('حدث خطأ أثناء الاتصال بالخادم'); 
    }
    setLoading(false);
  };

  const checkTokenExpiry = () => {
    const tokenData = localStorage.getItem('dzboard_admin_token');
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem('dzboard_admin_token');
          return true;
        }
      } catch {
        localStorage.removeItem('dzboard_admin_token');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const token = localStorage.getItem('dzboard_admin_token');
    if (token && !checkTokenExpiry()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '40px 28px', maxWidth: 420, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', margin: '0 auto 16px auto', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: '#0f172a' }}>لوحة التحكم</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0, fontWeight: 600 }}>DZBoard Administration</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 18, textAlign: 'center', fontSize: 13, border: '1px solid #fecaca', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>اسم المستخدم</label>
            <input 
              type="text"
              placeholder="أدخل اسم المستخدم" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              autoFocus 
              disabled={loading || attempts >= 5}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, display: 'block', color: '#334155' }}>كلمة المرور</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={loading || attempts >= 5}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || attempts >= 5} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: (loading || attempts >= 5) ? '#94a3b8' : '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 12, 
              fontSize: 15, 
              fontWeight: 800, 
              cursor: (loading || attempts >= 5) ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              marginTop: 8,
              boxShadow: (loading || attempts >= 5) ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={18} />}
            {loading ? 'جاري الدخول...' : attempts >= 5 ? 'محظور مؤقتاً' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            العودة للمتجر الرئيسي <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}