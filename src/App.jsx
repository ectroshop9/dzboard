import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 1. جميع الاستيرادات في الأعلى بانتظام
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import RequestPartPage from './pages/RequestPartPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminScanPage from './pages/AdminScanPage';
import AdminRequestsPage from './pages/AdminRequestsPage';

// استيراد الشريط السفلي
import MobileBottomNav from './components/MobileBottomNav';

// مكون فرعي لإظهار الشريط السفلي فقط في صفحات الأدمن (باستثناء صفحة التسجيل)
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login' && location.pathname !== '/admin';

  return (
    <>
      {children}
      {isAdminRoute && <MobileBottomNav />}
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
          <Route path="/request-part" element={<RequestPartPage />} />

          {/* صفحات لوحة التحكم الأدمن */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/scan" element={<AdminScanPage />} />
          <Route path="/admin/requests" element={<AdminRequestsPage />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;