import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, ScanLine, FileText, Settings 
} from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', path: '/admin/products', icon: Package },
    { label: 'الطلبات', path: '/admin/orders', icon: ClipboardList },
    { label: 'الباركود', path: '/admin/scan', icon: ScanLine },
    { label: 'الطلبات الخاص', path: '/admin/requests', icon: FileText },
    { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      paddingTop: 6,
      paddingLeft: 8,
      paddingRight: 8,
      boxSizing: 'border-box'
    }}>
      {navItems.map((item) => {
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
              justifyContent: 'center',
              textDecoration: 'none',
              flex: 1,
              height: '100%',
              borderRadius: 14,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive ? '#eff6ff' : 'transparent',
              color: isActive ? '#2563eb' : '#64748b',
              padding: '2px 0'
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
                strokeWidth={isActive ? 2.5 : 1.8} 
                color={isActive ? '#2563eb' : '#64748b'} 
              />
            </div>
            <span style={{ 
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.2px'
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}