import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ChevronRight, QrCode, Settings, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MENU = [
  { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات والمخزون', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { path: '/admin/scan', label: 'مسح QR', icon: QrCode },
  { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminSettingsPage() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleChangePassword = async () => {
    const res = await fetch('https://dzboard.onrender.com/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dzboard_admin_token')}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setMsg(data.message || 'تم');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>
      <div style={{ width: sidebarOpen ? 220 : 64, background: '#fff', borderLeft: '1px solid #e2e8f0', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 0', flexShrink: 0 }}>
        <div>
          <div style={{ padding: '0 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 18, color: '#3b82f6' }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
              {sidebarOpen ? <ChevronRight size={18} /> : <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />}
            </button>
          </div>
          {MENU.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 8, textDecoration: 'none',
                  background: isActive ? '#eff6ff' : 'transparent', color: isActive ? '#3b82f6' : '#64748b', fontWeight: isActive ? 700 : 500, fontSize: 14, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>الإعدادات</h2>
        <div className="card" style={{ padding: 20, maxWidth: 400 }}>
          <h3 style={{ marginBottom: 16 }}>تغيير كلمة المرور</h3>
          <input className="field-input" type="password" placeholder="كلمة المرور الحالية" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ marginBottom: 10 }} />
          <input className="field-input" type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ marginBottom: 10 }} />
          <button onClick={handleChangePassword} className="btn btn-primary">حفظ</button>
          {msg && <p style={{ marginTop: 10, fontSize: 13, color: '#10b981' }}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}
