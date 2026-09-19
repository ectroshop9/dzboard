import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 1. جميع الاستيرادات في الأعلى بانتظام
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminScanPage from './pages/AdminScanPage';
import AdminOrdersMenuPage from './pages/AdminOrdersMenuPage';
import AdminBotOrdersPage from './pages/AdminBotOrdersPage';

// استيراد الشريط السفلي
import MobileBottomNav from './components/MobileBottomNav';

// استيراد البوت
import DownloadPage from './pages/DownloadPage';
import AdminSerialsPage from './pages/AdminSerialsPage';
import AdminGiftCardPage from './pages/AdminGiftCardPage';
import AdminTVStockPage from './pages/AdminTVStockPage';
import AdminTechniciansPage from './pages/AdminTechniciansPage';
import TechniciansMapPage from './pages/TechniciansMapPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminStopdesksPage from './pages/AdminStopdesksPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';

// مكون فرعي لإظهار الشريط السفلي فقط في صفحات الأدمن (باستثناء صفحة التسجيل)
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login' && location.pathname !== '/admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {children}
      {isAdminRoute && <MobileBottomNav />}
      {!isAdminPage && (
        <a 
          href="viber://chat?number=213673310066"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            width: 60,
            height: 60,
            background: '#7360F2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(115, 96, 242, 0.4)',
            zIndex: 9999,
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="تواصل معنا على Viber"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817c-.06 3.11.526 5.7 2.183 7.355 1.837 1.945 5.227 2.295 7.68 2.355l.06 2.473s.04.99.996.99c.79 0 2.613-2.712 2.613-2.712l.024-.024c.064 0 5.475-.085 7.223-2.855.06-.09 1.192-2.117 1.192-6.15 0-.06.04-.98-.01-1.42C22.18 4.083 19.85.85 15.34.3 15.28.3 13.34.028 11.4 0zm.16 1.798c1.906.028 3.653.31 4.113.432 3.5.44 5.317 2.605 5.372 6.034.04.372 0 1.024.01 1.075 0 3.5-.95 5.11-1 5.2-1.4 2.22-5.9 2.28-5.9 2.28l-.12.04c-.4 0-1.6 1.5-1.9 1.9l-.06-1.88-.15-.03c-2.3-.06-5.3-.35-6.7-1.75-1.4-1.4-1.7-3.6-1.65-6.05.06-2.7.5-4.6 1.8-5.9C6.66 2.05 10.1 1.82 11.4 1.8c.16 0 .2-.002.16-.002zM7.5 3.5c-.3 0-.6.1-.9.4-.9.9-1.7 2.6-1.7 4.6 0 2 .8 3.6 2.3 5.1 1.5 1.5 3.8 2.8 6.4 3.2 2.6.4 4.5.2 5.5-.4.5-.3.8-.8.7-1.3-.1-.5-.5-.9-1-1.1-.7-.3-1.9-.6-2.6-.9-.7-.3-1-.1-1.4.3-.4.4-.9 1-1.2 1.2-.3.2-.6.2-1.1 0-2.5-1-4.4-2.9-5.4-5.4-.2-.5-.2-.8 0-1.1.2-.3.8-.8 1.2-1.2.4-.4.6-.7.3-1.4-.3-.7-.6-1.9-.9-2.6-.2-.5-.6-.9-1.1-1-.1-.1-.3-.1-.4-.1z"/>
          </svg>
        </a>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          {/* صفحات الزبائن */}
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/technicians" element={<TechniciansMapPage />} />
          <Route path="/download" element={<DownloadPage />} />

          {/* صفحات لوحة التحكم الأدمن */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/add" element={<AdminProductFormPage />} />
          <Route path="/admin/products/edit/:id" element={<AdminProductFormPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders-menu" element={<AdminOrdersMenuPage />} />
          <Route path="/admin/bot-orders" element={<AdminBotOrdersPage />} />
          <Route path="/admin/serials" element={<AdminSerialsPage />} />
          <Route path="/admin/gift-card" element={<AdminGiftCardPage />} />
          <Route path="/admin/tv-stock" element={<AdminTVStockPage />} />
          <Route path="/admin/technicians" element={<AdminTechniciansPage />} />
          <Route path="/admin/technicians-map" element={<TechniciansMapPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/scan" element={<AdminScanPage />} />
          <Route path="/admin/stopdesks" element={<AdminStopdesksPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;