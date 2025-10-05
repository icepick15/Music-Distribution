// src/pages/StaffDashboard.jsx
import React from "react";
import { Routes } from "react-router-dom";
import AdminSidebar from "../admin/components/AdminSidebar";
import adminRoutes from "../admin/routes/AdminRoutes";

export default function StaffDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="w-64 hidden lg:block fixed inset-y-0 left-0 z-50">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar - Hidden by default, toggle with button */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900">Staff Portal</span>
          <div className="w-6" />
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Header indicating Staff Portal */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h1 className="text-2xl font-bold text-blue-900">Staff Portal</h1>
                <p className="text-blue-700 text-sm mt-1">
                  You have staff access with limited permissions
                </p>
              </div>
              
              {/* Reuse adminRoutes - permissions are handled in individual components */}
              <Routes>
                {adminRoutes}
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
