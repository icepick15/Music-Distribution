// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import ModernFooter from './components/ModernFooter';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import PricingPage from './pages/PricingPage';
import AboutUs from './pages/public/AboutUs';
import Careers from './pages/public/Careers';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import CookiePolicy from './pages/public/CookiePolicy';
import DMCA from './pages/public/DMCA';
import ContactUs from './pages/public/ContactUs';
import HelpCenter from './pages/public/HelpCenter';

// Auth Pages
import Login from "./pages/auth/Login";
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import DashboardMusic from './pages/DashboardMusic';
import Upload from './pages/Upload';
import SubscriptionPage from './pages/SubscriptionPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import Settings from './pages/Settings';
import CreateAlbum from './pages/CreateAlbum';
import ScheduleRelease from './pages/ScheduleRelease';
import ReleaseForm from './features/releases/ReleaseForm';
import ReleaseSuccess from "@/features/releases/ReleaseConfirmation";
import TicketsPage from './features/tickets/TicketsPage';
import ArtistPage from './pages/ArtistPage';
import StreamDashboard from './pages/StreamDashboard';
import NotificationTest from './pages/NotificationTest';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

// Error Pages
import { NotFound, Unauthorized } from './pages/error';

const AppRoutes = () => {
  return (
    <>
      {/* Public Layout: Navbar + Content + Footer */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <ModernFooter />
          </>
        } />
        <Route path="/pricing" element={
          <>
            <Navbar />
            <PricingPage />
            <ModernFooter />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navbar />
            <AboutUs />
            <ModernFooter />
          </>
        } />
        <Route path="/careers" element={
          <>
            <Navbar />
            <Careers />
            <ModernFooter />
          </>
        } />
        <Route path="/privacy" element={
          <>
            <Navbar />
            <PrivacyPolicy />
            <ModernFooter />
          </>
        } />
        <Route path="/terms" element={
          <>
            <Navbar />
            <TermsOfService />
            <ModernFooter />
          </>
        } />
        <Route path="/cookies" element={
          <>
            <Navbar />
            <CookiePolicy />
            <ModernFooter />
          </>
        } />
        <Route path="/dmca" element={
          <>
            <Navbar />
            <DMCA />
            <ModernFooter />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <ContactUs />
            <ModernFooter />
          </>
        } />
        <Route path="/help" element={
          <>
            <Navbar />
            <HelpCenter />
            <ModernFooter />
          </>
        } />
        <Route path="/faq" element={
          <>
            <Navbar />
            <HelpCenter />
            <ModernFooter />
          </>
        } />

        {/* Auth Routes - Standalone */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<Login />} />

        {/* Dashboard Routes - Protected with custom ProtectedRoute */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireAuth={true}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/music" element={
          <ProtectedRoute requireAuth={true}>
            <DashboardMusic />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute requireAuth={true}>
            <Upload />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/create-album" element={
          <ProtectedRoute requireAuth={true}>
            <CreateAlbum />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/schedule" element={
          <ProtectedRoute requireAuth={true}>
            <ScheduleRelease />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute requireAuth={true}>
            <StreamDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/subscription" element={
          <ProtectedRoute requireAuth={true}>
            <SubscriptionPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/payments" element={
          <ProtectedRoute requireAuth={true}>
            <PaymentMethodsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute requireAuth={true}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/music/release" element={
          <ProtectedRoute requireAuth={true}>
            <ReleaseForm />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/music/success" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReleaseSuccess />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/tickets" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/artist" element={
          <ProtectedRoute requireAuth={true}>
            <ArtistPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/sales" element={
          <ProtectedRoute requireAuth={true}>
            <StreamDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Protected */}
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly={true} developersOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Error Pages - Standalone */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Unauthorized />
          </div>
        } />
        
        {/* 404 Catch-all route - must be last */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <NotFound />
          </div>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            {/* Global toast container (one place only) */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#363636', color: '#fff' },
                success: { duration: 5000, iconTheme: { primary: '#10B981', secondary: '#fff' } },
                error: { duration: 6000, iconTheme: { primary: '#EF4444', secondary: '#fff' } }
              }}
            />
          </Router>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
