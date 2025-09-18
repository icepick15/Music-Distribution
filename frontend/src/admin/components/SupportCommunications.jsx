import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Bell,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MessageCircle,
  User,
  Calendar,
  Tag
} from "lucide-react";

const SupportCommunications = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [showBulkNotification, setShowBulkNotification] = useState(false);
  const [bulkMessage, setBulkMessage] = useState({
    title: '',
    message: '',
    recipient_type: 'all',
    send_email: true
  });

  useEffect(() => {
    fetchTickets();
    fetchNotifications();
  }, [searchTerm, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/tickets/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');
      
      const data = await response.json();
      setTickets(data.results || data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Fallback mock data
      setTickets([
        {
          id: 1,
          title: "Song Upload Issue",
          user: { username: "john_artist", first_name: "John", last_name: "Doe" },
          category: "technical",
          priority: "high",
          status: "open",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T14:20:00Z",
          description: "I'm unable to upload my song. The upload keeps failing at 80%.",
          response_count: 2
        },
        {
          id: 2,
          title: "Payment Not Received",
          user: { username: "nova_star", first_name: "Nova", last_name: "Star" },
          category: "billing",
          priority: "urgent",
          status: "in_progress",
          created_at: "2024-01-14T08:15:00Z",
          updated_at: "2024-01-15T09:30:00Z",
          description: "I haven't received my payment for last month's streams.",
          response_count: 5
        },
        {
          id: 3,
          title: "Account Verification Help",
          user: { username: "new_artist", first_name: "Sarah", last_name: "Music" },
          category: "account",
          priority: "medium",
          status: "resolved",
          created_at: "2024-01-13T16:45:00Z",
          updated_at: "2024-01-14T11:20:00Z",
          description: "Need help with artist verification process.",
          response_count: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.results || data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback mock data
      setNotifications([
        {
          id: 1,
          title: "Platform Maintenance Scheduled",
          message: "Scheduled maintenance on January 20th from 2:00 AM to 4:00 AM WAT.",
          recipient_count: 3400,
          created_at: "2024-01-15T10:00:00Z",
          status: "sent",
          type: "announcement"
        },
        {
          id: 2,
          title: "New Feature: Enhanced Analytics",
          message: "We've launched enhanced analytics for artists. Check your dashboard!",
          recipient_count: 850,
          created_at: "2024-01-14T14:30:00Z",
          status: "sent",
          type: "feature"
        },
        {
          id: 3,
          title: "Payment Processing Update",
          message: "Important update about payment processing schedules.",
          recipient_count: 1200,
          created_at: "2024-01-13T09:15:00Z",
          status: "draft",
          type: "update"
        }
      ]);
    }
  };

  const handleTicketStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/update-status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update ticket status');
      
      // Update local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
      
      alert('Ticket status updated successfully');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status');
    }
  };

  const sendBulkNotification = async () => {
    if (!bulkMessage.title.trim() || !bulkMessage.message.trim()) {
      alert('Please provide both title and message');
      return;
    }

    try {
      const response = await fetch('/api/admin/bulk-notifications/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkMessage),
      });

      if (!response.ok) throw new Error('Failed to send notification');
      
      alert('Bulk notification sent successfully!');
      setShowBulkNotification(false);
      setBulkMessage({ title: '', message: '', recipient_type: 'all', send_email: true });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Open</span>,
      in_progress: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">In Progress</span>,
      resolved: <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Resolved</span>,
      closed: <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Closed</span>
    };
    return badges[status] || badges.open;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Low</span>,
      medium: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Medium</span>,
      high: <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">High</span>,
      urgent: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Urgent</span></span>
    };
    return badges[priority] || badges.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technical: <MessageSquare className="w-4 h-4" />,
      billing: <CheckCircle className="w-4 h-4" />,
      account: <User className="w-4 h-4" />,
      general: <MessageCircle className="w-4 h-4" />
    };
    return icons[category] || <MessageSquare className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support & Communications</h1>
          <p className="text-gray-600 mt-1">Manage support tickets and platform communications</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowBulkNotification(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Notification</span>
          </button>
          <button
            onClick={() => {
              fetchTickets();
              fetchNotifications();
            }}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tickets', name: 'Support Tickets', icon: MessageSquare },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'communications', name: 'Communications', icon: Mail }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets by title or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tickets...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {ticket.response_count} responses
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {ticket.user.first_name?.[0] || ticket.user.username[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {ticket.user.first_name && ticket.user.last_name 
                                  ? `${ticket.user.first_name} ${ticket.user.last_name}` 
                                  : ticket.user.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(ticket.category)}
                            <span className="capitalize text-gray-900">{ticket.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getPriorityBadge(ticket.priority)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Ticket"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleTicketStatusUpdate(ticket.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{notification.recipient_count} recipients</span>
                        <span>{formatDate(notification.created_at)}</span>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Send Bulk Notification</h3>
                <button
                  onClick={() => setShowBulkNotification(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={bulkMessage.title}
                    onChange={(e) => setBulkMessage(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={bulkMessage.message}
                    onChange={(e) => setBulkMessage(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                  <select
                    value={bulkMessage.recipient_type}
                    onChange={(e) => setBulkMessage(prev => ({ ...prev, recipient_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="artists">Artists Only</option>
                    <option value="subscribers">Paid Subscribers</option>
                    <option value="admins">Admins & Staff</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bulkMessage.send_email}
                    onChange={(e) => setBulkMessage(prev => ({ ...prev, send_email: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label className="text-sm text-gray-700">Also send via email</label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkNotification(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkNotification}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCommunications;
