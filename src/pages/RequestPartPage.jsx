import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ArrowRight, AlertCircle, Upload } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function RequestPartPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', phone: '', part_name: '', brand: '', model: '', notes: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/products/upload`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (data.success) setForm(prev => ({ ...prev, image: data.url }));
      } catch (err) {}
      setUploading(false);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.part_name) {
      setError('الاسم والهاتف واسم القطعة مطلوبة');
      return;
    }
    setLoading(true);
    const res = await fetch(`${API}/requests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) setSuccess(true);
    else setError(data.message || 'فشل إرسال الطلب');
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, textAlign: 'center', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
        <div style={{ background: '#ecfdf5', borderRadius: 20, padding: 32, border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={64} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>تم استلام طلبك بنجاح!</h2>
          <p style={{ color: '#047857', fontSize: 14, marginBottom: 24 }}>سنتحقق من توفر القطعة ونقوم بالتواصل معك في أقرب وقت.</p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', borderRadius: 8, background: '#10b981', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', padding: 20, fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 700, fontSize: 14 }}>
        <ArrowRight size={18} /> رجوع
      </button>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>طلب قطعة غير متوفرة</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>أدخل بيانات القطعة اللي تبحث عنها ونتواصل معك</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="field-input" placeholder="الاسم الكامل *" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
        <input className="field-input" placeholder="رقم الهاتف *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input className="field-input" placeholder="اسم القطعة المطلوبة *" value={form.part_name} onChange={e => setForm({...form, part_name: e.target.value})} />
        <select className="field-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
          <option value="">الماركة (اختياري)</option>
          <option value="samsung">Samsung</option><option value="lg">LG</option>
          <option value="condor">Condor</option><option value="iris">Iris</option>
          <option value="tcl">TCL</option><option value="toshiba">Toshiba</option>
        </select>
        <input className="field-input" placeholder="موديل الشاشة" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
        <textarea className="field-input" placeholder="ملاحظات..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
        
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 13, width: 'fit-content' }}>
          <Upload size={16} /> {uploading ? 'جاري الرفع...' : 'رفع صورة القطعة'}
          <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files[0])} />
        </label>
        {form.image && <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />}

        <button type="submit" disabled={loading} className="btn btn-accent btn-lg btn-block" style={{ gap: 8 }}>
          {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  );
}
