import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Gift, Printer, User, Phone, Truck, Key } from 'lucide-react';

const API = '/api';
const LOGO = 'https://res.cloudinary.com/rsmjekym/image/upload/v1788539079/logo-removebg-preview_n4bew1.png';

const getToken = () => {
  const tokenData = localStorage.getItem('dzboard_admin_token');
  try {
    const parsed = JSON.parse(tokenData);
    return parsed.token || tokenData;
  } catch {
    return tokenData;
  }
};

export default function AdminGiftCardPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    tracking_number: '',
    serial_code: ''
  });
  const [generated, setGenerated] = useState(false);

  const generateSerial = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `DZB-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
  };

  const handleGenerateSerial = () => {
    setFormData(prev => ({ ...prev, serial_code: generateSerial() }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSerial = async () => {
    const token = getToken();
    if (!formData.serial_code) {
      alert('قم بتوليد السيريال أولاً');
      return;
    }

    try {
      await fetch(`${API}/serials/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serial_code: formData.serial_code,
          max_downloads: 1
        })
      });
      alert('✅ تم حفظ السيريال في النظام!');
    } catch (err) {
      alert('خطأ في حفظ السيريال');
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', paddingBottom: 100, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button onClick={() => navigate('/admin')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>بطاقة هدية 🎁</h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>أنشئ بطاقة هدية للزبون بعد الشراء</p>
          </div>
        </div>

        {/* النموذج */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>اسم الزبون *</label>
              <input 
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="الاسم الكامل"
                value={formData.customer_name}
                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>رقم الهاتف *</label>
              <input 
                type="tel"
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', direction: 'ltr' }}
                placeholder="06XXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>رقم التتبع</label>
              <input 
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                placeholder="مثال: 123456"
                value={formData.tracking_number}
                onChange={e => setFormData({ ...formData, tracking_number: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>السيريال المجاني</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', letterSpacing: 1, fontWeight: 700 }}
                  placeholder="DZB-XXXX-XXXX-XXXX"
                  value={formData.serial_code}
                  readOnly
                />
                <button 
                  type="button"
                  onClick={handleGenerateSerial}
                  style={{ padding: '12px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  توليد
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button 
                onClick={() => setGenerated(true)}
                style={{ flex: 2, padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}
              >
                معاينة البطاقة
              </button>
              {formData.serial_code && (
                <button 
                  onClick={handleSaveSerial}
                  style={{ flex: 1, padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}
                >
                  حفظ السيريال
                </button>
              )}
            </div>
          </div>
        </div>

        {/* البطاقة */}
        {generated && (
          <div className="gift-card-print" style={{ background: '#fff', border: '3px dashed #000', borderRadius: 16, padding: 24, color: '#000', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* زخارف */}
            <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

            {/* الشعار */}
            <div style={{ marginBottom: 16 }}>
              <img 
                src={LOGO} 
                alt="DZBoard Logo"
                style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>
              DZ<span>Board</span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
              🎁 بطاقة هدية للزبون
            </div>

            <div style={{ border: '1px solid #000', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <User size={16} />
                <span style={{ fontSize: 16, fontWeight: 800 }}>{formData.customer_name || 'اسم الزبون'}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <Phone size={16} />
                <span style={{ fontSize: 14, direction: 'ltr' }}>{formData.phone || '06XXXXXXXX'}</span>
              </div>

              {formData.tracking_number && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <Truck size={16} />
                  <span style={{ fontSize: 14 }}>رقم تتبع شركة التوصيل: {formData.tracking_number}</span>
                </div>
              )}
            </div>

            {formData.serial_code && (
              <div style={{ border: '1px solid #000', borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  <Key size={16} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>سيريال تحميل الدامب للكرت مار</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1, fontFamily: 'monospace' }}>
                  {formData.serial_code}
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 12 }}>
              ✅ الدفع عند الاستلام | 🚚 توصيل سريع | 🛠️ خدمة 7/24
            </div>
          </div>
        )}

        {/* زر طباعة */}
        {generated && (
          <button 
            onClick={handlePrint}
            style={{ width: '100%', marginTop: 16, padding: 14, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Printer size={18} /> طباعة البطاقة
          </button>
        )}
      </main>
    </div>
  );
}
