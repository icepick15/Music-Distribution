import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Settings, 
  Clock, 
  Check, 
  X, 
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  Info,
  Music,
  CreditCard,
  User
} from 'lucide-react';

const NotificationsPage = () => {
  const { token, apiCall } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    console.log('NotificationsPage useEffect - token:', token ? 'Present' : 'Missing');
    if (token) {
      fetchNotifications();
    } else {
      console.error('No token available for fetching notifications');
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter, searchQuery]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching notifications with token:', token ? 'Present' : 'Missing');
      const data = await apiCall('/realtime/notifications/');
      console.log('Notifications data:', data);
      setNotifications(data.results || data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by category
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(n => !n.read_at && n.status !== 'read');
      } else {
        filtered = filtered.filter(n => n.notification_type === selectedFilter);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiCall(`/realtime/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiCall('/realtime/notifications/mark_all_as_read/', {
        method: 'POST'
      });
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read', read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'music': return <Music className="h-5 w-5 text-purple-500" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'system': return <User className="h-5 w-5 text-blue-500" />;
      case 'admin': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-400 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const filters = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => n.status !== 'read').length },
    { key: 'music', label: 'Music', count: notifications.filter(n => n.notification_type?.category === 'music').length },
    { key: 'payment', label: 'Payment', count: notifications.filter(n => n.notification_type?.category === 'payment').length },
    { key: 'system', label: 'System', count: notifications.filter(n => n.notification_type?.category === 'system').length },
  ];

  const unreadCount = notifications.filter(n => !n.read_at && n.status !== 'read').length;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm sm:text-base text-gray-600">Stay updated with your music distribution</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Mark all read ({unreadCount})</span>
                  <span className="sm:hidden">Mark all ({unreadCount})</span>
                </button>
              )}
              <button
                onClick={() => setShowPreferences(true)}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  {filter.count > 0 && (
                    <span className="ml-1 sm:ml-2 bg-current bg-opacity-20 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedFilter !== 'all'
                  ? "Try adjusting your search or filter criteria"
                  : "We'll notify you about important updates"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-6 border-l-4 transition-colors hover:bg-gray-50 ${
                    notification.status !== 'read' ? getPriorityColor(notification.priority) : 'border-l-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-start space-x-3 sm:space-x-0">
                      <div className="flex-shrink-0">
                        {getCategoryIcon(notification.notification_type?.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0 sm:ml-4">
                        {/* Mobile: Header with title and unread indicator */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            {notification.status !== 'read' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          {/* Mobile: Mark as read button */}
                          {notification.status !== 'read' && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 px-2 py-1 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
                            >
                              <span className="hidden sm:inline">Mark read</span>
                              <span className="sm:hidden">Read</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {/* Footer with tags and date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {notification.notification_type?.category || 'General'}
                            </span>
                            {notification.priority !== 'normal' && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.priority}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs sm:text-sm text-gray-500">
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
                          {notification.time_ago}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                      <span className="ml-3 text-sm text-gray-600">Music updates</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                      <span className="ml-3 text-sm text-gray-600">Payment notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                      <span className="ml-3 text-sm text-gray-600">System alerts</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
