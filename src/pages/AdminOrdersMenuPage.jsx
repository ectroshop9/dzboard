import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ClipboardList, ScanLine, FileText, Settings,
  ShoppingBag, User, ArrowLeft, ChevronLeft
} from 'lucide-react';

const NAV = [
  { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'المنتجات', path: '/admin/products', icon: Package },
  { label: 'الطلبات', path: '/admin/orders-menu', icon: ClipboardList },
  { label: 'الباركود', path: '/admin/scan', icon: ScanLine },
  { label: 'الإعدادات', path: '/admin/settings', icon: Settings },
];

export default function AdminOrdersMenuPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ 
      background: '#f8fafc', 
      direction: 'rtl', 
      minHeight: '100vh', 
      paddingBottom: 80, 
      fontFamily: 'system-ui',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* الهيدر */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: '#0f172a' }}>
          الطلبات
        </h1>
      </div>

      {/* المحتوى */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 20,
        gap: 20,
        maxWidth: 500,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* بطاقة طلبات المتجر */}
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 24,
            background: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: 20,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)',
            width: '100%',
            textAlign: 'right'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            background: '#3b82f6',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShoppingBag size={32} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              طلبات المتجر
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              عرض الطلبات القادمة من المتجر الإلكتروني
            </div>
          </div>
          <ChevronLeft size={24} color="#94a3b8" />
        </button>

        {/* بطاقة الطلبات الخاصة */}
        <button
          onClick={() => navigate('/admin/requests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 24,
            background: '#fff',
            border: '2px solid #f59e0b',
            borderRadius: 20,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
            width: '100%',
            textAlign: 'right'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            background: '#f59e0b',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={32} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              الطلبات الخاصة
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              عرض الطلبات المخصصة من العملاء
            </div>
          </div>
          <ChevronLeft size={24} color="#94a3b8" />
        </button>
      </div>

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
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingTop: 6,
        paddingLeft: 8,
        paddingRight: 8,
        boxSizing: 'border-box'
      }}>
        {NAV.map((item) => {
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
    </div>
  );
}