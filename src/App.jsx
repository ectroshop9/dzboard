import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 1. جميع الاستيرادات في الأعلى بانتظام
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import RequestPartPage from './pages/RequestPartPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminScanPage from './pages/AdminScanPage';
import CheckoutFormPage from './pages/CheckoutFormPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminOrdersMenuPage from './pages/AdminOrdersMenuPage';
import AdminBotOrdersPage from './pages/AdminBotOrdersPage';
import AdminChatLogsPage from './pages/AdminChatLogsPage';
import AdminLiveChatPage from './pages/AdminLiveChatPage';

// استيراد الشريط السفلي
import MobileBottomNav from './components/MobileBottomNav';

// استيراد البوت
import ChatBot from './components/ChatBot';
import DownloadPage from './pages/DownloadPage';
import AdminSerialsPage from './pages/AdminSerialsPage';
import AdminProductFormPage from './pages/AdminProductFormPage';

// مكون فرعي لإظهار الشريط السفلي فقط في صفحات الأدمن (باستثناء صفحة التسجيل)
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login' && location.pathname !== '/admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {children}
      {isAdminRoute && <MobileBottomNav />}
      {!isAdminPage && <ChatBot />}
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
          <Route path="/privacy" element={<PrivacyPage />} />
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
          <Route path="/admin/chat-logs" element={<AdminChatLogsPage />} />
          <Route path="/admin/serials" element={<AdminSerialsPage />} />
          <Route path="/admin/live-chat" element={<AdminLiveChatPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/scan" element={<AdminScanPage />} />
          <Route path="/admin/checkout-form" element={<CheckoutFormPage />} />
          <Route path="/admin/requests" element={<AdminRequestsPage />} />
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}

export default App;