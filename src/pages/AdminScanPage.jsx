import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { LayoutDashboard, Package, ShoppingBag, QrCode, Camera, Search, Loader2, AlertCircle, Settings } from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'QR', icon: QrCode },
  { path: '/admin/settings', label: 'إعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [item, setItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const html5QrCodeRef = useRef(null);

  useEffect(() => { 
    if (!token) navigate('/admin'); 
    return () => stopScan(); 
  }, []);

  const stopScan = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try { 
        await html5QrCodeRef.current.stop(); 
        html5QrCodeRef.current.clear(); 
      } catch {}
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
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (text) => { 
            await stopScan(); 
            const clean = text?.replace(/\r?\n|\r/g, '').trim() || ''; 
            setScannedCode(clean); 
            fetchItemDetails(clean); 
          }, 
          () => {}
        );
      } catch { 
        setErrorMsg('تعذر تشغيل الكاميرا.'); 
        setScanning(false); 
      }
    }, 100);
  };

  const fetchItemDetails = async (code) => {
    const clean = code?.trim(); 
    if (!clean) return;
    
    setLoading(true); 
    setErrorMsg(''); 
    setItem(null);
    
    try {
      console.log('Original scan:', clean);
      
      // تنظيف الكود - استخرج الرقم فقط
      let searchCode = clean;
      const idMatch = clean.match(/(\d+)/);
      if (idMatch) {
        searchCode = idMatch[1];
      }
      
      console.log('Search code:', searchCode);
      
      // جلب جميع العناصر
      const res = await fetch(`${API}/inventory/items`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (data?.success && data?.items?.length > 0) {
        // ابحث بالباركود أو SKU أو ID أو product_id
        const found = data.items.find(i => 
          i.barcode?.trim() === searchCode || 
          i.sku?.trim() === searchCode ||
          String(i.id) === searchCode ||
          String(i.product_id) === searchCode
        );
        
        if (found) {
          console.log('Found item:', found);
          setItem(found);
        } else {
          // إذا لم يجد في inventory، ابحث في products
          const productRes = await fetch(`${API}/products/${searchCode}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const productData = await productRes.json();
          
          if (productData?.success && productData?.product) {
            console.log('Found product:', productData.product);
            setItem(productData.product);
          } else {
            setErrorMsg(`لم يتم العثور على: "${clean}"`);
          }
        }
      } else {
        setErrorMsg(`لم يتم العثور على: "${clean}"`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg('خطأ في الاتصال');
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
    
    const ns = item.status === 'available' ? 'sold' : 'available';
    
    try {
      const res = await fetch(`${API}/inventory/items/${item.id}`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify({ status: ns }) 
      });
      
      const data = await res.json();
      
      if (data.success) {
        setItem({ ...item, status: ns });
      } else {
        setErrorMsg('فشل التعديل');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setErrorMsg('خطأ');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ background: '#f8fafc', direction: 'rtl', minHeight: '100vh', paddingBottom: 70, fontFamily: 'system-ui' }}>
      <main style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
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
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}
            >
              <Search size={16} /> بحث
            </button>
          </div>
        </form>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          {!scanning && !item && !loading && (
            <div>
              <Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16 }}>مسح بكاميرا الهاتف</h3>
              <button 
                onClick={startScan} 
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, cursor: 'pointer', marginTop: 12 }}
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
                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
              >
                إلغاء
              </button>
            </div>
          )}
          
          {loading && (
            <div style={{ padding: 40 }}>
              <Loader2 size={36} className="spin" />
            </div>
          )}
          
          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 10, margin: '12px 0' }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
          
          {item && (
            <div style={{ textAlign: 'right', background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>{item.name}</strong>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: 12, 
                  background: item.status === 'available' ? '#d1fae5' : '#fee2e2', 
                  color: item.status === 'available' ? '#047857' : '#b91c1c' 
                }}>
                  {item.status === 'available' ? 'متوفر' : 'مباع'}
                </span>
              </div>
              
              <div style={{ fontSize: 13 }}>
                SKU: <code>{item.sku || '-'}</code> | رف: {item.shelf || '-'} | باركود: <code>{item.barcode || '-'}</code>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button 
                  onClick={toggleItemStatus} 
                  style={{ 
                    flex: 1, 
                    background: item.status === 'available' ? '#d97706' : '#2563eb', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 8, 
                    padding: '10px', 
                    fontWeight: 800, 
                    cursor: 'pointer' 
                  }}
                >
                  {item.status === 'available' ? 'بيع' : 'إرجاع'}
                </button>
                
                <button 
                  onClick={() => { setItem(null); setManualCode(''); setScannedCode(''); }} 
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  مسح آخر
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <nav style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#fff', 
        borderTop: '1px solid #e2e8f0', 
        justifyContent: 'space-around', 
        padding: '8px 0', 
        zIndex: 40 
      }}>
        {MENU.map(item => {
          const Icon = item.icon; 
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2, 
                textDecoration: 'none', 
                color: isActive ? '#2563eb' : '#64748b', 
                fontWeight: isActive ? 800 : 600, 
                fontSize: 10 
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}