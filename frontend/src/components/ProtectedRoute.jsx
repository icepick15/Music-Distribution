import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Developer mode configuration
const DEVELOPER_MODE = import.meta.env.VITE_DEVELOPER_MODE === 'true' || import.meta.env.NODE_ENV === 'development';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false,
  adminOnly = false,
  developersOnly = false 
}) => {
  const { isSignedIn, user, isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Developer mode bypass
  if (DEVELOPER_MODE && developersOnly) {
    return children;
  }

  // Developer mode bypass for authentication (allows access without login)
  if (DEVELOPER_MODE && !developersOnly) {
    // Skip authentication check in developer mode, but still check for admin/subscription requirements
    if (adminOnly || requireSubscription) {
      // In developer mode, create a mock user for admin/subscription checks
      const mockUser = {
        publicMetadata: {
          role: 'admin',
          subscription: 'premium'
        }
      };
      
      // Check admin access with mock user
      if (adminOnly && mockUser.publicMetadata.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
      }
      
      // Subscription is bypassed in developer mode, so continue
    }
    return children;
  }

  // Check authentication requirement
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check admin access
  if (adminOnly && (!user?.publicMetadata?.role || user.publicMetadata.role !== 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check subscription requirement
  if (requireSubscription && !DEVELOPER_MODE) {
    const hasValidSubscription = user?.publicMetadata?.subscription && 
                                user.publicMetadata.subscription !== 'free';
    if (!hasValidSubscription) {
      return <Navigate to="/dashboard/subscription" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
