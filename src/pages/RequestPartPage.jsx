import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api'; // يفضل استخدام ملف الخدمات الموحد

export default function RequestPartPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    part_name: '',
    brand: '',
    model: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    if (error) setError('');
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق المبدئي
    if (!form.customer_name.trim() || !form.phone.trim() || !form.part_name.trim()) {
      setError('يرجى ملء الحقول الإجبارية (الاسم، الهاتف، واسم القطعة)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // إرسال الطلب عبر ملف API الموحد أو عبر fetch المباشر مع Try/Catch
      const res = await fetch('https://dzboard.onrender.com/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('حدث خطأ في الاتصال بالسيرفر');

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'فشل إرسال الطلب، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setError('تعذر الاتصال بالشبكة، يرجى التأكد من اتصال الإنترنت');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#fff',
    transition: 'border-color 0.2s ease'
  };

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
        <div style={{ background: '#ecfdf5', borderRadius: 20, padding: 32, border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={64} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>تم استلام طلبك بنجاح!</h2>
          <p style={{ color: '#047857', fontSize: 14, marginBottom: 24 }}>سنتحقق من توفر القطعة ونقوم بالتواصل معك في أقرب وقت.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setSuccess(false); setForm({ customer_name: '', phone: '', part_name: '', brand: '', model: '', notes: '' }); }}
              style={{ padding: '10px 20px', borderRadius: 8, background: '#fff', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              طلب قطعة أخرى
            </button>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '10px 20px', borderRadius: 8, background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', padding: 20, fontFamily: "'Cairo', sans-serif", direction: 'rtl', color: '#0f172a' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 700, fontSize: 14, padding: 0 }}
      >
        <ArrowRight size={18} />
        <span>رجوع</span>
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px 0' }}>طلب قطعة غير متوفرة</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: 13, lineHeight: 1.5 }}>أدخل بيانات القطعة التي تبحث عنها وسنقوم بالبحث عنها والتواصل معك.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>الاسم الكامل <span style={{ color: '#ef4444' }}>*</span></label>
          <input 
            style={inputStyle} 
            placeholder="مثال: محمد الأمين" 
            value={form.customer_name} 
            onChange={e => handleChange('customer_name', e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>رقم الهاتف <span style={{ color: '#ef4444' }}>*</span></label>
          <input 
            type="tel"
            style={inputStyle} 
            placeholder="06XX XX XX XX" 
            value={form.phone} 
            onChange={e => handleChange('phone', e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>اسم القطعة المطلوبة <span style={{ color: '#ef4444' }}>*</span></label>
          <input 
            style={inputStyle} 
            placeholder="مثال: كارت مين بورد، تيكون، أليمونتاسيون..." 
            value={form.part_name} 
            onChange={e => handleChange('part_name', e.target.value)} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>الماركة</label>
            <select 
              style={{ ...inputStyle, cursor: 'pointer' }} 
              value={form.brand} 
              onChange={e => handleChange('brand', e.target.value)}
            >
              <option value="">اختر الماركة</option>
              <option value="samsung">Samsung</option>
              <option value="lg">LG</option>
              <option value="condor">Condor</option>
              <option value="iris">Iris</option>
              <option value="geant">Geant</option>
              <option value="stream">Stream</option>
              <option value="tcl">TCL</option>
              <option value="toshiba">Toshiba</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>موديل الشاشة</label>
            <input 
              style={inputStyle} 
              placeholder="مثال: 43N5000" 
              value={form.model} 
              onChange={e => handleChange('model', e.target.value)} 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#334155' }}>ملاحظات إضافية</label>
          <textarea 
            style={{ ...inputStyle, resize: 'vertical' }} 
            placeholder="اكتب رقم البوردة أو أي تفاصيل أخرى قد تساعدنا..." 
            value={form.notes} 
            onChange={e => handleChange('notes', e.target.value)} 
            rows={3} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            background: '#3b82f6', 
            color: '#fff', 
            border: 'none', 
            padding: '14px', 
            borderRadius: 10, 
            fontWeight: 800, 
            fontSize: 15, 
            cursor: loading ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            marginTop: 6,
            opacity: loading ? 0.8 : 1,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
          <span>{loading ? 'جاري الإرسال...' : 'إرسال الطلب'}</span>
        </button>
      </form>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}