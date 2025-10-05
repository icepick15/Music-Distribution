import React, { useContext } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  BadgeCheck, 
  BarChart2, 
  Settings,
  Bell,
  FileText,
  Shield,
  TrendingUp,
  LogOut 
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { canPerformAction, getRoleDisplayName, getRoleBadgeColor } from "../../utils/permissions";
import { AuthContext } from "../../context/AuthContext";

// Navigation items with permission requirements
const allNavItems = [
  { 
    label: "Dashboard", 
    icon: <LayoutDashboard className="w-5 h-5" />, 
    to: "/control-panel",
    permission: "view_dashboard"
  },
  { 
    label: "User Management", 
    icon: <Users className="w-5 h-5" />, 
    to: "/control-panel/users",
    permission: "view_users",
    description: "Staff: View only"
  },
  { 
    label: "Content Management", 
    icon: <Music className="w-5 h-5" />, 
    to: "/control-panel/content",
    permission: "view_songs",
    description: "Approve songs"
  },
  { 
    label: "Financial Management", 
    icon: <TrendingUp className="w-5 h-5" />, 
    to: "/control-panel/financial",
    permission: "view_financial_data",
    badge: "Admin Only"
  },
  { 
    label: "Support & Tickets", 
    icon: <FileText className="w-5 h-5" />, 
    to: "/control-panel/support",
    permission: "view_tickets",
    description: "Staff can respond"
  },
  { 
    label: "Notifications", 
    icon: <Bell className="w-5 h-5" />, 
    to: "/control-panel/notifications",
    permission: "send_bulk_notifications",
    badge: "Admin Only"
  },
  { 
    label: "Analytics", 
    icon: <BarChart2 className="w-5 h-5" />, 
    to: "/control-panel/analytics",
    permission: "view_analytics",
    description: "Staff: View only"
  },
  { 
    label: "System Settings", 
    icon: <Settings className="w-5 h-5" />, 
    to: "/control-panel/settings",
    permission: "manage_settings",
    badge: "Admin Only"
  },
  { 
    label: "Audit Logs", 
    icon: <Shield className="w-5 h-5" />, 
    to: "/control-panel/audit",
    permission: "view_audit_logs",
    description: "Staff: Own logs only"
  },
];

export default function AdminSidebar() {
  const { user, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get user role from publicMetadata (Clerk-like structure)
  const userRole = user?.publicMetadata?.role || 'user';
  const baseRoute = userRole === 'admin' ? '/control-panel' : '/staff-portal';
  
  console.log('🔍 AdminSidebar Debug:', { userRole, baseRoute, user }); // Debug log

  // Filter nav items based on user permissions and update routes
  const navItems = user ? allNavItems.filter(item => 
    canPerformAction(user, item.permission)
  ).map(item => ({
    ...item,
    // Replace /control-panel with appropriate base route
    to: item.to.replace('/control-panel', baseRoute)
  })) : [];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if API call fails
      navigate('/login');
    }
  };

  // Get badge color based on role
  const roleBadgeColor = user ? getRoleBadgeColor(user) : 'gray';
  const badgeColors = {
    purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  
  // Determine panel title and gradient based on user role (already declared above)
  const panelTitle = userRole === 'admin' ? 'Admin Control Panel' : 'Staff Portal';
  const panelGradient = userRole === 'admin' 
    ? 'from-purple-600 to-blue-600' 
    : 'from-blue-600 to-cyan-600';

  return (
    <aside className="w-full sm:w-64 bg-white border-r min-h-screen p-5 fixed sm:static shadow-sm">
      {/* Header with User Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-r ${panelGradient} rounded-lg flex items-center justify-center`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{panelTitle}</h1>
            <p className="text-xs text-gray-500">Music Distribution</p>
          </div>
        </div>
        
        {/* User Role Badge */}
        {user && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeColors[roleBadgeColor]}`}>
                {getRoleDisplayName(user)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item, idx) => (
          <div key={idx} className="relative">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.icon}
              <div className="flex-1">
                <span>{item.label}</span>
                {item.description && (
                  <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
                )}
              </div>
              {item.badge && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Help Text for Staff */}
      {user && userRole === 'staff' && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Staff Access:</strong> You have view and approval permissions. Contact an admin for full access.
          </p>
        </div>
      )}

      {/* Footer with Logout */}
      <div className="absolute bottom-5 left-5 right-5">
        <div className="border-t pt-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
