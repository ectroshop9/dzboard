import { Link, useLocation } from 'react-router-dom';
import { 
  Lock, LayoutDashboard, Package, ClipboardList, ScanLine, FileText, Settings 
} from 'lucide-react';

export default function MobileBottomNav({ onAddClick }) {
  const location = useLocation();

  const navItems = [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', path: '/admin/products', icon: Package },
    { label: 'الطلبات', path: '/admin/orders', icon: ClipboardList },
    { label: 'الباركود', path: '/admin/scan', icon: ScanLine },
    { label: 'الزبائن', path: '/admin/requests', icon: FileText },
    { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-around',
      zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      overflowX: 'auto'
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
              justify: 'center',
              gap: 2,
              textDecoration: 'none',
              color: isActive ? '#2563eb' : '#64748b',
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              minWidth: 50,
              padding: '4px 0'
            }}
          >
            <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}