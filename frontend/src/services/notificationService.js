import axiosInstance from '../lib/axios';

const NOTIFICATION_API_BASE = '/api/realtime';

export const notificationAPI = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get(`${NOTIFICATION_API_BASE}/notifications/`, {
      params
    });
    return response.data;
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    const response = await axiosInstance.get(`${NOTIFICATION_API_BASE}/notifications/unread/`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axiosInstance.get(`${NOTIFICATION_API_BASE}/notifications/unread_count/`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await axiosInstance.post(`${NOTIFICATION_API_BASE}/notifications/${notificationId}/mark_as_read/`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.post(`${NOTIFICATION_API_BASE}/notifications/mark_all_as_read/`);
    return response.data;
  },

  // Get user notification preferences
  getPreferences: async () => {
    const response = await axiosInstance.get(`${NOTIFICATION_API_BASE}/preferences/`);
    return response.data;
  },

  // Update user notification preferences
  updatePreferences: async (preferenceData) => {
    const response = await axiosInstance.post(`${NOTIFICATION_API_BASE}/preferences/`, preferenceData);
    return response.data;
  },

  // Admin: Send notification to specific user
  sendToUser: async (userId, notificationData) => {
    const response = await axiosInstance.post(`${NOTIFICATION_API_BASE}/admin/send-to-user/`, {
      user_id: userId,
      ...notificationData
    });
    return response.data;
  },

  // Admin: Broadcast notification to all users
  broadcast: async (notificationData) => {
    const response = await axiosInstance.post(`${NOTIFICATION_API_BASE}/admin/broadcast/`, notificationData);
    return response.data;
  },

  // Admin: Get notification statistics
  getStats: async () => {
    const response = await axiosInstance.get(`${NOTIFICATION_API_BASE}/admin/stats/`);
    return response.data;
  },
};

export default notificationAPI;