import React from "react";
import { LayoutDashboard, Users, Music, BadgeCheck, BarChart2, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, to: "/admin" },
  { label: "Users", icon: <Users className="w-5 h-5" />, to: "/admin/users" },
  { label: "Songs", icon: <Music className="w-5 h-5" />, to: "/admin/songs" },
  { label: "Verification", icon: <BadgeCheck className="w-5 h-5" />, to: "/admin/verify" },
  { label: "Insights", icon: <BarChart2 className="w-5 h-5" />, to: "/admin/insights" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full sm:w-64 bg-white border-r min-h-screen p-5 fixed sm:static">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-black">Admin Panel</h1>
      </div>

      <nav className="space-y-4">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10">
        <button className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
