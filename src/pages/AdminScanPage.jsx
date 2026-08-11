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

  useEffect(() => { if (!token) navigate('/admin'); return () => stopScan(); }, []);

  const stopScan = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try { await html5QrCodeRef.current.stop(); html5QrCodeRef.current.clear(); } catch {}
    }
    setScanning(false);
  };

  const startScan = async () => {
    setErrorMsg(''); setItem(null); setScannedCode(''); setScanning(true);
    setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode('reader'); html5QrCodeRef.current = qrScanner;
        await qrScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 220 } },
          async (text) => { await stopScan(); const clean = text?.trim() || ''; setScannedCode(clean); fetchItemDetails(clean); }, () => {});
      } catch { setErrorMsg('تعذر تشغيل الكاميرا.'); setScanning(false); }
    }, 100);
  };

  const fetchItemDetails = async (code) => {
    const clean = code?.trim(); if (!clean) return;
    setLoading(true); setErrorMsg(''); setItem(null);
    try {
      const res = await fetch(`${API}/inventory/items?search=${encodeURIComponent(clean)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const itemsList = data.items || data.data || (Array.isArray(data) ? data : null);
      if (itemsList?.length > 0) setItem(itemsList[0]);
      else if (data.item) setItem(data.item);
      else setErrorMsg(`لم يتم العثور على: "${clean}"`);
    } catch { setErrorMsg('خطأ في الاتصال'); }
    finally { setLoading(false); }
  };

  const handleManualSearch = (e) => { e.preventDefault(); if (manualCode.trim()) { setScannedCode(manualCode.trim()); fetchItemDetails(manualCode.trim()); } };
  
  const toggleItemStatus = async () => {
    if (!item) return; setLoading(true);
    const ns = item.status === 'available' ? 'sold' : 'available';
    try {
      const res = await fetch(`${API}/inventory/items/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: ns }) });
      if (res.ok) setItem({ ...item, status: ns }); else setErrorMsg('فشل التعديل');
    } catch { setErrorMsg('خطأ'); } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui', direction: 'rtl' }}>
      <aside style={{ width: sidebarOpen ? 240 : 72, background: '#fff', borderLeft: '1px solid #e2e8f0', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}><span style={{ fontWeight: 900, fontSize: 20, color: '#2563eb' }}>DZ<span style={{ color: '#d97706' }}>Board</span></span></Link>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b', padding: 6 }}><ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} /></button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU.map(item => {
              const Icon = item.icon; const isActive = location.pathname === item.path;
              return <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', margin: '0 10px', borderRadius: 10, textDecoration: 'none', background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#2563eb' : '#64748b', fontWeight: isActive ? 800 : 600, fontSize: 14, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><Icon size={20} />{sidebarOpen && <span>{item.label}</span>}</Link>;
            })}
          </nav>
        </div>
        <button onClick={() => { localStorage.removeItem('dzboard_admin_token'); navigate('/admin'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', margin: '0 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: 14, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><LogOut size={20} />{sidebarOpen && <span>خروج</span>}</button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 20 }}><h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}><QrCode size={22} style={{ color: '#2563eb', marginLeft: 8 }} />مسح الباركود</h1></header>
        <main style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
          <form onSubmit={handleManualSearch} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8 }}><input type="text" placeholder="أدخل رمز الباركود..." value={manualCode} onChange={e => setManualCode(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} /><button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, cursor: 'pointer' }}><Search size={16} /> بحث</button></div>
          </form>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, textAlign: 'center' }}>
            {!scanning && !item && !loading && <div style={{ padding: 20 }}><Camera size={48} style={{ color: '#2563eb', marginBottom: 12 }} /><h3>مسح بكاميرا الجهاز</h3><button onClick={startScan} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, cursor: 'pointer', marginTop: 12 }}><Camera size={18} /> بدء الكاميرا</button></div>}
            {scanning && <div><div id="reader" style={{ width: '100%', borderRadius: 12, overflow: 'hidden', border: '2px solid #2563eb' }} /><button onClick={stopScan} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>إلغاء</button></div>}
            {loading && <div style={{ padding: 40 }}><Loader2 size={36} className="spin" /></div>}
            {errorMsg && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 14, borderRadius: 10, margin: '16px 0' }}><AlertCircle size={18} /> {errorMsg}</div>}
            {item && <div style={{ textAlign: 'right', background: '#f8fafc', borderRadius: 12, padding: 18, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><strong>{item.name}</strong><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: item.status === 'available' ? '#d1fae5' : '#fee2e2', color: item.status === 'available' ? '#047857' : '#b91c1c' }}>{item.status === 'available' ? 'متوفر' : 'مباع'}</span></div>
              <div style={{ fontSize: 13 }}>SKU: <code>{item.sku}</code> | رف: {item.shelf} | باركود: <code>{item.barcode}</code></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={toggleItemStatus} style={{ flex: 1, background: item.status === 'available' ? '#d97706' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 800, cursor: 'pointer' }}>{item.status === 'available' ? 'تأكيد البيع' : 'إرجاع للمخزون'}</button>
                <button onClick={() => { setItem(null); setManualCode(''); }} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>مسح آخر</button>
              </div>
            </div>}
          </div>
        </main>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}@media(max-width:768px){.admin-sidebar{display:none}}`}</style>
    </div>
  );
}