// src/admin/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import UserManagementAdvanced from "../components/UserManagementAdvanced";
import UserManagement from "../components/UserManagement";
import ArtistVerification from "../components/ArtistVerification";
import SongApprovalPanel from "../components/SongApprovalPanel";
import DashboardCards from "../components/DashboardCards";
import PlatformAnalytics from "../components/PlatformAnalytics";
import RevenueInsights from "../components/RevenueInsights";
import FinancialManagement from "../components/FinancialManagement";
import SystemSettings from "../components/SystemSettings";
import AuditLogs from "../components/AuditLogs";
import SupportCommunications from "../components/SupportCommunications";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardCards />} />
      <Route path="/users" element={<UserManagementAdvanced />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/artists" element={<ArtistVerification />} />
      <Route path="/songs" element={<SongApprovalPanel />} />
      <Route path="/analytics" element={<PlatformAnalytics />} />
      <Route path="/revenue" element={<RevenueInsights />} />
      <Route path="/financial" element={<FinancialManagement />} />
      <Route path="/settings" element={<SystemSettings />} />
      <Route path="/audit" element={<AuditLogs />} />
      <Route path="/support" element={<SupportCommunications />} />
    </Routes>
  );
}
