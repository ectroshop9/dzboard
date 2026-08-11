import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, Camera, Search, Loader2, RefreshCw, AlertCircle, CheckCircle2, RotateCcw, XCircle
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات والمخزون', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState(''); // حفظ الكود الممسوح بالكامل
  const [item, setItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/admin');
    }
    return () => {
      stopScan();
    };
  }, [token, navigate]);

  const stopScan = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
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
            setScannedCode(text); // حفظ النص الممسوح ضوئياً
            fetchItemDetails(text);
          },
          () => {}
        );
      } catch (err) {
        console.error('Error starting scanner:', err);
        setErrorMsg('تعذر تشغيل الكاميرا. تحقق من الإذونات أو استخدم البحث اليدوي.');
        setScanning(false);
      }
    }, 100);
  };

  const fetchItemDetails = async (code) => {
    if (!code) return;
    setLoading(true);
    setErrorMsg('');
    setItem(null);

    try {
      const res = await fetch(`${API}/inventory/items?search=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.items && data.items.length > 0) {
        setItem(data.items[0]);
      } else {
        setErrorMsg(`لم يتم العثور على أي منتج مرتبط بـ: "${code}"`);
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setErrorMsg('حدث خطأ أثناء الاتصال بالنظام. حاول مرة أخرى.');
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
      const res = await fetch(`${API}/inventory/items/${item.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setItem({ ...item, status: newStatus });
      } else {
        setErrorMsg('فشل تعديل حالة القطعة في المخزون.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMsg('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      localStorage.removeItem('dzboard_admin_token');
      navigate('/admin');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar Desktop */}
      <aside style={{ 
        width: sidebarOpen ? 240 : 72, 
        background: '#fff', 
        borderLeft: '1px solid #e2e8f0',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6, display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s' }} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU.map(menuItem => {
              const Icon = menuItem.icon;
              const isActive = location.pathname === menuItem.path;
              return (
                <Link key={menuItem.path} to={menuItem.path}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '11px 16px',
                    margin: '0 10px', 
                    borderRadius: 10, 
                    textDecoration: 'none',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    fontWeight: isActive ? 800 : 600, 
                    fontSize: 14,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    transition: 'background 0.2s'
                  }}>
                  <Icon size={20} />
                  {sidebarOpen && <span>{menuItem.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={handleLogout}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '11px 16px',
            margin: '0 10px', 
            borderRadius: 10, 
            border: 'none', 
            cursor: 'pointer',
            background: '#fef2f2', 
            color: '#ef4444', 
            fontWeight: 700, 
            fontSize: 14,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل خروج</span>}
        </button>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QrCode size={22} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0f172a' }}>مسح وفحص الباركود / QR</h1>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: 24, flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Manual Input Search */}
          <form onSubmit={handleManualSearch} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              بحث يدوي برقم SKU أو الكود:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="أدخل رمز الباركود هنا..." 
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Search size={16} /> بحث
              </button>
            </div>
          </form>

          {/* Scanner Area */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {!scanning && !item && !loading && (
              <div style={{ padding: '20px 0' }}>
                <Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>مسح باستخدام كاميرا الجهاز</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>انقر على الزر أدناه للسماح بالكاميرا ومسح الكود مباشرة</p>
                
                <button 
                  onClick={startScan} 
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Camera size={18} /> بدء تشغيل الكاميرا
                </button>
              </div>
            )}

            {scanning && (
              <div>
                <div id="reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '2px solid #2563eb' }} />
                <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#475569' }}>وجه الكاميرا نحو الباركود بشكل مباشر...</p>
                <button 
                  onClick={stopScan}
                  style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: 8
                  }}
                >
                  إلغاء المسح
                </button>
              </div>
            )}

            {loading && (
              <div style={{ padding: 40, color: '#2563eb' }}>
                <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>جاري جلب تفاصيل القطعة...</div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 14, borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0', textAlign: 'right' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Item Details Result */}
            {item && !loading && (
              <div style={{ textAlign: 'right', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginTop: 10 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>تفاصيل القطعة</span>
                  
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 800, 
                    background: item.status === 'available' ? '#d1fae5' : '#fee2e2',
                    color: item.status === 'available' ? '#047857' : '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {item.status === 'available' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {item.status === 'available' ? 'متوفر بالمخزن' : 'تم البيع / مباع'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155', marginBottom: 16 }}>
                  <div><strong>الاسم / المنتج:</strong> {item.name || item.title || 'غير مسمى'}</div>
                  <div><strong>رمز SKU:</strong> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>{item.sku || item.id || '—'}</code></div>
                  <div><strong>الرف / الموضِع:</strong> {item.shelf || 'غير محدد'}</div>
                  <div><strong>الباركود / QR القيمة:</strong> <code style={{ background: '#2563eb15', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>{scannedCode || item.barcode || manualCode || item.product_id || '—'}</code></div>
                  {item.price && <div><strong>السعر:</strong> {parseFloat(item.price).toLocaleString('en-US')} دج</div>}
                </div>

                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                  <button 
                    onClick={toggleItemStatus}
                    style={{
                      flex: 1,
                      background: item.status === 'available' ? '#d97706' : '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    {item.status === 'available' ? (
                      <>
                        <XCircle size={16} /> تأكيد البيع
                      </>
                    ) : (
                      <>
                        <RotateCcw size={16} /> إرجاع للمخزون
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => { setItem(null); setManualCode(''); setScannedCode(''); }}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <RefreshCw size={14} /> مسح آخر
                  </button>
                </div>

              </div>
            )}

          </div>

        </main>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}