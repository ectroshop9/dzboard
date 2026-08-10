import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Truck, Home, Loader2, Package, ChevronLeft, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = location.state?.items || JSON.parse(localStorage.getItem('cartItems') || '[]');

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
    let isMounted = true;
    api.getWilayas?.() || fetch('/api/shipping/wilayas').then(r => r.json())
      .then(data => {
        if (isMounted && data.success) setWilayas(data.wilayas);
      })
      .catch(err => console.error('Error loading wilayas:', err))
      .finally(() => {
        if (isMounted) setLoadingWilayas(false);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!wilayaId) {
      setCommunes([]);
      setCommune('');
      setFees(null);
      return;
    }

    const controller = new AbortController();
    setLoadingCommunes(true);
    setCommune('');

    Promise.all([
      fetch(`/api/shipping/fee?wilaya_id=${wilayaId}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`/api/shipping/communes?wilaya_id=${wilayaId}`, { signal: controller.signal }).then(r => r.json())
    ])
      .then(([feeData, communesData]) => {
        if (feeData?.success) setFees(feeData.fees);
        if (communesData?.success) setCommunes(communesData.communes);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error loading communes/fees:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCommunes(false);
      });

    return () => controller.abort();
  }, [wilayaId]);

  useEffect(() => {
    const hasStopdesk = fees?.stopdesk && parseFloat(fees.stopdesk) > 0;
    if (fees && !hasStopdesk && shippingType === 'stopdesk') {
      setShippingType('domicile');
    }
  }, [fees, shippingType]);

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
  const shippingCost = fees ? (parseFloat(fees[shippingType]) || 0) : 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    const cleanName = fullName.trim();
    const cleanAddress = address.trim();

    if (!cleanName || !cleanPhone || !cleanAddress || !wilayaId || !commune) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (!/^0[5-7]\d{8}$/.test(cleanPhone)) {
      setError('يرجى إدخال رقم هاتف جزائري صالح (مثال: 0661234567)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.createOrder({
        full_name: cleanName,
        phone: cleanPhone,
        wilaya_id: parseInt(wilayaId, 10),
        commune,
        address: cleanAddress,
        shipping_type: shippingType,
        items: cartItems.map(i => ({ 
          id: i.id, 
          quantity: parseInt(i.quantity, 10) 
        }))
      });

      if (res.success) {
        localStorage.removeItem('cartItems');
        navigate('/thank-you', { state: { trackingNumber: res.trackingNumber, orderId: res.orderId } });
      } else {
        setError(res.message || 'فشل إنشاء الطلب');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12, maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Package size={48} style={{ color: '#999', marginBottom: 16 }} />
          <h2 style={{ marginBottom: 12 }}>لا توجد منتجات في السلة</h2>
          <Link to="/store" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 600 }}>تصفح المتجر</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui', direction: 'rtl' }}>
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#333' }}>
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginRight: 8, color: '#222' }}>تأكيد الطلب</h1>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        {error && <div style={{ background: '#fff0f0', color: '#e44', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #fcc' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          
          {/* العمود الأول - قائمة المنتجات مع صور مكبّرة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#444' }}>ملخص السلة ({cartItems.length})</h3>
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  background: '#fff', 
                  borderRadius: 12, 
                  padding: 14, 
                  display: 'flex', 
                  gap: 16, 
                  alignItems: 'center', 
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)' 
                }}
              >
                {/* تم تكبير حجم الصورة هنا من 70px إلى 110px مع إطار خفيف */}
                <img 
                  src={item.image || 'https://via.placeholder.com/150'} 
                  alt={item.name} 
                  style={{ 
                    width: 110, 
                    height: 110, 
                    borderRadius: 10, 
                    objectFit: 'cover',
                    border: '1px solid #f0f0f0',
                    flexShrink: 0
                  }} 
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: '#222', margin: 0, lineHeight: 1.3 }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                    الكمية: <span style={{ fontWeight: 600, color: '#333' }}>{item.quantity}</span>
                  </p>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ff6600', marginTop: 4 }}>
                    {(parseFloat(item.price || 0) * item.quantity).toLocaleString('en-US')} دج
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* العمود الثاني - النموذج */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 14 }}>معلومات التوصيل</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="الاسم الكامل *"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  maxLength={100}
                />
                <input
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  placeholder="رقم الهاتف (مثال: 0661234567) *"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  type="tel"
                />
                <select
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  value={wilayaId}
                  onChange={e => setWilayaId(e.target.value)}
                >
                  <option value="">{loadingWilayas ? 'جاري تحميل الولايات...' : 'اختر الولاية *'}</option>
                  {wilayas.map(w => (<option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.name_ar}</option>))}
                </select>

                <select
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  value={commune}
                  onChange={e => setCommune(e.target.value)}
                  disabled={!wilayaId || loadingCommunes}
                >
                  <option value="">
                    {!wilayaId 
                      ? 'اختر الولاية أولاً' 
                      : loadingCommunes 
                      ? 'جاري تحميل البلديات...' 
                      : communes.length === 0 
                      ? 'لا توجد بلديات' 
                      : 'اختر البلدية *'}
                  </option>
                  {communes.map(c => (
                    <option key={c.id || c.name_ar || c.name_fr} value={c.name_ar || c.name_fr}>
                      {c.name_ar || c.name_fr}
                    </option>
                  ))}
                </select>

                <textarea
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="العنوان بالتفصيل *"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
              </div>
            </div>

            {fees && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShippingType('domicile')}
                    style={{
                      padding: 10,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: shippingType === 'domicile' ? '2px solid #ff6600' : '1px solid #ddd',
                      background: shippingType === 'domicile' ? '#fff9f0' : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Home size={18} />
                    <div style={{ fontWeight: 600, fontSize: 12 }}>توصيل للمنزل</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6600' }}>{parseFloat(fees.domicile).toLocaleString('en-US')} دج</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingType('stopdesk')}
                    disabled={!fees.stopdesk || parseFloat(fees.stopdesk) === 0}
                    style={{
                      padding: 10,
                      textAlign: 'center',
                      cursor: (fees.stopdesk && parseFloat(fees.stopdesk) > 0) ? 'pointer' : 'not-allowed',
                      borderRadius: 8,
                      border: shippingType === 'stopdesk' ? '2px solid #ff6600' : '1px solid #ddd',
                      background: shippingType === 'stopdesk' ? '#fff9f0' : '#fff',
                      opacity: (!fees.stopdesk || parseFloat(fees.stopdesk) === 0) ? 0.5 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Truck size={18} />
                    <div style={{ fontWeight: 600, fontSize: 12 }}>توصيل للمكتب (Stop Desk)</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6600' }}>
                      {fees.stopdesk && parseFloat(fees.stopdesk) > 0 ? `${parseFloat(fees.stopdesk).toLocaleString('en-US')} دج` : 'غير متاح'}
                    </div>
                  </button>
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                    <span>المجموع الفرعي</span><span>{subtotal.toLocaleString('en-US')} دج</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                    <span>تكلفة الشحن</span><span>{shippingCost.toLocaleString('en-US')} دج</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#222', marginTop: 8 }}>
                    <span>المجموع الإجمالي المقدر</span><span style={{ color: '#ff6600' }}>{total.toLocaleString('en-US')} دج</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !wilayaId || !commune}
              style={{
                width: '100%',
                padding: 14,
                background: (submitting || !wilayaId || !commune) ? '#ccc' : '#ff6600',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                cursor: (submitting || !wilayaId || !commune) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? <Loader2 size={18} className="spin" /> : <Shield size={18} />}
              {submitting ? 'جاري التأكيد...' : 'تأكيد الطلب - الدفع عند الاستلام'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#999' }}>
              <Shield size={12} style={{ verticalAlign: 'middle', marginLeft: 4 }} /> 
              الدفع نقدًا عند استلام الطلبية
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}