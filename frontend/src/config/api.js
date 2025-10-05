/**
 * API Configuration Constants
 * Centralized API endpoint configuration for the admin panel
 */

// Base API URL - change this to update all admin API calls
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Admin API endpoints (changed from /api/admin to /api/cp for security)
export const ADMIN_API_BASE = '/api/cp';

// Admin API Endpoints
export const ADMIN_ENDPOINTS = {
  // Dashboard
  dashboard: {
    stats: `${ADMIN_API_BASE}/dashboard/stats/`,
    approvePendingSongs: `${ADMIN_API_BASE}/dashboard/approve_pending_songs/`,
    userGrowth: `${ADMIN_API_BASE}/dashboard/user_growth/`,
    contentStats: `${ADMIN_API_BASE}/dashboard/content_stats/`,
    revenueAnalytics: `${ADMIN_API_BASE}/dashboard/revenue_analytics/`,
  },
  
  // User Management
  users: {
    list: `${ADMIN_API_BASE}/users/`,
    detail: (id) => `${ADMIN_API_BASE}/users/${id}/`,
    verifyArtist: (id) => `${ADMIN_API_BASE}/users/${id}/verify_artist/`,
    upgradeSubscription: (id) => `${ADMIN_API_BASE}/users/${id}/upgrade_subscription/`,
    deactivate: (id) => `${ADMIN_API_BASE}/users/${id}/deactivate/`,
    bulkVerify: `${ADMIN_API_BASE}/users/bulk_verify/`,
  },
  
  // Content Management
  content: {
    list: `${ADMIN_API_BASE}/content/`,
    approve: (id) => `${ADMIN_API_BASE}/content/${id}/approve_song/`,
    reject: (id) => `${ADMIN_API_BASE}/content/${id}/reject_song/`,
    delete: (id) => `${ADMIN_API_BASE}/content/${id}/`,
    bulkApprove: `${ADMIN_API_BASE}/content/bulk_approve/`,
    bulkReject: `${ADMIN_API_BASE}/content/bulk_reject/`,
  },
  
  // Settings
  settings: {
    list: `${ADMIN_API_BASE}/settings/`,
    detail: (id) => `${ADMIN_API_BASE}/settings/${id}/`,
    testEmail: `${ADMIN_API_BASE}/settings/test-email/`,
  },
  
  // Audit Logs
  actions: {
    list: `${ADMIN_API_BASE}/actions/`,
    export: `${ADMIN_API_BASE}/actions/export/`,
  },
  
  // Bulk Notifications
  notifications: {
    list: `${ADMIN_API_BASE}/notifications/`,
    create: `${ADMIN_API_BASE}/notifications/`,
    send: (id) => `${ADMIN_API_BASE}/notifications/${id}/send_notification/`,
  },
  
  // Analytics
  analytics: {
    overview: `${ADMIN_API_BASE}/dashboard/stats/`,
    userGrowth: `${ADMIN_API_BASE}/dashboard/user_growth/`,
    revenue: `${ADMIN_API_BASE}/dashboard/revenue_analytics/`,
    content: `${ADMIN_API_BASE}/dashboard/content_stats/`,
  },
  
  // Financial (if separate endpoints exist)
  financial: {
    overview: `${ADMIN_API_BASE}/financial/overview/`,
    transactions: `${ADMIN_API_BASE}/financial/transactions/`,
    subscriptions: `${ADMIN_API_BASE}/financial/subscriptions/`,
  },
};

// Helper function to build full URL
export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const filtered = Object.entries(params).filter(([_, value]) => value !== null && value !== undefined && value !== '');
  return new URLSearchParams(filtered).toString();
};

// Admin route path (changed from /admin for security)
export const ADMIN_ROUTE_PATH = '/control-panel';
