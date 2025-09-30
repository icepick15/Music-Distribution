// API service for ticket operations
import axiosInstance from '../../../lib/axios';

const API_BASE = '/api/support/api';

export const ticketAPI = {
  // Get all tickets
  getTickets: async (params = {}) => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/`, {
      params
    });
    return response.data;
  },

  // Get user's tickets
  getMyTickets: async () => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/my_tickets/`);
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/${id}/`);
    return response.data;
  },

  // Create ticket
  createTicket: async (ticketData) => {
    const response = await axiosInstance.post(`${API_BASE}/tickets/`, ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const response = await axiosInstance.patch(`${API_BASE}/tickets/${id}/`, ticketData);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (id, statusData) => {
    const response = await axiosInstance.patch(`${API_BASE}/tickets/${id}/update_status/`, statusData);
    return response.data;
  },

  // Add response to ticket
  addResponse: async (ticketId, responseData) => {
    const response = await axiosInstance.post(`${API_BASE}/tickets/${ticketId}/add_response/`, responseData);
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/stats/`);
    return response.data;
  },

  // Assign ticket to current user (staff only)
  assignToMe: async (ticketId) => {
    const response = await axiosInstance.post(`${API_BASE}/tickets/${ticketId}/assign_to_me/`);
    return response.data;
  },

  // Get tickets assigned to current user (staff only)
  getAssignedTickets: async () => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/assigned_to_me/`);
    return response.data;
  }
};

export default ticketAPI;