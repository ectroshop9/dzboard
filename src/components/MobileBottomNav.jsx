import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, ScanLine, Settings 
} from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
      bottom: 20,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '100px'})`,
      width: 'calc(100% - 32px)',
      maxWidth: 500,
      height: 70,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.1)',
      padding: '6px 10px',
      boxSizing: 'border-box',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: visible ? 'auto' : 'none'
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
              borderRadius: 16,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: isActive ? '#ffffff' : '#64748b',
              padding: '4px 0',
              boxShadow: isActive ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
              transform: isActive ? 'translateY(-3px)' : 'translateY(0)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.25s ease',
              marginBottom: 3
            }}>
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.8 : 1.8} 
                color={isActive ? '#ffffff' : '#94a3b8'} 
              />
            </div>
            <span style={{ 
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontWeight: isActive ? 900 : 600,
              color: isActive ? '#ffffff' : '#94a3b8',
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