import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, 
  QrCode, Settings, Camera, Search, Loader2, RefreshCw, AlertCircle, CheckCircle2, RotateCcw, XCircle
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
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
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
          async (text) => {
            await stopScan();
            setScannedCode(text);
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
    <div className="admin-container">
      
      {/* Sidebar Desktop */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div>
          <div className="sidebar-header">
            {sidebarOpen && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <span className="brand-logo">DZ<span>Board</span></span>
              </Link>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
              <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s' }} />
            </button>
          </div>

          <nav className="nav-menu">
            {MENU.map(menuItem => {
              const Icon = menuItem.icon;
              const isActive = location.pathname === menuItem.path;
              return (
                <Link key={menuItem.path} to={menuItem.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  {sidebarOpen && <span>{menuItem.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل خروج</span>}
        </button>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="mobile-bottom-nav">
        {MENU.map(menuItem => {
          const Icon = menuItem.icon;
          const isActive = location.pathname === menuItem.path;
          return (
            <Link key={menuItem.path} to={menuItem.path} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{menuItem.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="main-area">
        
        {/* Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QrCode size={22} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#0f172a' }}>مسح وفحص الباركود / QR</h1>
          </div>
        </header>

        {/* Content */}
        <main className="content-container">
          
          {/* Manual Input Search */}
          <form onSubmit={handleManualSearch} className="card">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              بحث يدوي برقم SKU أو الكود:
            </label>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="أدخل رمز الباركود هنا..." 
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn-primary">
                <Search size={16} /> بحث
              </button>
            </div>
          </form>

          {/* Scanner Area */}
          <div className="card text-center">
            
            {!scanning && !item && !loading && (
              <div style={{ padding: '20px 0' }}>
                <Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>مسح باستخدام كاميرا الجهاز</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>انقر على الزر أدناه للسماح بالكاميرا ومسح الكود مباشرة</p>
                
                <button onClick={startScan} className="btn-primary btn-large">
                  <Camera size={18} /> بدء تشغيل الكاميرا
                </button>
              </div>
            )}

            {scanning && (
              <div>
                <div id="reader" className="scanner-frame" />
                <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#475569' }}>وجه الكاميرا نحو الباركود بشكل مباشر...</p>
                <button onClick={stopScan} className="btn-danger-outline">
                  إلغاء المسح
                </button>
              </div>
            )}

            {loading && (
              <div style={{ padding: 40, color: '#2563eb' }}>
                <Loader2 size={36} className="spin-animation" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>جاري جلب تفاصيل القطعة...</div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Item Details Result */}
            {item && !loading && (
              <div className="result-card">
                
                <div className="result-header">
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>تفاصيل القطعة</span>
                  
                  <span className={`status-badge ${item.status === 'available' ? 'available' : 'sold'}`}>
                    {item.status === 'available' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {item.status === 'available' ? 'متوفر بالمخزن' : 'تم البيع / مباع'}
                  </span>
                </div>

                <div className="item-details-list">
                  <div><strong>الاسم / المنتج:</strong> {item.name || item.title || 'غير مسمى'}</div>
                  <div><strong>رمز SKU:</strong> <code className="code-tag">{item.sku || item.id || '—'}</code></div>
                  <div><strong>الرف / الموضِع:</strong> {item.shelf || 'غير محدد'}</div>
                  <div><strong>الباركود / QR القيمة:</strong> <code className="code-tag highlight">{scannedCode || item.barcode || manualCode || item.product_id || '—'}</code></div>
                  {item.price && <div><strong>السعر:</strong> {parseFloat(item.price).toLocaleString('en-US')} دج</div>}
                </div>

                <div className="actions-group">
                  <button 
                    onClick={toggleItemStatus}
                    className={`btn-action ${item.status === 'available' ? 'btn-warning' : 'btn-primary'}`}
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
                    className="btn-secondary"
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
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          direction: rtl;
        }

        /* Sidebar Styling Desktop */
        .admin-sidebar {
          background: #fff;
          border-left: 1px solid #e2e8f0;
          transition: width 0.25s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px 0;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          box-sizing: border-box;
        }
        .admin-sidebar.open { width: 240px; }
        .admin-sidebar.closed { width: 72px; }

        .sidebar-header {
          padding: 0 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-logo { fontWeight: 900; fontSize: 20px; color: #2563eb; }
        .brand-logo span { color: #d97706; }

        .toggle-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #64748b;
          padding: 6px;
          display: flex;
          align-items: center;
        }

        .nav-menu { display: flex; flex-direction: column; gap: 4px; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          margin: 0 10px;
          border-radius: 10px;
          text-decoration: none;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
        }
        .admin-sidebar.closed .nav-item { justify-content: center; }
        .nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 800; }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          margin: 0 10px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: #fef2f2;
          color: #ef4444;
          font-weight: 700;
          font-size: 14px;
        }
        .admin-sidebar.closed .logout-btn { justify-content: center; }

        /* Mobile Bottom Navigation */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          z-index: 50;
          justify-content: space-around;
          padding: 8px 0;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }
        .mobile-nav-item.active { color: #2563eb; }

        /* Main Area Structure */
        .main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .admin-header {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .content-container {
          padding: 24px;
          flex: 1;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* Cards & Buttons */
        .card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .text-center { text-align: center; }

        .search-box { display: flex; gap: 8px; }
        .input-field {
          flex: 1;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          outline: none;
        }
        .btn-primary {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-large { padding: 12px 24px; font-size: 14px; }
        .btn-warning { background: #d97706; color: #fff; }

        .btn-danger-outline {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 14px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .scanner-frame {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #2563eb;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
          text-align: right;
        }

        .result-card {
          text-align: right;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          margin-top: 10px;
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .status-badge.available { background: #d1fae5; color: #047857; }
        .status-badge.sold { background: #fee2e2; color: #b91c1c; }

        .item-details-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
          color: #334155;
          margin-bottom: 16px;
        }

        .code-tag {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
        }
        .code-tag.highlight { background: #2563eb15; color: #2563eb; padding: 2px 8px; }

        .actions-group {
          display: flex;
          gap: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 14px;
        }
        .btn-action {
          flex: 1;
          border: none;
          border-radius: 8px;
          padding: 10px 14px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .spin-animation { animation: spin 1s linear infinite; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
          .mobile-bottom-nav { display: flex; }
          .content-container { padding: 16px; padding-bottom: 80px; }
          .search-box { flex-direction: column; }
          .btn-primary { width: 100%; }
          .actions-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}