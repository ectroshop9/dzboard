import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, Loader2, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://dzboard.onrender.com/api';

export default function AdminScanPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dzboard_admin_token');
  
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [item, setItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const html5QrCodeRef = useRef(null);

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
      const res = await fetch(`${API}/inventory/search?query=${encodeURIComponent(searchCode)}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (data?.success && data?.item) {
        setItem(data.item);
      } else {
        setErrorMsg(`لم يتم العثور على منتج برمز: "${searchCode}"`);
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
    setLoading(true);
    
    const newStatus = item.status === 'available' ? 'sold' : 'available';
    
    try {
      const res = await fetch(`${API}/inventory/items/${item.id}/status`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify({ status: newStatus }) 
      });
      
      const data = await res.json();
      
      if (data.success) {
        setItem(prev => ({ ...prev, status: newStatus }));
      } else {
        setErrorMsg(data.error || 'فشل تعديل حالة المنتج');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
    } finally { 
      setLoading(false); 
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
          
          {item && !loading && (
            <div style={{ textAlign: 'right', background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              
              {/* صورة المنتج - قابلة للتكبير */}
              {item.image && (
                <div 
                  style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, cursor: 'zoom-in' }} 
                  onClick={() => setShowFullImage(true)}
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0' }}
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

      {/* الصورة المكبرة */}
      {showFullImage && item?.image && (
        <div 
          onClick={() => setShowFullImage(false)}
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
            src={item.image} 
            alt={item.name}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}