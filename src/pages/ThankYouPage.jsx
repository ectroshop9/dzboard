import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Copy, Home, ShoppingBag, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackingNumber, orderId } = location.state || {};
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!location.state) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
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
      <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, textAlign: 'center', padding: '32px 16px', maxWidth: 450, width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>لا توجد تفاصيل طلب حالية</h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(12px, 3.5vw, 14px)', marginBottom: 20 }}>سيتم إعادة توجيهك إلى الرئيسية تلقائياً خلال لحظات...</p>
          <Link to="/" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            الذهاب للرئيسية الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, textAlign: 'center', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)', maxWidth: 480, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
        
        {/* Success Icon */}
        <div style={{ background: '#dcfce7', color: '#16a34a', margin: '0 auto 20px auto', width: 'clamp(56px, 12vw, 72px)', height: 'clamp(56px, 12vw, 72px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={36} />
        </div>
        
        <h1 style={{ fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>تم تأكيد طلبك بنجاح!</h1>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 'clamp(12px, 3.5vw, 14px)', lineHeight: 1.6 }}>
          شكراً لثقتك في DZBoard. سيتم تجهيز طلبك والتواصل معك قريباً لتأكيد التوصيل.
        </p>

        {/* Order Details */}
        {orderId && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>رقم الطلب:</span>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>#{orderId}</span>
          </div>
        )}

        {/* Tracking Number */}
        {trackingNumber && (
          <div style={{ background: '#eff6ff', padding: '14px 12px', borderRadius: 12, marginBottom: 16, border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <Truck size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: '#1e40af', margin: 0 }}>رقم تتبع الشحنة:</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 'clamp(16px, 4.5vw, 20px)', color: '#1d4ed8', fontWeight: 900, margin: 0, letterSpacing: 1, wordBreak: 'break-all' }}>{trackingNumber}</p>
              <button
                onClick={handleCopyTracking}
                style={{ background: '#fff', border: '1px solid #93c5fd', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                title="نسخ رقم التتبع"
              >
                <Copy size={14} style={{ color: copied ? '#16a34a' : '#2563eb' }} />
              </button>
            </div>
            {copied && <p style={{ fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: 700, margin: 0 }}>تم نسخ الرقم إلى الحافظة!</p>}
          </div>
        )}

        {/* Ecotrack Tracking Section */}
        {trackingNumber && (
          <div style={{ background: '#f0fdf4', padding: '14px 12px', borderRadius: 12, marginBottom: 24, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <Truck size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: '#166534', margin: 0 }}>Suivez votre commande</p>
            </div>
            <p style={{ fontSize: 11, color: '#166534', margin: '0 0 10px 0' }}>
              Vous pouvez suivre l'état de votre commande en temps réel en utilisant le tracking
            </p>
            <a
              href={`https://platform.dhd-dz.com/track?code=${trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#16a34a',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              تتبع الشحنة الآن
            </a>
          </div>
        )}

        {/* Delivery Timeline Status */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-around', alignItems: 'center', marginBottom: 28, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d97706', fontWeight: 700 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
            <span>قيد المعالجة</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
            <span>جاري التوصيل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
            <span>تم التسليم</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 16px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
          >
            <Home size={16} /> الرئيسية
          </button>
          <Link
            to="/"
            style={{ padding: '12px 16px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', boxSizing: 'border-box' }}
          >
            <ShoppingBag size={16} /> متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}