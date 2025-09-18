import React from "react";
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
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, to: "/admin" },
  { label: "User Management", icon: <Users className="w-5 h-5" />, to: "/admin/users" },
  { label: "Content Management", icon: <Music className="w-5 h-5" />, to: "/admin/content" },
  { label: "Financial Management", icon: <TrendingUp className="w-5 h-5" />, to: "/admin/financial" },
  { label: "Support & Tickets", icon: <FileText className="w-5 h-5" />, to: "/admin/support" },
  { label: "Notifications", icon: <Bell className="w-5 h-5" />, to: "/admin/notifications" },
  { label: "Analytics", icon: <BarChart2 className="w-5 h-5" />, to: "/admin/analytics" },
  { label: "System Settings", icon: <Settings className="w-5 h-5" />, to: "/admin/settings" },
  { label: "Audit Logs", icon: <Shield className="w-5 h-5" />, to: "/admin/audit" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full sm:w-64 bg-white border-r min-h-screen p-5 fixed sm:static shadow-sm">
      <div className="mb-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Music Distribution</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
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
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-5 left-5 right-5">
        <div className="border-t pt-4">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 w-full transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
