import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
<Route path="/request-part" element={<RequestPartPage />} />
import RequestPartPage from './pages/RequestPartPage';
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
<Route path="/admin/settings" element={<AdminSettingsPage />} />
import AdminSettingsPage from './pages/AdminSettingsPage';
<Route path="/admin/scan" element={<AdminScanPage />} />
<Route path="/admin/requests" element={<AdminRequestsPage />} />
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminScanPage from './pages/AdminScanPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
      </Routes>
    </BrowserRouter>
  );
}

export default App;
