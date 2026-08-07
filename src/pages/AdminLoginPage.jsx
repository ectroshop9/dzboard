import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.adminLogin(username, password);
      
      if (data.success) {
        localStorage.setItem('dzboard_admin_token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسيرفر');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Cairo', sans-serif" }}>
      <div className="card" style={{ padding: '40px 28px', maxWidth: 420, width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="icon-box icon-box-lg" style={{ background: 'rgba(99,102,241,0.12)', color: '#3b82f6', margin: '0 auto 16px auto', width: 64, height: 64 }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>لوحة التحكم</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>DZBoard Admin</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', fontSize: 13, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>اسم المستخدم</label>
            <input className="field-input" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>كلمة المرور</label>
            <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ gap: 8, marginTop: 8 }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Lock size={18} />}
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm">العودة للمتجر</button>
        </div>
      </div>
    </div>
  );
}
