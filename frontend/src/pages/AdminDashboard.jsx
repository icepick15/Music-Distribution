// src/pages/AdminDashboard.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";

import AdminSidebar from "../admin/components/AdminSidebar";
import DashboardCards from "../admin/components/DashboardCards";
import UserManagement from "../admin/components/UserManagement";
import SongApprovalPanel from "../admin/components/SongApprovalPanel";
import ArtistVerification from "../admin/components/ArtistVerification";
import RevenueInsights from "../admin/components/RevenueInsights";

export default function AdminDashboard() {
  const { path } = useRouteMatch(); // useRouteMatch is still useful for dynamic routing

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 hidden sm:block">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 ml-0 sm:ml-64">
        <Routes>
          <Route path={path} element={<DashboardCards />} />
          <Route path={`${path}/users`} element={<UserManagement />} />
          <Route path={`${path}/songs`} element={<SongApprovalPanel />} />
          <Route path={`${path}/verify`} element={<ArtistVerification />} />
          <Route path={`${path}/insights`} element={<RevenueInsights />} />
        </Routes>
      </div>
    </div>
  );
}
