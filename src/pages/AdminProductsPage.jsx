import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, Loader2, AlertCircle, X, User, Phone, MapPin, Home, Save } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://dzboard.onrender.com/api';

export default function AdminScanPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState('product');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', wilaya: '', commune: '', address: '' });
  const [savingOrder, setSavingOrder] = useState(false);
  const html5QrCodeRef = useRef(null);

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
    if (!token) navigate('/admin'); 
    return () => stopScan(); 
  }, [navigate, token]);

  const stopScan = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try { 
        await html5QrCodeRef.current.stop(); 
        html5QrCodeRef.current.clear(); 
      } catch (err) {
        console.error('فشل إيقاف الكاميرا:', err);
      }
    }
    setScanning(false);
  };

  const startScan = async () => {
    setErrorMsg(''); 
    setItem(null); 
    setScannedCode(''); 
    setScanning(true);
    
    setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode('reader'); 
        html5QrCodeRef.current = qrScanner;
        
        await qrScanner.start(
          { facingMode: 'environment' }, 
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (text) => { 
            await stopScan(); 
            const clean = text?.replace(/\r?\n|\r/g, '').trim() || ''; 
            setScannedCode(clean); 
            fetchItemDetails(clean); 
          }, 
          () => {}
        );
      } catch { 
        setErrorMsg('تعذر تشغيل الكاميرا. تأكد من منح الصلاحيات.'); 
        setScanning(false); 
      }
    }, 100);
  };

  const fetchItemDetails = async (code) => {
    const searchCode = code?.trim(); 
    if (!searchCode) return;
    
    setLoading(true); 
    setErrorMsg(''); 
    setItem(null);
    
    try {
      if (searchCode.startsWith('ORDER') || searchCode.startsWith('DHD')) {
        const orderRes = await fetch(`${API}/orders/search?query=${encodeURIComponent(searchCode)}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const orderData = await orderRes.json();
        
        if (orderData?.success && orderData?.order) {
          setItem(orderData.order);
          setItemType('order');
          setLoading(false);
          return;
        }
      }
      
      const res = await fetch(`${API}/inventory/search?query=${encodeURIComponent(searchCode)}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (data?.success && data?.item) {
        setItem(data.item);
        setItemType('product');
      } else {
        setErrorMsg(`لم يتم العثور على: "${searchCode}"`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg('خطأ في الاتصال بالخادم.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleManualSearch = (e) => { 
    e.preventDefault(); 
    if (manualCode.trim()) { 
      setScannedCode(manualCode.trim()); 
      fetchItemDetails(manualCode.trim()); 
    } 
  };

  const toggleItemStatus = async () => {
    if (!item) return;
    
    // إذا كان المنتج متوفر → فتح Modal الزبون
    if (item.status === 'available') {
      setShowCustomerModal(true);
      return;
    }
    
    // إرجاع للمخزون
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory/items/${item.id}/status`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify({ status: 'available' }) 
      });
      
      const data = await res.json();
      
      if (data.success) {
        setItem(prev => ({ ...prev, status: 'available' }));
      } else {
        setErrorMsg(data.error || 'فشل الإرجاع');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال');
    } finally { 
      setLoading(false); 
    }
  };

  // حفظ الطلب مع معلومات الزبون
  const handleSaveOrder = async () => {
    if (!customerData.name || !customerData.phone || !customerData.wilaya) {
      setErrorMsg('الاسم والهاتف والولاية مطلوبة');
      return;
    }

    setSavingOrder(true);
    
    try {
      // 1. تحديث حالة المنتج إلى مباع
      await fetch(`${API}/inventory/items/${item.id}/status`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify({ status: 'sold' }) 
      });

      // 2. إنشاء طلب مع معلومات الزبون
      const orderRes = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: customerData.name,
          phone: customerData.phone,
          wilaya_id: parseInt(customerData.wilaya),
          commune: customerData.commune || '',
          address: customerData.address || '',
          shipping_type: 'domicile',
          items: [{ id: item.id, name: item.name, quantity: 1 }],
          total_price: item.price || 0,
          shipping_cost: 0
        })
      });

      const orderData = await orderRes.json();
      
      if (orderData.success) {
        setItem(prev => ({ ...prev, status: 'sold' }));
        setShowCustomerModal(false);
        setCustomerData({ name: '', phone: '', wilaya: '', commune: '', address: '' });
        alert(`تم البيع بنجاح! رقم الطلب: #${orderData.orderId}${orderData.trackingNumber ? `\nرقم التتبع: ${orderData.trackingNumber}` : ''}`);
      } else {
        setErrorMsg(orderData.message || 'فشل إنشاء الطلب');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', direction: 'rtl', minHeight: '100vh', paddingBottom: 120, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        
        {/* شريط البحث اليدوي */}
        <form onSubmit={handleManualSearch} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              placeholder="أدخل رمز الباركود أو ID..." 
              value={manualCode} 
              onChange={e => setManualCode(e.target.value)} 
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} 
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              <Search size={16} /> بحث
            </button>
          </div>
        </form>

        {/* منطقة المسح والنتائج */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          
          {!scanning && !item && !loading && (
            <div style={{ padding: '20px 0' }}>
              <Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, margin: '0 0 12px 0' }}>مسح بكاميرا الهاتف</h3>
              <button 
                onClick={startScan} 
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Camera size={18} /> بدء الكاميرا
              </button>
            </div>
          )}
          
          {scanning && (
            <div>
              <div id="reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '2px solid #2563eb' }} />
              <button 
                onClick={stopScan} 
                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 24px', fontWeight: 700, cursor: 'pointer', marginTop: 12 }}
              >
                إلغاء المسح
              </button>
            </div>
          )}
          
          {loading && (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            </div>
          )}
          
          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 10, margin: '12px 0', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
          
          {item && itemType === 'product' && !loading && (
            <div style={{ textAlign: 'right', background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              
              {item.image && (
                <div 
                  style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, cursor: 'zoom-in' }} 
                  onPointerUp={() => setShowFullImage(true)}
                  onClick={() => setShowFullImage(true)}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0', pointerEvents: 'none' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <strong style={{ fontSize: 16 }}>{item.name}</strong>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: 12,
                  fontWeight: 'bold',
                  background: item.status === 'available' ? '#d1fae5' : '#fee2e2', 
                  color: item.status === 'available' ? '#047857' : '#b91c1c' 
                }}>
                  {item.status === 'available' ? 'متوفر' : 'مباع'}
                </span>
              </div>
              
              <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><strong>SKU:</strong> <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: 4 }}>{item.sku}</code></div>
                <div><strong>الباركود:</strong> <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: 4 }}>{item.barcode}</code></div>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button 
                  onClick={toggleItemStatus} 
                  style={{ 
                    flex: 1, 
                    background: item.status === 'available' ? '#f59e0b' : '#2563eb',
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 8, 
                    padding: '10px', 
                    fontWeight: 800, 
                    cursor: 'pointer' 
                  }}
                >
                  {item.status === 'available' ? 'تحديد كمباع' : 'إرجاع للمخزون'}
                </button>
                
                <button 
                  onClick={() => { setItem(null); setManualCode(''); setScannedCode(''); }} 
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  مسح جديد
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Zoom Modal - يعمل على الهاتف والكمبيوتر */}
      {showFullImage && item?.image && (
        <div 
          onClick={() => setShowFullImage(false)}
          onPointerUp={() => setShowFullImage(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            cursor: 'zoom-out',
            touchAction: 'manipulation'
          }}
        >
          <img 
            src={item.image} 
            alt={item.name}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', pointerEvents: 'none' }}
          />
        </div>
      )}

      {/* Customer Modal - معلومات الزبون عند البيع */}
      {showCustomerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 450,
            maxHeight: '90vh',
            overflowY: 'auto',
            direction: 'rtl',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900 }}>معلومات الزبون</h3>
              <button onClick={() => setShowCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>اسم الزبون *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    style={{ width: '100%', padding: '10px 35px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
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
                    style={{ width: '100%', padding: '10px 35px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', direction: 'ltr', textAlign: 'right' }}
                    placeholder="06XXXXXXXX"
                    value={customerData.phone}
                    onChange={e => setCustomerData({...customerData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>الولاية *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <select 
                    style={{ width: '100%', padding: '10px 35px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                    value={customerData.wilaya}
                    onChange={e => setCustomerData({...customerData, wilaya: e.target.value})}
                  >
                    <option value="">اختر الولاية</option>
                    {wilayas.map(w => (
                      <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>البلدية</label>
                <input 
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                  placeholder="البلدية"
                  value={customerData.commune}
                  onChange={e => setCustomerData({...customerData, commune: e.target.value})}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, display: 'block' }}>العنوان</label>
                <div style={{ position: 'relative' }}>
                  <Home size={16} style={{ position: 'absolute', right: 10, top: 12, color: '#94a3b8' }} />
                  <textarea 
                    style={{ width: '100%', padding: '10px 35px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', minHeight: 60 }}
                    placeholder="العنوان التفصيلي"
                    value={customerData.address}
                    onChange={e => setCustomerData({...customerData, address: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveOrder}
                disabled={savingOrder}
                style={{
                  width: '100%',
                  padding: 12,
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: savingOrder ? 0.7 : 1,
                }}
              >
                {savingOrder ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                {savingOrder ? 'جاري الحفظ...' : 'تأكيد البيع وإرسال للشحن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}