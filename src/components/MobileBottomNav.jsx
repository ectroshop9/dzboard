import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, ScanLine, FileText, Settings,
  ShoppingBag, User, X
} from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showOrdersMenu, setShowOrdersMenu] = useState(false);

  const navItems = [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', path: '/admin/products', icon: Package },
    { label: 'الطلبات', path: null, icon: ClipboardList, action: 'orders' },
    { label: 'الباركود', path: '/admin/scan', icon: ScanLine },
    { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  const handleNavClick = (item) => {
    if (item.action === 'orders') {
      setShowOrdersMenu(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* قائمة الطلبات المنبثقة */}
      {showOrdersMenu && (
        <div 
          onClick={() => setShowOrdersMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              padding: '20px 16px 30px',
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                اختر نوع الطلبات
              </h3>
              <button 
                onClick={() => setShowOrdersMenu(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* طلبات المتجر */}
              <button
                onClick={() => {
                  setShowOrdersMenu(false);
                  navigate('/admin/orders');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  background: '#f0f9ff',
                  border: '2px solid #3b82f6',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  background: '#3b82f6',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingBag size={24} color="#fff" />
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>طلبات المتجر</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>عرض طلبات المتجر الإلكتروني</div>
                </div>
              </button>

              {/* الطلبات الخاصة */}
              <button
                onClick={() => {
                  setShowOrdersMenu(false);
                  navigate('/admin/requests');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  background: '#fef3c7',
                  border: '2px solid #f59e0b',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
              >
                <div style={{
                  background: '#f59e0b',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={24} color="#fff" />
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>الطلبات الخاصة</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>عرض الطلبات المخصصة</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* شريط التنقل السفلي */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: '#d97706',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(217, 119, 6, 0.3)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingTop: 6,
        paddingLeft: 8,
        paddingRight: 8,
        boxSizing: 'border-box'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? location.pathname === item.path : false;
          
          return (
            <div 
              key={item.label}
              onClick={() => handleNavClick(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                flex: 1,
                height: '100%',
                borderRadius: 14,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                color: '#ffffff',
                padding: '2px 0',
                cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                marginBottom: 3
              }}>
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.8 : 1.8} 
                  color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'} 
                />
              </div>
              <span style={{ 
                whiteSpace: 'nowrap',
                fontSize: 11,
                fontWeight: isActive ? 900 : 600,
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                letterSpacing: '-0.2px'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}