import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, ScanLine, Settings 
} from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', path: '/admin/products', icon: Package },
    { label: 'الطلبات', path: '/admin/orders-menu', icon: ClipboardList },
    { label: 'الباركود', path: '/admin/scan', icon: ScanLine },
    { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
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
              transition: 'all 0.2s',
              background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
              color: '#ffffff',
              padding: '2px 0'
            }}
          >
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.8 : 1.8} 
              color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'} 
            />
            <span style={{ 
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontWeight: isActive ? 900 : 600,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)'
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}