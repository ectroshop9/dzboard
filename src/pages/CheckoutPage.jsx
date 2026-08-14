import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Truck, Home, Loader2, Package, ChevronLeft, Shield, Check, RefreshCw, ZoomIn } from 'lucide-react';
import { api } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = location.state?.items || JSON.parse(localStorage.getItem('cartItems') || '[]');

  // استرجاع البيانات المحفوظة سابقاً
  const [fullName, setFullName] = useState(() => localStorage.getItem('checkout_name') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('checkout_phone') || '');
  const [wilayaId, setWilayaId] = useState(() => localStorage.getItem('checkout_wilaya') || '');
  const [commune, setCommune] = useState(() => localStorage.getItem('checkout_commune') || '');
  const [address, setAddress] = useState(() => localStorage.getItem('checkout_address') || '');
  const [shippingType, setShippingType] = useState('domicile');
  
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [fees, setFees] = useState(null);
  
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);

  const formRef = useRef(null);

  // حفظ التغييرات محلياً لمنع ضياع البيانات
  useEffect(() => { localStorage.setItem('checkout_name', fullName); }, [fullName]);
  useEffect(() => { localStorage.setItem('checkout_phone', phone); }, [phone]);
  useEffect(() => { localStorage.setItem('checkout_wilaya', wilayaId); }, [wilayaId]);
  useEffect(() => { localStorage.setItem('checkout_commune', commune); }, [commune]);
  useEffect(() => { localStorage.setItem('checkout_address', address); }, [address]);

  useEffect(() => {
    let isMounted = true;
    api.getWilayas?.() || fetch('https://dzboard.onrender.com/api/shipping/wilayas').then(r => r.json())
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

    Promise.all([
      fetch(`https://dzboard.onrender.com/api/shipping/fee?wilaya_id=${wilayaId}`, { signal: controller.signal }).then(r => r.json()),
      fetch(`https://dzboard.onrender.com/api/shipping/communes?wilaya_id=${wilayaId}`, { signal: controller.signal }).then(r => r.json())
    ])
      .then(([feeData, communesData]) => {
        if (feeData?.success) setFees(feeData.fees);
        if (communesData?.success) setCommunes(communesData.communes);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Error loading communes/fees:', err);
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

  const validate = () => {
    const errors = {};
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    
    if (!fullName.trim()) errors.fullName = 'الاسم الكامل مطلوب';
    if (!cleanPhone) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^0[5-7]\d{8}$/.test(cleanPhone)) {
      errors.phone = 'رقم غير صحيح (مثال: 0661234567)';
    }
    if (!wilayaId) errors.wilayaId = 'يرجى اختيار الولاية';
    if (!commune) errors.commune = 'يرجى اختيار البلدية';
    if (!address.trim()) errors.address = 'العنوان التفصيلي مطلوب';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      setError('يرجى تصحيح الأخطاء الموضحة أدناه');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.createOrder({
        full_name: fullName.trim(),
        phone: phone.replace(/\s+/g, '').trim(),
        wilaya_id: parseInt(wilayaId, 10),
        commune,
        address: address.trim(),
        shipping_type: shippingType,
        items: cartItems.map(i => ({ id: i.id, name: i.name || i.title || 'منتج', quantity: parseInt(i.quantity, 10) }))
      });

      if (res.success) {
        localStorage.removeItem('cartItems');
        ['checkout_name', 'checkout_phone', 'checkout_wilaya', 'checkout_commune', 'checkout_address'].forEach(k => localStorage.removeItem(k));
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
      <div style={{ background: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: 16 }}>
        <div style={{ textAlign: 'center', padding: '32px 20px', background: '#fff', borderRadius: 12, maxWidth: 400, width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
          <Package size={48} style={{ color: '#999', marginBottom: 16 }} />
          <h2 style={{ marginBottom: 12, fontSize: 18, color: '#333' }}>لا توجد منتجات في السلة</h2>
          <Link to="/store" style={{ display: 'inline-block', background: '#ff6600', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>تصفح المتجر</Link>
        </div>
      </div>
    );
  }

  const getInputStyle = (errorKey) => ({
    width: '100%',
    padding: '12px',
    border: fieldErrors[errorKey] ? '1.5px solid #e44' : '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: fieldErrors[errorKey] ? '#fff8f8' : '#fff',
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl', paddingBottom: 40 }}>
      
      {/* الشريط العلوي */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#333', padding: 4, display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={22} />
            </button>
            <h1 style={{ fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700, margin: 0, color: '#222' }}>تأكيد الطلب</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2e7d32', fontSize: 11, fontWeight: 700, background: '#e8f5e9', padding: '4px 8px', borderRadius: 20, flexShrink: 0 }}>
            <Shield size={14} /> دفع عند الاستلام
          </div>
        </div>
      </div>

      {/* مؤشر خطوات الشراء */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 12px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(6px, 2vw, 16px)', fontSize: 11, color: '#888' }}>
          <span style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 2 }}><Check size={12} /> السلة</span>
          <span>←</span>
          <span style={{ color: '#ff6600', fontWeight: 700 }}>معلومات الشحن</span>
          <span>←</span>
          <span>تأكيد الطلب</span>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 12px' }}>
        {error && <div style={{ background: '#fff0f0', color: '#e44', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, border: '1px solid #fcc' }}>{error}</div>}

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          
          {/* الجانب الأول: تفاصيل وصور المنتجات */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ marginBottom: 12 }}>
                  <div 
                    onClick={() => setZoomedImage(item.image || 'https://via.placeholder.com/500')}
                    style={{ 
                      width: '100%', 
                      borderRadius: 8, 
                      overflow: 'hidden', 
                      position: 'relative',
                      cursor: 'pointer',
                      background: '#fafafa'
                    }}
                  >
                    <img 
                      src={item.image || 'https://via.placeholder.com/500'} 
                      alt="صورة المنتج" 
                      className="product-zoom-img"
                      style={{ 
                        width: '100%', 
                        maxHeight: '320px', 
                        objectFit: 'cover', 
                        borderRadius: 8,
                        display: 'block',
                        transition: 'transform 0.35s ease-in-out'
                      }} 
                    />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ZoomIn size={12} /> اضغط التكبير
                    </div>
                  </div>

                  {/* تفاصيل المنتج */}
                  <div style={{ padding: '10px 4px 0 4px', borderBottom: cartItems.length > 1 ? '1px solid #eee' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#333', lineHeight: 1.4 }}>{item.title || item.name || 'منتج متميز'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: '#666' }}>الكمية: {item.quantity}</span>
                      <span style={{ fontWeight: 700, color: '#ff6600', fontSize: 15 }}>{(parseFloat(item.price || 0) * item.quantity).toLocaleString('en-US')} دج</span>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#666', fontSize: 11, background: '#f8f9fa', padding: 8, borderRadius: 6 }}>
                <RefreshCw size={14} style={{ color: '#ff6600', flexShrink: 0 }} />
                <span>التوصيل متوفر لكافة الولايات المعنية مع إمكانية المعاينة قبل الدفع</span>
              </div>
            </div>

            {/* شارات الضمان */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div style={{ flex: 1 }}>
                <Shield size={18} style={{ color: '#ff6600', marginBottom: 2 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>ضمان الجودة</div>
              </div>
              <div style={{ width: 1, background: '#eee', margin: '0 4px' }}></div>
              <div style={{ flex: 1 }}>
                <RefreshCw size={18} style={{ color: '#ff6600', marginBottom: 2 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>المعاينة عند الاستلام</div>
              </div>
            </div>
          </div>

          {/* الجانب الثاني: نموذج البيانات الشحن */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#222', marginBottom: 14 }}>معلومات الاستلام</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                <div>
                  <input
                    style={getInputStyle('fullName')}
                    placeholder="الاسم الكامل *"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setFieldErrors(prev => ({...prev, fullName: null})); }}
                    maxLength={100}
                  />
                  {fieldErrors.fullName && <span style={{ color: '#e44', fontSize: 11, marginTop: 2, display: 'block' }}>{fieldErrors.fullName}</span>}
                </div>

                <div>
                  <input
                    style={{ 
                      ...getInputStyle('phone'), 
                      direction: 'ltr', 
                      textAlign: 'left' 
                    }}
                    placeholder="06 / 07 / 05 *"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setFieldErrors(prev => ({...prev, phone: null})); }}
                    type="tel"
                    inputMode="numeric"
                  />
                  {fieldErrors.phone && <span style={{ color: '#e44', fontSize: 11, marginTop: 2, display: 'block' }}>{fieldErrors.phone}</span>}
                </div>

                <div>
                  <select
                    style={getInputStyle('wilayaId')}
                    value={wilayaId}
                    onChange={e => { setWilayaId(e.target.value); setFieldErrors(prev => ({...prev, wilayaId: null})); }}
                  >
                    <option value="">{loadingWilayas ? 'جاري تحميل الولايات...' : 'اختر الولاية *'}</option>
                    {wilayas.map(w => (<option key={w.wilaya_id} value={w.wilaya_id}>{w.wilaya_id} - {w.name_ar}</option>))}
                  </select>
                  {fieldErrors.wilayaId && <span style={{ color: '#e44', fontSize: 11, marginTop: 2, display: 'block' }}>{fieldErrors.wilayaId}</span>}
                </div>

                <div>
                  <select
                    style={getInputStyle('commune')}
                    value={commune}
                    onChange={e => { setCommune(e.target.value); setFieldErrors(prev => ({...prev, commune: null})); }}
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
                  {fieldErrors.commune && <span style={{ color: '#e44', fontSize: 11, marginTop: 2, display: 'block' }}>{fieldErrors.commune}</span>}
                </div>

                <div>
                  <textarea
                    style={{ ...getInputStyle('address'), resize: 'vertical' }}
                    placeholder="العنوان بالتفصيل *"
                    value={address}
                    onChange={e => { setAddress(e.target.value); setFieldErrors(prev => ({...prev, address: null})); }}
                    maxLength={200}
                    rows={2}
                  />
                  {fieldErrors.address && <span style={{ color: '#e44', fontSize: 11, marginTop: 2, display: 'block' }}>{fieldErrors.address}</span>}
                </div>

              </div>
            </div>

            {/* تفاصيل الشحن والمجموع */}
            {fees && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShippingType('domicile')}
                    style={{
                      padding: '10px 6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: shippingType === 'domicile' ? '2px solid #ff6600' : '1px solid #ddd',
                      background: shippingType === 'domicile' ? '#fff9f0' : '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Home size={18} style={{ color: shippingType === 'domicile' ? '#ff6600' : '#666' }} />
                    <div style={{ fontWeight: 600, fontSize: 11 }}>توصيل للمنزل</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ff6600' }}>{parseFloat(fees.domicile).toLocaleString('en-US')} دج</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingType('stopdesk')}
                    disabled={!fees.stopdesk || parseFloat(fees.stopdesk) === 0}
                    style={{
                      padding: '10px 6px',
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
                      transition: 'all 0.2s'
                    }}
                  >
                    <Truck size={18} style={{ color: shippingType === 'stopdesk' ? '#ff6600' : '#666' }} />
                    <div style={{ fontWeight: 600, fontSize: 11 }}>توصيل للمكتب</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ff6600' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#222', marginTop: 8 }}>
                    <span>المجموع الإجمالي</span><span style={{ color: '#ff6600' }}>{total.toLocaleString('en-US')} دج</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: 14,
                background: submitting ? '#ccc' : '#ff6600',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: submitting ? 'none' : '0 4px 12px rgba(255, 102, 0, 0.25)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {submitting ? 'جاري التأكيد...' : 'تأكيد الطلب الآن'}
            </button>
          </form>
        </div>
      </div>

      {/* نافذة المنبثقة للتكبير عند الضغط على الصورة في الهواتف والحواسيب */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <img src={zoomedImage} alt="تكبير المنتج" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }} />
        </div>
      )}

      {/* أنماط الحركة والتجاوب الخاصة */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .product-zoom-img:hover {
            transform: scale(1.35) !important;
          }
        }
        @media (max-width: 480px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}