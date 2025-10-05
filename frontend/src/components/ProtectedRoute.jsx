import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Developer mode configuration
const DEVELOPER_MODE = import.meta.env.VITE_DEVELOPER_MODE === 'true' || import.meta.env.NODE_ENV === 'development';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false,
  adminOnly = false,
  requireAdmin = false,
  requireStaff = false,
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
    if (adminOnly || requireAdmin || requireStaff || requireSubscription) {
      // In developer mode, create a mock user for admin/subscription checks
      const mockUser = {
        publicMetadata: {
          role: 'admin',
          subscription: 'premium'
        }
      };
      
      // Check admin access with mock user
      if ((adminOnly || requireAdmin) && mockUser.publicMetadata.role !== 'admin') {
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

  const userRole = user?.publicMetadata?.role || user?.role;

  // Check if route requires admin role (admin has access to everything)
  if (requireAdmin) {
    if (userRole !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check if route requires staff role (allow both staff and admin)
  if (requireStaff) {
    const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';
    if (!isStaffOrAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Legacy adminOnly check - allow both admin and staff roles (for backward compatibility)
  if (adminOnly && !requireAdmin && !requireStaff) {
    const isAdminOrStaff = userRole === 'admin' || userRole === 'staff';
    
    if (!isAdminOrStaff) {
      return <Navigate to="/unauthorized" replace />;
    }
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
