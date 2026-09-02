import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ArrowRight, AlertCircle, Upload, X } from 'lucide-react';

const API = '/api';

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
    setError('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/products/upload`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await res.json();
        if (data.success) {
          setForm(prev => ({ ...prev, image: data.url }));
        } else {
          setError('فشل رفع الصورة، يرجى المحاولة لاحقاً');
        }
      } catch (err) {
        setError('حدث خطأ أثناء رفع الصورة');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.part_name) {
      setError('الاسم الكامل، رقم الهاتف، واسم القطعة حقول مطلوبة');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/requests`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'فشل إرسال الطلب، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Cairo', system-ui, -apple-system, sans-serif", direction: 'rtl' }}>
        <div style={{ maxWidth: 480, width: '100%', background: '#fff', borderRadius: 20, padding: '32px 20px', border: '1px solid #a7f3d0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={44} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#065f46', marginBottom: 8 }}>تم استلام طلبك بنجاح!</h2>
          <p style={{ color: '#047857', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>سنتحقق من توفر القطعة ونقوم بالتواصل معك عبر الهاتف في أقرب وقت.</p>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '12px 20px', borderRadius: 10, background: '#10b981', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', system-ui, -apple-system, sans-serif", direction: 'rtl', padding: '16px 12px 36px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        
        {/* زر الرجوع */}
        <button onClick={() => navigate(-1)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 700, fontSize: 13, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <ArrowRight size={16} /> رجوع
        </button>

        {/* كارت النموذج الرئيسي */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: '24px 18px', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>طلب قطعة غير متوفرة</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: 13, lineHeight: 1.5 }}>أدخل بيانات القطعة التي تبحث عنها وسنتواصل معك فور توفيرها.</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>الاسم الكامل <span style={{ color: '#dc2626' }}>*</span></label>
              <input className="field-input" placeholder="مثال: محمد الأمين" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>رقم الهاتف <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="tel" className="field-input" placeholder="06 / 07 / 05 XXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>اسم القطعة المطلوبة <span style={{ color: '#dc2626' }}>*</span></label>
              <input className="field-input" placeholder="مثال: كرت تيكون، اليمونتاسيون..." value={form.part_name} onChange={e => setForm({...form, part_name: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>الماركة (اختياري)</label>
                <select className="field-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                  <option value="">كل الماركات</option>
                  <option value="samsung">Samsung</option>
                  <option value="lg">LG</option>
                  <option value="condor">Condor</option>
                  <option value="iris">Iris</option>
                  <option value="geant">Geant</option>
                  <option value="stream">Stream</option>
                  <option value="tcl">TCL</option>
                  <option value="toshiba">Toshiba</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>موديل الشاشة</label>
                <input className="field-input" placeholder="مثال: 43N5000" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>ملاحظات إضافية</label>
              <textarea className="field-input" placeholder="أكتب أي تفاصيل أخرى قد تساعدنا في إيجاد القطعة المناسبة..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
            </div>

            {/* قسم رفع الصور */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>صورة القطعة (اختياري)</label>
              {!form.image ? (
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#475569', transition: 'all 0.2s' }}>
                  <Upload size={18} style={{ color: '#3b82f6' }} /> 
                  <span>{uploading ? 'جاري رفع الصورة...' : 'رفع صورة القطعة'}</span>
                  <input type="file" accept="image/*" disabled={uploading} hidden onChange={(e) => handleImageUpload(e.target.files[0])} />
                </label>
              ) : (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fafafa' }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block' }} />
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, image: '' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* زر الإرسال */}
            <button type="submit" disabled={loading || uploading} style={{ marginTop: 8, width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: (loading || uploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', opacity: (loading || uploading) ? 0.7 : 1 }}>
              {loading ? <Loader2 size={20} className="spin" /> : <Send size={18} />}
              <span>{loading ? 'جاري إرسال الطلب...' : 'إرسال الطلب الآن'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* أنماط CSS المدمجة للتجاوب */}
      <style>{`
        .field-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          outline: none;
          font-size: 13px;
          font-family: inherit;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .field-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}