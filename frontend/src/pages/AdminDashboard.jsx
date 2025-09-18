// src/pages/AdminDashboard.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AdminSidebar from "../admin/components/AdminSidebar";
import AdminRoutes from "../admin/routes/AdminRoutes";

export default function AdminDashboard() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 hidden lg:block fixed inset-y-0 left-0 z-50">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar backdrop */}
      <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75">
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <AdminSidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <AdminRoutes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
