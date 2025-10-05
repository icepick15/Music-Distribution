// src/admin/routes/AdminRoutes.jsx
import React from "react";
import { Route } from "react-router-dom";
import EnhancedDashboard from "../components/EnhancedDashboard";
import ContentManagement from "../components/ContentManagement";
import UserManagementAdvanced from "../components/UserManagementAdvanced";
import UserManagement from "../components/UserManagement";
import ArtistVerification from "../components/ArtistVerification";
import SongApprovalPanel from "../components/SongApprovalPanel";
import PlatformAnalytics from "../components/PlatformAnalytics";
import RevenueInsights from "../components/RevenueInsights";
import FinancialManagement from "../components/FinancialManagement";
import SystemSettings from "../components/SystemSettings";
import AuditLogs from "../components/AuditLogs";
import SupportCommunications from "../components/SupportCommunications";

// Export individual route elements for use in parent Routes component
const adminRoutes = (
  <React.Fragment>
    {/* Enhanced Dashboard */}
    <Route index element={<EnhancedDashboard />} />
    
    {/* Content Management with Workflow */}
    <Route path="content" element={<ContentManagement />} />
    <Route path="songs" element={<SongApprovalPanel />} />
    
    {/* User Management */}
    <Route path="users" element={<UserManagementAdvanced />} />
    <Route path="user-management" element={<UserManagement />} />
    <Route path="artists" element={<ArtistVerification />} />
    
    {/* Analytics & Financial */}
    <Route path="analytics" element={<PlatformAnalytics />} />
    <Route path="revenue" element={<RevenueInsights />} />
    <Route path="financial" element={<FinancialManagement />} />
    
    {/* System & Support */}
    <Route path="settings" element={<SystemSettings />} />
    <Route path="audit" element={<AuditLogs />} />
    <Route path="support" element={<SupportCommunications />} />
  </React.Fragment>
);

export default adminRoutes;
