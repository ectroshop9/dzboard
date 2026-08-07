import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Truck, Home, Loader2, MapPin, Package, ChevronLeft, Shield } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.items || [];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [shippingType, setShippingType] = useState('domicile');
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [fees, setFees] = useState(null);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/shipping/wilayas')
      .then(res => res.json())
      .then(data => { if (data.success) setWilayas(data.wilayas); setLoadingWilayas(false); })
      .catch(() => setLoadingWilayas(false));
  }, []);

  useEffect(() => {
    if (!wilayaId) { setCommunes([]); setCommune(''); setFees(null); return; }
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

  useEffect(() => {
    if (fees && parseFloat(fees.stopdesk) === 0 && shippingType === 'stopdesk') {
      setShippingType('domicile');
    }
  }, [fees, shippingType]);

  if (cartItems.length === 0) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Package size={48} style={{ color: '#999', marginBottom: 16 }} />
          <h2>لا توجد منتجات</h2>
          <Link to="/store" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 600 }}>تصفح المتجر</Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shippingCost = fees ? (parseFloat(fees[shippingType]) || 0) : 0;
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
        body: JSON.stringify({ full_name: fullName, phone, wilaya_id: parseInt(wilayaId), commune, address, shipping_type: shippingType, items: cartItems.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })), total_price: subtotal, shipping_cost: shippingCost }),
      });
      const data = await res.json();
      if (data.success) navigate('/thank-you', { state: { trackingNumber: data.trackingNumber, orderId: data.orderId } });
      else setError(data.message || 'فشل');
    } catch { setError('خطأ'); }
    setSubmitting(false);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui', direction: 'rtl' }}>
      
      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#333' }}>
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginRight: 8, color: '#222' }}>تأكيد الطلب</h1>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        {error && <div style={{ background: '#fff0f0', color: '#e44', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          
          {/* العمود اليمين - المنتجات */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ background: '#fff', borderRadius: 12, padding: 12, display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#222', marginBottom: 4 }}>{item.name}</h4>
                  <p style={{ fontSize: 12, color: '#999' }}>الكمية: {item.quantity}</p>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ff6600', marginTop: 4 }}>{(parseFloat(item.price) * item.quantity).toLocaleString("en-US")} دج</div>
                </div>
              </div>
            ))}

            {/* ملخص سريع */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                <span>المجموع</span><span>{subtotal.toLocaleString("en-US")} دج</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                <span>الشحن</span><span style={{ color: '#0a0' }}>{shippingCost === 0 ? 'يُحدد بعد اختيار الولاية' : `${shippingCost.toLocaleString("en-US")} دج`}</span>
              </div>
              <hr style={{ borderColor: '#eee', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#222' }}>
                <span>الإجمالي</span><span style={{ color: '#ff6600' }}>{total.toLocaleString("en-US")} دج</span>
              </div>
            </div>
          </div>

          {/* العمود اليسار - النموذج */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 14 }}>معلومات التوصيل</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="الاسم الكامل *" value={fullName} onChange={e => setFullName(e.target.value)} required />
                <input style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} placeholder="رقم الهاتف *" value={phone} onChange={e => setPhone(e.target.value)} required type="tel" />
                
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} value={wilayaId} onChange={e => setWilayaId(e.target.value)} required disabled={loadingWilayas}>
                  <option value="">{loadingWilayas ? 'جاري التحميل...' : 'اختر الولاية *'}</option>
                  {wilayas.map(w => (<option key={w.wilaya_id} value={w.wilaya_id}>{w.name_ar}</option>))}
                </select>

                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} value={commune} onChange={e => setCommune(e.target.value)} required disabled={!wilayaId || loadingCommunes}>
                  <option value="">{!wilayaId ? 'اختر الولاية أولاً' : loadingCommunes ? 'جاري تحميل البلديات...' : communes.length === 0 ? 'لا توجد بلديات' : 'اختر البلدية *'}</option>
                  {communes.map(c => (<option key={c.id || c.name_fr} value={c.name_fr || c.name_ar}>{c.name_ar}</option>))}
                </select>

                <textarea style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="العنوان التفصيلي *" value={address} onChange={e => setAddress(e.target.value)} required rows={2} />
              </div>
            </div>

            {fees && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button type="button" onClick={() => setShippingType('domicile')} style={{ padding: 10, textAlign: 'center', cursor: 'pointer', borderRadius: 8, border: shippingType === 'domicile' ? '2px solid #ff6600' : '1px solid #ddd', background: shippingType === 'domicile' ? '#fff5f0' : '#fff', color: '#333' }}>
                    <Home size={18} /><div style={{ fontWeight: 600, fontSize: 12, marginTop: 4 }}>توصيل للمنزل</div><div style={{ fontSize: 14, fontWeight: 700, color: '#ff6600', marginTop: 2 }}>{fees.domicile} دج</div>
                  </button>
                  <button type="button" onClick={() => setShippingType('stopdesk')} disabled={!fees.stopdesk || parseFloat(fees.stopdesk) === 0} style={{ padding: 10, textAlign: 'center', borderRadius: 8, cursor: !fees.stopdesk || parseFloat(fees.stopdesk) === 0 ? 'not-allowed' : 'pointer', border: shippingType === 'stopdesk' ? '2px solid #ff6600' : '1px solid #ddd', background: shippingType === 'stopdesk' ? '#fff5f0' : '#fff', opacity: !fees.stopdesk || parseFloat(fees.stopdesk) === 0 ? 0.5 : 1, color: '#333' }}>
                    <Truck size={18} /><div style={{ fontWeight: 600, fontSize: 12, marginTop: 4 }}>Stop Desk</div><div style={{ fontSize: 14, fontWeight: 700, color: '#ff6600', marginTop: 2 }}>{fees.stopdesk} دج</div>
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting || !wilayaId} style={{ width: '100%', padding: 14, background: submitting ? '#ccc' : '#ff6600', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px rgba(255,102,0,0.3)' }}>
              {submitting ? <Loader2 size={18} className="spin" /> : <Shield size={18} />}
              {submitting ? 'جاري التأكيد...' : 'تأكيد الطلب - الدفع عند الاستلام'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#999', marginTop: 8 }}>
              <Shield size={12} style={{ verticalAlign: 'middle' }} /> دفع آمن عند الاستلام
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
