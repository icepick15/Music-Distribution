import React, { useState, useEffect } from 'react';
import { Send, Users, User, Megaphone, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import notificationAPI from '../../services/notificationService';
import toast from 'react-hot-toast';

export default function AdminNotificationPanel() {
  const [targetType, setTargetType] = useState('all'); // 'all' or 'individual'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    notification_type: 'admin_message',
    send_email: true,
    send_push: true,
    send_in_app: true
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Load users for individual targeting
  useEffect(() => {
    if (targetType === 'individual') {
      loadUsers();
    }
  }, [targetType]);

  const loadUsers = async () => {
    try {
      // This would be an API call to get users
      // const data = await userAPI.getAllUsers();
      // setUsers(data);
      
      // For now, mock data
      setUsers([
        { id: 1, email: 'user1@example.com', first_name: 'John', last_name: 'Doe' },
        { id: 2, email: 'user2@example.com', first_name: 'Jane', last_name: 'Smith' },
        { id: 3, email: 'admin@musicdist.com', first_name: 'Admin', last_name: 'User' },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleInputChange = (field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendNotification = async () => {
    if (!notificationData.title.trim() || !notificationData.message.trim()) {
      toast.error('Please enter both title and message');
      return;
    }

    if (targetType === 'individual' && selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      
      if (targetType === 'all') {
        await notificationAPI.broadcast(notificationData);
        toast.success('Notification sent to all users successfully!');
      } else {
        // Send to each selected user
        await Promise.all(
          selectedUsers.map(userId => 
            notificationAPI.sendToUser(userId, notificationData)
          )
        );
        toast.success(`Notification sent to ${selectedUsers.length} user(s) successfully!`);
      }

      // Reset form
      setNotificationData({
        title: '',
        message: '',
        priority: 'normal',
        notification_type: 'admin_message',
        send_email: true,
        send_push: true,
        send_in_app: true
      });
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'normal':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center">
            <Megaphone className="h-6 w-6 text-white mr-3" />
            <h1 className="text-xl font-bold text-white">Send Notification</h1>
          </div>
          <p className="text-blue-100 mt-2">
            Send notifications to users in real-time
          </p>
        </div>

        <div className="p-6">
          {/* Target Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Send To
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="mr-2"
                />
                <Users className="h-4 w-4 mr-1" />
                All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetType"
                  value="individual"
                  checked={targetType === 'individual'}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="mr-2"
                />
                <User className="h-4 w-4 mr-1" />
                Individual Users
              </label>
            </div>
          </div>

          {/* User Selection for Individual */}
          {targetType === 'individual' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users
              </label>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              />
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedUsers.length} user(s) selected
                </p>
              )}
            </div>
          )}

          {/* Notification Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={notificationData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter notification title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={notificationData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={notificationData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter your notification message..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notificationData.message.length}/1000 characters
            </p>
          </div>

          {/* Delivery Channels */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Channels
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationData.send_in_app}
                  onChange={(e) => handleInputChange('send_in_app', e.target.checked)}
                  className="mr-2"
                />
                In-App Notification
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationData.send_email}
                  onChange={(e) => handleInputChange('send_email', e.target.checked)}
                  className="mr-2"
                />
                Email Notification
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationData.send_push}
                  onChange={(e) => handleInputChange('send_push', e.target.checked)}
                  className="mr-2"
                />
                Push Notification
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getPriorityIcon(notificationData.priority)}
                <h5 className="font-medium text-gray-900 ml-2">
                  {notificationData.title || 'Notification Title'}
                </h5>
              </div>
              <p className="text-gray-600 text-sm">
                {notificationData.message || 'Your notification message will appear here...'}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                Just now • Admin Message
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendNotification}
              disabled={loading || !notificationData.title.trim() || !notificationData.message.trim()}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}