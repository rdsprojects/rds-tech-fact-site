import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { CmsProvider } from './context/CmsContext';
import { PublicLayout } from './components/PublicLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { PrivacyDetailPage } from './pages/PrivacyDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CmsProvider>
        <BrowserRouter basename={ROUTER_BASENAME}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:slug" element={<ApplicationDetailPage />} />
              <Route path="/privacy" element={<PrivacyCenterPage />} />
              <Route path="/privacy/:slug" element={<PrivacyDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CmsProvider>
    </MotionConfig>
  );
}
