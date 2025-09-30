import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

// Notification Context
const NotificationContext = createContext();

// Notification actions
const NOTIFICATION_ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  SET_CONNECTED: 'SET_CONNECTED',
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  connected: false,
  socket: null,
};

// Notification reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id
            ? { ...notif, status: 'read', read_at: new Date().toISOString() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif => ({
          ...notif,
          status: 'read',
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const deletedNotif = state.notifications.find(n => n.id === action.payload.id);
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload.id),
        unreadCount: deletedNotif && deletedNotif.status !== 'read' 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };

    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };

    case NOTIFICATION_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        connected: action.payload.connected,
        socket: action.payload.socket,
      };

    default:
      return state;
  }
}

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [token, setToken] = React.useState(localStorage.getItem('token'));

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    let ws = null;
    let reconnectInterval = null;

    const connectWebSocket = () => {
      try {
        // Use WebSocket with token authentication
        ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          dispatch({
            type: NOTIFICATION_ACTIONS.SET_CONNECTED,
            payload: { connected: true, socket: ws }
          });
          
          // Clear any reconnect interval
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
          }
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'notification':
              dispatch({
                type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
                payload: data.notification
              });
              
              // Show toast notification
              toast.success(data.notification.title, {
                duration: 5000,
                position: 'top-right',
              });
              break;

            case 'unread_count':
              dispatch({
                type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT,
                payload: data.count
              });
              break;

            case 'notification_read':
              dispatch({
                type: NOTIFICATION_ACTIONS.MARK_AS_READ,
                payload: { id: data.notification_id }
              });
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          dispatch({
            type: NOTIFICATION_ACTIONS.SET_CONNECTED,
            payload: { connected: false, socket: null }
          });
          
          // Attempt to reconnect after 3 seconds
          if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
              console.log('Attempting to reconnect...');
              connectWebSocket();
            }, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup on unmount or token change
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, [token]);

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = {
    ...state,
    dispatch,
    // Helper functions for backward compatibility and ease of use
    markAsRead: (notificationId) => {
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: { id: notificationId }
      });
    },
    markAllAsRead: () => {
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ
      });
    },
    deleteNotification: (notificationId) => {
      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
        payload: { id: notificationId }
      });
    },
    addNotification: (notification) => {
      dispatch({
        type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
        payload: notification
      });
    },
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}

// Export actions for convenience
export { NOTIFICATION_ACTIONS };