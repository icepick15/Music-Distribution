// App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';
import DashboardMusic from './pages/DashboardMusic';
import ReleaseForm from './features/releases/ReleaseForm';
import ReleaseSuccess from "@/features/releases/ReleaseConfirmation";
import TicketsPage from './features/tickets/components/TicketDetailModal';
import ArtistPage from './pages/ArtistPage';
import SubscriptionPlans from './features/dashboard/subscription/page';
import SignInPage from "./pages/SignInPage";
import SignUpPage from './pages/SignUpPage';
import PricingPage from './pages/PricingPage';
import StreamDashboard from './pages/StreamDashboard';
import AdminRoutes from './admin/routes/AdminRoutes';
import AdminLogin from "./pages/AdminLogin";

const clerkFrontendApi = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AppRoutes = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider publishableKey={clerkFrontendApi} navigate={to => navigate(to)}>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/music" element={<DashboardMusic />} />
        <Route path="/dashboard/music/release" element={<ReleaseForm />} />
        <Route path="/dashboard/music/success" element={<ReleaseSuccess />} />
        <Route path="/dashboard/tickets" element={<TicketsPage />} />
        <Route path="/dashboard/artist" element={<ArtistPage />} />
        <Route path="/dashboard/subscription" element={<SubscriptionPlans />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        <Route path="/dashboard/sales" element={<StreamDashboard />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/admin-login*" element={<AdminLogin />} />
        
      </Routes>
      <Footer />
    </ClerkProvider>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
