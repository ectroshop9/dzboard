import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, User, Phone, MapPin, Home, Save, Loader2, Package } from 'lucide-react';

const API = '/api';

export default function CheckoutFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tokenData = localStorage.getItem('dzboard_admin_token'); const token = (() => { try { return JSON.parse(tokenData).token; } catch { return tokenData; } })();
  const item = location.state?.item || JSON.parse(localStorage.getItem('scan_item') || 'null');

  const [customerData, setCustomerData] = useState({ name: '', phone: '', wilaya: '', commune: '', address: '' });
  const [shippingType, setShippingType] = useState('domicile');
  const [communes, setCommunes] = useState([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [error, setError] = useState('');

  const wilayas = [
    { id: 1, name: 'أدرار' }, { id: 2, name: 'الشلف' }, { id: 3, name: 'الأغواط' },
    { id: 4, name: 'أم البواقي' }, { id: 5, name: 'باتنة' }, { id: 6, name: 'بجاية' },
    { id: 7, name: 'بسكرة' }, { id: 8, name: 'بشار' }, { id: 9, name: 'البليدة' },
    { id: 10, name: 'البويرة' }, { id: 11, name: 'تمنراست' }, { id: 12, name: 'تبسة' },
    { id: 13, name: 'تلمسان' }, { id: 14, name: 'تيارت' }, { id: 15, name: 'تيزي وزو' },
    { id: 16, name: 'الجزائر' }, { id: 17, name: 'الجلفة' }, { id: 18, name: 'جيجل' },
    { id: 19, name: 'سطيف' }, { id: 20, name: 'سعيدة' }, { id: 21, name: 'سكيكدة' },
    { id: 22, name: 'سيدي بلعباس' }, { id: 23, name: 'عنابة' }, { id: 24, name: 'قالمة' },
    { id: 25, name: 'قسنطينة' }, { id: 26, name: 'المدية' }, { id: 27, name: 'مستغانم' },
    { id: 28, name: 'المسيلة' }, { id: 29, name: 'معسكر' }, { id: 30, name: 'ورقلة' },
    { id: 31, name: 'وهران' }, { id: 32, name: 'البيض' }, { id: 33, name: 'إليزي' },
    { id: 34, name: 'برج بوعريريج' }, { id: 35, name: 'بومرداس' }, { id: 36, name: 'الطارف' },
    { id: 37, name: 'تندوف' }, { id: 38, name: 'تيسمسيلت' }, { id: 39, name: 'الوادي' },
    { id: 40, name: 'خنشلة' }, { id: 41, name: 'سوق أهراس' }, { id: 42, name: 'تيبازة' },
    { id: 43, name: 'ميلة' }, { id: 44, name: 'عين الدفلى' }, { id: 45, name: 'النعامة' },
    { id: 46, name: 'عين تموشنت' }, { id: 47, name: 'غرداية' }, { id: 48, name: 'غليزان' },
    { id: 49, name: 'تيميمون' }, { id: 50, name: 'برج باجي مختار' }, { id: 51, name: 'أولاد جلال' },
    { id: 52, name: 'بني عباس' }, { id: 53, name: 'عين صالح' }, { id: 54, name: 'عين قزام' },
    { id: 55, name: 'تقرت' }, { id: 56, name: 'جانت' }, { id: 57, name: 'المغير' }, { id: 58, name: 'المنيعة' },
  ];

  useEffect(() => {
    if (!token || !item) navigate('/admin/scan');
  }, [token, item, navigate]);

  useEffect(() => {
    if (!customerData.wilaya) {
      setCommunes([]);
      setCustomerData(prev => ({ ...prev, commune: '' }));
      return;
    }
    
    setLoadingCommunes(true);
    fetch(`${API}/shipping/communes?wilaya_id=${customerData.wilaya}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setCommunes(data.communes || []);
      })
      .catch(() => setCommunes([]))
      .finally(() => setLoadingCommunes(false));
  }, [customerData.wilaya]);

  const handleSave = async () => {
    if (!customerData.name || !customerData.phone || !customerData.wilaya) {
      setError('الاسم والهاتف والولاية مطلوبة');
      return;
    }
    if (!customerData.commune) {
      setError('اختر البلدية');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await fetch(`${API}/inventory/items/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'sold' })
      });

      const orderRes = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: customerData.name,
          phone: customerData.phone,
          wilaya_id: parseInt(customerData.wilaya),
          commune: customerData.commune,
          address: customerData.address || '',
          shipping_type: shippingType,
          items: [{ id: item.id, name: item.name, quantity: 1 }],
          total_price: Number(item.price) || 500,
          shipping_cost: 500
        })
      });

      const orderData = await orderRes.json();

      if (orderData.success) {
        alert(`تم البيع بنجاح! رقم الطلب: #${orderData.orderId}${orderData.trackingNumber ? `\nرقم التتبع: ${orderData.trackingNumber}` : ''}`);
        navigate('/admin/scan');
      } else {
        setError(orderData.message || 'فشل إنشاء الطلب');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'system-ui', paddingBottom: 40 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 30 }}>
        <button onClick={() => navigate('/admin/scan')} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowRight size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>تأكيد البيع</h1>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                onClick={() => setZoomedImage(item.image)}
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', cursor: 'zoom-in' }} 
              />
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={28} style={{ color: '#94a3b8' }} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{item.name}</h3>
              <div style={{ fontSize: 13, color: '#64748b' }}>SKU: {item.sku}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{Number(item.price) || 0} دج</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>معلومات الزبون</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>اسم الزبون *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  style={{ width: '100%', padding: '10px 35px 10px 10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="الاسم الكامل"
                  value={customerData.name}
                  onChange={e => setCustomerData({...customerData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>الهاتف *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="tel"
                  style={{ width: '100%', padding: '10px 35px 10px 10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', direction: 'ltr', textAlign: 'right', boxSizing: 'border-box' }}
                  placeholder="06XXXXXXXX"
                  value={customerData.phone}
                  onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>الولاية *</label>
              <select 
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                value={customerData.wilaya}
                onChange={e => setCustomerData({...customerData, wilaya: e.target.value})}
              >
                <option value="">اختر الولاية</option>
                {wilayas.map(w => (
                  <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>البلدية *</label>
              <select 
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                value={customerData.commune}
                onChange={e => setCustomerData({...customerData, commune: e.target.value})}
                disabled={!customerData.wilaya || loadingCommunes}
              >
                <option value="">
                  {!customerData.wilaya ? 'اختر الولاية أولاً' : loadingCommunes ? 'جاري تحميل البلديات...' : communes.length === 0 ? 'لا توجد بلديات' : 'اختر البلدية'}
                </option>
                {communes.map(c => (
                  <option key={c.id || c.name_ar || c.name_fr} value={c.name_ar || c.name_fr}>
                    {c.name_ar || c.name_fr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>نوع التوصيل</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShippingType('domicile')}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: shippingType === 'domicile' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: shippingType === 'domicile' ? '#fff9f0' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Home size={16} /> منزل
                </button>
                <button
                  type="button"
                  onClick={() => setShippingType('stopdesk')}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: shippingType === 'stopdesk' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: shippingType === 'stopdesk' ? '#fff9f0' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <MapPin size={16} /> مكتب
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>العنوان</label>
              <textarea 
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', resize: 'none', minHeight: 50, boxSizing: 'border-box' }}
                placeholder="العنوان التفصيلي"
                value={customerData.address}
                onChange={e => setCustomerData({...customerData, address: e.target.value})}
                rows={2}
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: 14,
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              {saving ? 'جاري الحفظ...' : 'تأكيد البيع وإرسال للشحن'}
            </button>
          </div>
        </div>
      </div>
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={zoomedImage} 
            alt="تكبير"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}
