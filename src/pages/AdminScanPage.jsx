import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, Camera, Search, Loader2, AlertCircle, Menu, X
} from 'lucide-react';

const MENU = [
  { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'المسح', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

const API = 'https://dzboard.onrender.com/api';

export default function AdminScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('dzboard_admin_token');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [item, setItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const html5QrCodeRef = useRef(null);

  useEffect(() => { 
    if (!token) navigate('/admin'); 
    return () => { stopScan(); }; 
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
    setErrorMsg(''); setItem(null); setScannedCode(''); setScanning(true);
    setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode('reader'); 
        html5QrCodeRef.current = qrScanner;
        
        // إعدادات محسنة لتلائم شاشات الهواتف
        const config = { 
          fps: 10, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: Math.floor(minEdge * 0.7), height: Math.floor(minEdge * 0.7) };
          },
          aspectRatio: 1.0
        };

        await qrScanner.start(
          { facingMode: 'environment' }, 
          config,
          async (text) => { 
            await stopScan(); 
            // تنظيف النص الممسوح من رموز السطر الجديد الزائدة في الهواتف
            const clean = text ? text.replace(/\r?\n|\r/g, '').trim() : '';
            setScannedCode(clean); 
            fetchItemDetails(clean); 
          }, 
          () => {}
        );
      } catch (err) { 
        setErrorMsg('تعذر تشغيل الكاميرا. تأكد من إعطاء الصلاحية وأن الموقع يعمل بـ HTTPS.'); 
        setScanning(false); 
      }
    }, 100);
  };

  const fetchItemDetails = async (code) => {
    const clean = code?.trim(); 
    if (!clean) return;
    setLoading(true); setErrorMsg(''); setItem(null);
    try {
      const res = await fetch(`${API}/inventory/items?search=${encodeURIComponent(clean)}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      const itemsList = data.items || data.data || (Array.isArray(data) ? data : null);
      if (itemsList?.length > 0) setItem(itemsList[0]);
      else if (data.item) setItem(data.item);
      else setErrorMsg(`لم يتم العثور على: "${clean}"`);
    } catch { 
      setErrorMsg('خطأ في الاتصال بالخادم'); 
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ status: ns }) 
      });
      if (res.ok) setItem({ ...item, status: ns }); 
      else setErrorMsg('فشل تعديل حالة المنتج');
    } catch { 
      setErrorMsg('حدث خطأ في الشبكة'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dzboard_admin_token'); 
    navigate('/admin');
  };

  return (
    <div className="admin-layout">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="desktop-sidebar">
        <div>
          <div className="sidebar-header">
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>
                DZ<span style={{ color: '#d97706' }}>Board</span>
              </span>
            </Link>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU.map(menuItem => {
              const Icon = menuItem.icon; 
              const isActive = location.pathname === menuItem.path;
              return (
                <Link key={menuItem.path} to={menuItem.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  <span>{menuItem.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>خروج</span>
        </button>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {/* الهيدر العلوي المتجاوب */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <QrCode size={20} style={{ color: '#2563eb' }} />
              مسح الباركود
            </h1>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#2563eb' }} className="mobile-logo">
            DZ<span style={{ color: '#d97706' }}>Board</span>
          </span>
        </header>

        {/* قائمة الموبايل المنسدلة عند الضغط على الهامبرغر */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            {MENU.map(menuItem => {
              const Icon = menuItem.icon;
              const isActive = location.pathname === menuItem.path;
              return (
                <Link key={menuItem.path} to={menuItem.path} className={`mobile-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <Icon size={18} />
                  <span>{menuItem.label}</span>
                </Link>
              );
            })}
            <button onClick={handleLogout} className="mobile-logout-btn">
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}

        {/* حاوية الصفحة */}
        <main className="container">
          <form onSubmit={handleManualSearch} className="search-card">
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="أدخل رمز الباركود يدويًا..." 
                value={manualCode} 
                onChange={e => setManualCode(e.target.value)} 
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <Search size={16} /> 
                <span>بحث</span>
              </button>
            </div>
          </form>

          <div className="scanner-card">
            {!scanning && !item && !loading && (
              <div style={{ padding: '20px 10px' }}>
                <Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>مسح بكاميرا الهاتف</h3>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>وجه الكاميرا نحو الرمز للتعرف التلقائي</p>
                <button onClick={startScan} className="action-btn primary">
                  <Camera size={18} /> بدء الكاميرا
                </button>
              </div>
            )}

            {scanning && (
              <div>
                <div id="reader" className="qr-viewport" />
                <button onClick={stopScan} className="action-btn cancel">
                  إلغاء المسح
                </button>
              </div>
            )}

            {loading && (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Loader2 size={36} className="spin" style={{ color: '#2563eb' }} />
                <p style={{ marginTop: 10, color: '#64748b', fontSize: 14 }}>جاري جلب البيانات...</p>
              </div>
            )}

            {errorMsg && (
              <div className="error-box">
                <AlertCircle size={18} /> <span>{errorMsg}</span>
              </div>
            )}

            {item && (
              <div className="item-result-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                  <strong style={{ fontSize: 16, color: '#0f172a' }}>{item.name}</strong>
                  <span className={`status-badge ${item.status === 'available' ? 'available' : 'sold'}`}>
                    {item.status === 'available' ? 'متوفر' : 'مباع'}
                  </span>
                </div>
                
                <div className="item-details-grid">
                  <div><strong>SKU:</strong> <code>{item.sku || 'N/A'}</code></div>
                  <div><strong>الرف:</strong> {item.shelf || 'غير محدد'}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>الباركود:</strong> <code>{item.barcode || scannedCode}</code></div>
                </div>

                <div className="item-actions">
                  <button onClick={toggleItemStatus} className={`action-btn ${item.status === 'available' ? 'warning' : 'primary'}`}>
                    {item.status === 'available' ? 'تأكيد البيع' : 'إرجاع للمخزون'}
                  </button>
                  <button onClick={() => { setItem(null); setManualCode(''); }} className="action-btn secondary">
                    مسح آخر
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* الشريط السفلي للملاحة - يظهر في الهواتف فقط */}
        <nav className="bottom-nav">
          {MENU.map(menuItem => {
            const Icon = menuItem.icon;
            const isActive = location.pathname === menuItem.path;
            return (
              <Link key={menuItem.path} to={menuItem.path} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{menuItem.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* الأنماط والتصميم المتجاوب (CSS) */}
      <style>{`
        /* Base Styles */
        .admin-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: system-ui, -apple-system, sans-serif; direction: rtl; }
        .desktop-sidebar { width: 240px; background: #fff; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 0; flex-shrink: 0; position: sticky; top: 0; height: 100vh; box-sizing: border-box; }
        .sidebar-header { padding: 0 16px; margin-bottom: 24px; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 11px 16px; margin: 0 10px; border-radius: 10px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 14px; }
        .nav-link.active { background: #eff6ff; color: #2563eb; font-weight: 800; }
        .logout-btn { display: flex; align-items: center; gap: 12px; padding: 11px 16px; margin: 0 10px; border-radius: 10px; border: none; cursor: pointer; background: #fef2f2; color: #ef4444; font-weight: 700; font-size: 14px; }
        .main-content { flex: 1; min-width: 0; padding-bottom: 70px; }
        .mobile-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 14px 16px; position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; }
        .mobile-menu-toggle { display: none; background: transparent; border: none; color: #0f172a; cursor: pointer; padding: 4px; }
        .container { padding: 16px; max-width: 600px; margin: 0 auto; }
        
        /* Form & Cards */
        .search-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; margin-bottom: 16px; }
        .search-input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; width: 100%; box-sizing: border-box; }
        .search-btn { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 10px 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .scanner-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center; }
        
        /* Camera & Actions */
        .qr-viewport { width: 100%; border-radius: 12px; overflow: hidden; border: 2px solid #2563eb; background: #000; }
        .action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px; padding: 12px 20px; font-weight: 800; cursor: pointer; width: 100%; margin-top: 12px; font-size: 14px; }
        .action-btn.primary { background: #2563eb; color: #fff; }
        .action-btn.warning { background: #d97706; color: #fff; }
        .action-btn.secondary { background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; }
        .action-btn.cancel { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        
        /* Items & Details */
        .item-result-card { text-align: right; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .status-badge.available { background: #d1fae5; color: #047857; }
        .status-badge.sold { background: #fee2e2; color: #b91c1c; }
        .item-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: #475569; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 12px; }
        .item-actions { display: flex; gap: 10px; flex-direction: column; }
        
        /* Global Helpers */
        .error-box { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 10px; margin: 12px 0; font-size: 13px; display: flex; align-items: center; gap: 8px; justify-content: center; }
        .bottom-nav { display: none; }
        .mobile-dropdown-menu { display: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* Mobile Breakpoint (<768px) */
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-menu-toggle { display: block; }
          .main-content { padding-bottom: 80px; }
          .container { padding: 12px; }
          
          /* Dropdown Menu */
          .mobile-dropdown-menu { display: flex; flex-direction: column; background: #fff; border-bottom: 1px solid #e2e8f0; padding: 8px 16px; position: sticky; top: 57px; z-index: 19; }
          .mobile-nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; color: #475569; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; }
          .mobile-nav-link.active { background: #eff6ff; color: #2563eb; }
          .mobile-logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; color: #ef4444; background: transparent; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }

          /* Bottom Navigation Bar */
          .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #e2e8f0; height: 60px; justify-content: space-around; align-items: center; z-index: 30; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
          .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; color: #64748b; text-decoration: none; font-size: 10px; font-weight: 600; width: 20%; text-align: center; }
          .bottom-nav-item.active { color: #2563eb; font-weight: 800; }

          /* Layout Adjustments */
          .item-actions { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}