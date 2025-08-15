// src/admin/routes/AdminRoutes.jsx
import React from "react";
import { Route, Routes } from "react-router-dom"; // Change Switch to Routes

import UserManagement from "../components/UserManagement";
import SongApprovalPanel from "../components/SongApprovalPanel";
import ArtistVerification from "../components/ArtistVerification";
import RevenueInsights from "../components/RevenueInsights";
import AdminDashboard from "../../pages/AdminDashboard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/users" element={<UserManagement />} />
      <Route path="/songs" element={<SongApprovalPanel />} />
      <Route path="/verify" element={<ArtistVerification />} />
      <Route path="/insights" element={<RevenueInsights />} />
      <Route path="/" element={<AdminDashboard />} /> {/* Placeholder for now */}
    </Routes>
  );
}
