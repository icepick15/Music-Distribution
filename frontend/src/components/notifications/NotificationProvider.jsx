import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [websocket, setWebsocket] = useState(null);

  // Notification toast system
  const [toasts, setToasts] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && token) {
      initializeWebSocket();
      fetchNotifications();
      fetchUnreadCount();
    }

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [user, token]);

  const initializeWebSocket = async () => {
    try {
      if (!token) return;

      // WebSocket URL - adjust based on your setup
      const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for notifications');
        setWebsocket(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWebsocket(null);
        // Reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_notification':
        addNotification(data.notification);
        showToast(
          data.notification.title,
          data.notification.message,
          getPriorityType(data.notification.priority)
        );
        break;
      case 'unread_count':
        setUnreadCount(data.count);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const fetchNotifications = async (limit = 20) => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.results || data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/notifications/unread_count/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
        
        // Send WebSocket message if connected
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'mark_as_read',
            notification_id: notificationId
          }));
        }

        // Refresh unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/notifications/mark_all_as_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Toast notification system
  const showToast = (title, message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, title, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getPriorityType = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    toasts,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showToast,
    removeToast,
    refreshUnreadCount: fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
