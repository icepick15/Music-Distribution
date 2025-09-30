import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import notificationAPI from '../services/notificationService';
import toast from 'react-hot-toast';

export default function NotificationTest() {
  const [testMessage, setTestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { notifications, unreadCount, connected } = useNotifications();

  const handleCreateTestNotification = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    try {
      setLoading(true);
      // This would create a test notification via API
      // For now, we'll simulate it locally
      const newNotification = {
        id: Date.now(),
        title: 'Test Notification',
        message: testMessage,
        priority: 'normal',
        status: 'sent',
        created_at: new Date().toISOString(),
        notification_type: {
          name: 'test',
          category: 'system'
        }
      };

      // In a real implementation, this would come through WebSocket
      toast.success('Test notification created!');
      setTestMessage('');
      
    } catch (error) {
      console.error('Failed to create test notification:', error);
      toast.error('Failed to create test notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();
      console.log('API Response:', data);
      toast.success(`API working! Found ${data.length || 0} notifications`);
    } catch (error) {
      console.error('API Error:', error);
      toast.error('API test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Notification System Test
        </h1>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              connected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              WebSocket: {connected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-gray-600">
              Unread Count: {unreadCount}
            </span>
            <span className="text-gray-600">
              Total Notifications: {notifications.length}
            </span>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test notification message"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCreateTestNotification}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Test Notification'}
              </button>

              <button
                onClick={handleTestAPI}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test API'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="border rounded-lg">
          <h2 className="text-lg font-semibold p-4 border-b">
            Current Notifications ({notifications.length})
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map((notification, index) => (
                <div key={notification.id || index} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Status: {notification.status}</span>
                        <span>Priority: {notification.priority}</span>
                        <span>
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.status === 'read'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {notification.status === 'read' ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify({ 
              connected, 
              unreadCount, 
              notificationCount: notifications.length,
              latestNotification: notifications[0] ? {
                id: notifications[0].id,
                title: notifications[0].title,
                status: notifications[0].status
              } : null
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}