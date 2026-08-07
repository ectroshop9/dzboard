import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Truck, Home, CreditCard, Loader2, MapPin, Package, ChevronLeft } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.items || [];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingType, setShippingType] = useState('domicile');
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [fees, setFees] = useState(null);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // جلب الولايات
  useEffect(() => {
    fetch('/api/shipping/wilayas')
      .then(res => res.json())
      .then(data => { if (data.success) setWilayas(data.wilayas); setLoadingWilayas(false); })
      .catch(() => setLoadingWilayas(false));
  }, []);

  // جلب البلديات عند تغيير الولاية
  useEffect(() => {
    if (!wilayaId) {
      setCommunes([]);
      setCommune('');
      setFees(null);
      return;
    }
    setLoadingCommunes(true);
    Promise.all([
      fetch(`/api/shipping/fee?wilaya_id=${wilayaId}`).then(r => r.json()),
      fetch(`/api/shipping/communes?wilaya_id=${wilayaId}`).then(r => r.json()),
    ]).then(([feeData, communesData]) => {
      if (feeData.success) setFees(feeData.fees);
      if (communesData.success) setCommunes(communesData.communes);
      setLoadingCommunes(false);
    });
  }, [wilayaId]);

  // تحويل تلقائي لـ domicile إذا stopdesk غير متاح
  useEffect(() => {
    if (fees && parseFloat(fees.stopdesk) === 0 && shippingType === 'stopdesk') {
      setShippingType('domicile');
    }
  }, [fees, shippingType]);

  if (cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo', sans-serif" }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 400 }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>لا توجد منتجات</h2>
          <Link to="/store" className="btn btn-primary">تصفح المتجر</Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shippingCost = fees ? parseFloat(fees[shippingType]) : 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !wilayaId || !commune) {
      setError('جميع الحقول مطلوبة'); return;
    }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName, phone, wilaya_id: parseInt(wilayaId), commune, address,
          shipping_type: shippingType, notes,
          items: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
          total_price: subtotal, shipping_cost: shippingCost,
        }),
      });
      const data = await res.json();
      if (data.success) navigate('/thank-you', { state: { trackingNumber: data.trackingNumber, orderId: data.orderId } });
      else setError(data.message || 'فشل');
    } catch { setError('خطأ'); }
    setSubmitting(false);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm"><ChevronLeft size={18} /> رجوع</button>
          <h1 style={{ fontSize: 18, fontWeight: 900, marginRight: 8 }}>إتمام الطلب</h1>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', fontSize: 13 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div className="icon-box" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', width: 32, height: 32 }}><MapPin size={16} /></div>
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>معلومات المشتري</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="field-input" placeholder="الاسم الكامل *" value={fullName} onChange={e => setFullName(e.target.value)} required />
              <input className="field-input" placeholder="رقم الهاتف *" value={phone} onChange={e => setPhone(e.target.value)} required type="tel" />
              <select className="field-input" value={wilayaId} onChange={e => setWilayaId(e.target.value)} required disabled={loadingWilayas}>
                <option value="">{loadingWilayas ? 'جاري تحميل الولايات...' : 'اختر الولاية *'}</option>
                {wilayas.map(w => (<option key={w.wilaya_id} value={w.wilaya_id}>{w.name_ar}</option>))}
              </select>
              <select className="field-input" value={commune} onChange={e => setCommune(e.target.value)} required disabled={!wilayaId || loadingCommunes}>
                <option value="">{!wilayaId ? 'اختر الولاية أولاً' : loadingCommunes ? 'جاري تحميل البلديات...' : communes.length === 0 ? 'لا توجد بلديات - اكتبها أدناه' : 'اختر البلدية *'}</option>
                {communes.map(c => (<option key={c.id || c.name_fr} value={c.name_fr || c.name_ar}>{c.name_ar}</option>))}
              </select>
              <textarea className="field-input" placeholder="العنوان التفصيلي *" value={address} onChange={e => setAddress(e.target.value)} required rows={2} />
              <textarea className="field-input" placeholder="ملاحظات (اختياري)" value={notes} onChange={e => setNotes(e.target.value)} rows={1} />
            </div>
          </div>

          {fees && (
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>طريقة التوصيل</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={() => setShippingType('domicile')} style={{ padding: 12, textAlign: 'center', cursor: 'pointer', borderRadius: 8, border: shippingType === 'domicile' ? '2px solid var(--primary)' : '1px solid var(--border)', background: shippingType === 'domicile' ? 'rgba(99,102,241,0.06)' : 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <Home size={20} /><div style={{ fontWeight: 800, fontSize: 13, marginTop: 4 }}>توصيل للمنزل</div><div style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent)', marginTop: 2 }}>{fees.domicile} دج</div>
                </button>
                <button type="button" onClick={() => setShippingType('stopdesk')} disabled={!fees.stopdesk || parseFloat(fees.stopdesk) === 0} style={{ padding: 12, textAlign: 'center', borderRadius: 8, cursor: !fees.stopdesk || parseFloat(fees.stopdesk) === 0 ? 'not-allowed' : 'pointer', border: shippingType === 'stopdesk' ? '2px solid var(--primary)' : '1px solid var(--border)', background: shippingType === 'stopdesk' ? 'rgba(99,102,241,0.06)' : 'var(--bg-secondary)', opacity: !fees.stopdesk || parseFloat(fees.stopdesk) === 0 ? 0.5 : 1, color: 'var(--text-primary)' }}>
                  <Truck size={20} /><div style={{ fontWeight: 800, fontSize: 13, marginTop: 4 }}>Stop Desk</div><div style={{ fontSize: 15, fontWeight: 900, color: 'var(--accent)', marginTop: 2 }}>{fees.stopdesk} دج</div>
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>ملخص الحساب</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>المنتجات:</span><span style={{ fontWeight: 700 }}>{subtotal.toLocaleString()} دج</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>الشحن:</span><span style={{ fontWeight: 700 }}>{shippingCost.toLocaleString()} دج</span></div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18 }}><span>الإجمالي:</span><span style={{ color: 'var(--accent)' }}>{total.toLocaleString()} دج</span></div>
            </div>
          </div>

          <button type="submit" className="btn btn-accent btn-lg btn-block" disabled={submitting || !wilayaId} style={{ gap: 8 }}>
            {submitting ? <Loader2 size={18} className="spin" /> : <CreditCard size={18} />}
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب (الدفع عند الاستلام)'}
          </button>
        </form>
      </div>
    </div>
  );
}
