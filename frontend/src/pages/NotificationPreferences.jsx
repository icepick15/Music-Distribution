import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  Settings, 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor,
  Save,
  Check,
  Music,
  CreditCard,
  User,
  Shield,
  AlertCircle
} from 'lucide-react';

const NotificationPreferences = () => {
  const { getToken } = useAuth();
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8100';

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/notifications/preferences/defaults/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (id, field, value) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, [field]: value } : pref
      )
    );
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/notifications/preferences/bulk_update/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: preferences.map(pref => ({
            id: pref.id,
            email_enabled: pref.email_enabled,
            push_enabled: pref.push_enabled,
            in_app_enabled: pref.in_app_enabled,
            frequency: pref.frequency,
          }))
        }),
      });

      if (response.ok) {
        setSavedMessage('Preferences saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'music': return <Music className="h-5 w-5 text-purple-500" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'system': return <User className="h-5 w-5 text-blue-500" />;
      case 'admin': return <Shield className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'music': return 'bg-purple-50 border-purple-200';
      case 'payment': return 'bg-green-50 border-green-200';
      case 'system': return 'bg-blue-50 border-blue-200';
      case 'admin': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const groupedPreferences = preferences.reduce((groups, pref) => {
    const category = pref.notification_type.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(pref);
    return groups;
  }, {});

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Digest' },
    { value: 'never', label: 'Never' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-gray-600">Customize how and when you receive notifications</p>
              </div>
            </div>
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          
          {savedMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-700 text-sm font-medium">{savedMessage}</span>
            </div>
          )}
        </div>

        {/* Delivery Methods Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-blue-900">Email</h3>
                <p className="text-sm text-blue-700">Delivered to your inbox</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Smartphone className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium text-green-900">Push</h3>
                <p className="text-sm text-green-700">Mobile & browser alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Monitor className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-medium text-purple-900">In-App</h3>
                <p className="text-sm text-purple-700">Dashboard notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences by Category */}
        <div className="space-y-6">
          {Object.entries(groupedPreferences).map(([category, categoryPrefs]) => (
            <div key={category} className={`bg-white rounded-2xl shadow-sm border p-6 ${getCategoryColor(category)}`}>
              <div className="flex items-center space-x-3 mb-6">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {category === 'music' && 'Music & Releases'}
                  {category === 'payment' && 'Payment & Billing'}
                  {category === 'system' && 'System & Account'}
                  {category === 'admin' && 'Admin Alerts'}
                  {category === 'marketing' && 'Marketing'}
                  {!['music', 'payment', 'system', 'admin', 'marketing'].includes(category) && 'Other'}
                </h2>
              </div>

              <div className="space-y-4">
                {categoryPrefs.map((pref) => (
                  <div key={pref.id} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {pref.notification_type.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {pref.notification_type.description}
                        </p>

                        {/* Delivery Methods */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.email_enabled}
                              onChange={(e) => updatePreference(pref.id, 'email_enabled', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Email</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.push_enabled}
                              onChange={(e) => updatePreference(pref.id, 'push_enabled', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Push</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pref.in_app_enabled}
                              onChange={(e) => updatePreference(pref.id, 'in_app_enabled', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">In-App</span>
                            </div>
                          </label>
                        </div>

                        {/* Frequency */}
                        <div className="flex items-center space-x-4">
                          <label className="text-sm font-medium text-gray-700 min-w-0">
                            Frequency:
                          </label>
                          <select
                            value={pref.frequency}
                            onChange={(e) => updatePreference(pref.id, 'frequency', e.target.value)}
                            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          >
                            {frequencyOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">About Notification Frequencies</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Immediate:</strong> Notifications are sent right away</p>
                <p><strong>Hourly Digest:</strong> Bundled notifications every hour</p>
                <p><strong>Daily Digest:</strong> Summary sent once per day</p>
                <p><strong>Weekly Digest:</strong> Weekly summary of all notifications</p>
                <p><strong>Never:</strong> Disable this type of notification completely</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
