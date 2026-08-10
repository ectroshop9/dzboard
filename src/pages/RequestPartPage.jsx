import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, Camera, ArrowRight } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function RequestPartPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', phone: '', part_name: '', brand: '', model: '', notes: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.part_name) {
      setError('الاسم والهاتف واسم القطعة مطلوبة');
      return;
    }
    setLoading(true);
    const res = await fetch(`${API}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(true);
    } else {
      setError(data.message || 'فشل إرسال الطلب');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 60, fontFamily: "'Cairo', sans-serif" }}>
        <CheckCircle2 size={64} style={{ color: '#10b981', marginBottom: 16 }} />
        <h2>تم استلام طلبك!</h2>
        <p>سنتواصل معك قريباً</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 20 }}>العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
        <ArrowRight size={20} /> رجوع
      </button>
      
      <h2 style={{ marginBottom: 20 }}>طلب قطعة غير متوفرة</h2>
      <p style={{ color: '#64748b', marginBottom: 20 }}>أدخل بيانات القطعة اللي تبحث عنها ونتواصل معك</p>
      
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 10, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="field-input" placeholder="اسمك الكامل *" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
        <input className="field-input" placeholder="رقم هاتفك *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input className="field-input" placeholder="اسم القطعة المطلوبة *" value={form.part_name} onChange={e => setForm({...form, part_name: e.target.value})} />
        <select className="field-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
          <option value="">الماركة (اختياري)</option>
          <option value="samsung">Samsung</option>
          <option value="lg">LG</option>
          <option value="condor">Condor</option>
          <option value="iris">Iris</option>
          <option value="tcl">TCL</option>
          <option value="toshiba">Toshiba</option>
          <option value="other">أخرى</option>
        </select>
        <input className="field-input" placeholder="موديل الشاشة (اختياري)" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
        <textarea className="field-input" placeholder="ملاحظات إضافية..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} />
        
        <button type="submit" disabled={loading} className="btn btn-accent btn-lg btn-block" style={{ gap: 8 }}>
          {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  );
}
