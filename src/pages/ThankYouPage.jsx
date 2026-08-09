import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Copy, Home, ShoppingBag, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackingNumber, orderId } = location.state || {};
  const [copied, setCopied] = useState(false);

  // إعادة التوجيه إلى الصفحة الرئيسية إذا لم يكن هناك طلب مسجل
  useEffect(() => {
    if (!location.state) {
      // إتاحة فرصة 3 ثوانٍ فقط للمستخدم قبل التوجيه لمنع ظهور الصفحة فارغة
      const timer = setTimeout(() => {
        navigate('/store', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const handleCopyTracking = async () => {
    if (trackingNumber) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(trackingNumber);
        } else {
          // طريقة احتياطية للنسخ في البيئات القديمة/غير المأمنة (HTTP)
          const textArea = document.createElement('textarea');
          textArea.value = trackingNumber;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('فشل نسخ الرقم:', err);
      }
    }
  };

  if (!location.state) {
    return (
      <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "system-ui" }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, textAlign: 'center', padding: '40px 24px', maxWidth: 450, width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>لا توجد تفاصيل طلب حالية</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>سيتم إعادة توجيهك إلى المتجر تلقائياً...</p>
          <Link to="/store" style={{ background: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, display: 'inline-block' }}>
            الذهاب للمتجر الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "system-ui" }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, textAlign: 'center', padding: '48px 28px', maxWidth: 500, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        
        {/* Success Icon */}
        <div style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', margin: '0 auto 24px auto', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={48} />
        </div>
        
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>تم تأكيد طلبك بنجاح!</h1>
        <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
          شكراً لثقتك في DZBoard. سيتم تجهيز طلبك والتواصل معك قريباً لتأكيد موعد التوصيل.
        </p>

        {/* Order Details */}
        {orderId && (
          <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: 10, marginBottom: 12, fontSize: 13, display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>رقم الطلب: </span>
            <span style={{ fontWeight: 800, color: '#0f172a', marginRight: 'auto' }}>#{orderId}</span>
          </div>
        )}

        {/* Tracking Number */}
        {trackingNumber && (
          <div style={{ background: '#fff8f0', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid #ffedd5' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
              <Truck size={18} style={{ color: '#d97706' }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', margin: 0 }}>رقم تتبع الشحنة:</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 22, color: '#d97706', fontWeight: 900, margin: 0, letterSpacing: 1 }}>{trackingNumber}</p>
              <button
                onClick={handleCopyTracking}
                style={{ background: '#fff', border: '1px solid #fcd34d', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title="نسخ رقم التتبع"
              >
                <Copy size={14} style={{ color: copied ? '#10b981' : '#d97706' }} />
              </button>
            </div>
            {copied && <p style={{ fontSize: 11, color: '#10b981', marginTop: 6, fontWeight: 700, margin: 0 }}>تم نسخ الرقم إلى الحافظة!</p>}
          </div>
        )}

        {/* Delivery Timeline Status */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap', background: '#fafafa', padding: 12, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d97706', fontWeight: 700 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span>قيد المعالجة</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
            <span>جاري التوصيل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
            <span>تم التسليم</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Home size={16} /> الرئيسية
          </button>
          <Link
            to="/store"
            style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingBag size={16} /> متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}