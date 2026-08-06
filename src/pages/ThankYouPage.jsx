import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Copy, Home, ShoppingBag, Truck } from 'lucide-react';
import { useState } from 'react';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackingNumber, orderId } = location.state || {};
  const [copied, setCopied] = useState(false);

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Cairo', sans-serif" }}>
      <div className="card" style={{ textAlign: 'center', padding: '48px 28px', maxWidth: 500, width: '100%' }}>
        
        {/* Success Icon */}
        <div className="icon-box icon-box-lg" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', margin: '0 auto 24px auto', width: 80, height: 80 }}>
          <CheckCircle size={48} />
        </div>
        
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>✅ تم تأكيد طلبك!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
          شكراً لثقتك في DZBoard. سيتم تجهيز طلبك والتواصل معك قريباً لتأكيد موعد التوصيل.
        </p>

        {/* Order Details */}
        {orderId && (
          <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>رقم الطلب: </span>
            <span style={{ fontWeight: 800 }}>#{orderId}</span>
          </div>
        )}

        {/* Tracking Number */}
        {trackingNumber && (
          <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Truck size={18} style={{ color: 'var(--accent)' }} />
              <p style={{ fontWeight: 800, fontSize: 12 }}>رقم تتبع الشحنة:</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 22, color: 'var(--accent)', fontWeight: 900 }}>{trackingNumber}</p>
              <button
                onClick={handleCopyTracking}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px' }}
                title="نسخ رقم التتبع"
              >
                <Copy size={14} style={{ color: copied ? '#10b981' : 'inherit' }} />
              </button>
            </div>
            {copied && <p style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>تم النسخ!</p>}
          </div>
        )}

        {/* Delivery Info */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span>قيد المعالجة</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <span>جاري التوصيل</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <span>تم التسليم</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ gap: 6 }}>
            <Home size={16} /> الرئيسية
          </button>
          <Link to="/store" className="btn btn-primary" style={{ gap: 6 }}>
            <ShoppingBag size={16} /> متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}
