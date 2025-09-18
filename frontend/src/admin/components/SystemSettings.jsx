import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Database,
  Mail,
  Cloud,
  Shield,
  Palette,
  Globe,
  Bell,
  CreditCard,
  Users,
  Music,
  Key,
  Server,
  Monitor
} from "lucide-react";

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Fallback mock data
      setSettings({
        general: {
          platform_name: "Music Distribution Platform",
          platform_description: "The ultimate platform for independent artists",
          admin_email: "admin@musicdist.com",
          support_email: "support@musicdist.com",
          timezone: "Africa/Lagos",
          language: "en",
          maintenance_mode: false,
          registration_enabled: true
        },
        email: {
          smtp_host: "smtp.gmail.com",
          smtp_port: 587,
          smtp_username: "noreply@musicdist.com",
          smtp_password: "********",
          smtp_use_tls: true,
          email_backend: "smtp",
          from_email: "Music Distribution <noreply@musicdist.com>",
          admin_notifications: true
        },
        storage: {
          storage_backend: "s3",
          s3_bucket_name: "music-dist-bucket",
          s3_region: "us-east-1",
          s3_access_key: "AKIA...",
          s3_secret_key: "********",
          max_file_size: 50, // MB
          allowed_audio_formats: ["mp3", "wav", "flac", "m4a"],
          allowed_image_formats: ["jpg", "jpeg", "png", "webp"]
        },
        payments: {
          paystack_public_key: "pk_test_...",
          paystack_secret_key: "********",
          flutterwave_public_key: "FLWPUBK_TEST-...",
          flutterwave_secret_key: "********",
          commission_rate: 15, // percentage
          minimum_payout: 5000, // in kobo
          payout_schedule: "monthly"
        },
        security: {
          require_email_verification: true,
          password_min_length: 8,
          session_timeout: 30, // minutes
          max_login_attempts: 5,
          lockout_duration: 15, // minutes
          two_factor_auth: false,
          api_rate_limit: 1000 // requests per hour
        },
        content: {
          auto_approve_songs: false,
          max_songs_per_artist: 100,
          require_artist_verification: true,
          content_moderation: true,
          duplicate_detection: true,
          quality_check_enabled: true,
          minimum_song_duration: 30, // seconds
          maximum_song_duration: 600 // seconds
        },
        notifications: {
          email_notifications: true,
          push_notifications: false,
          sms_notifications: false,
          notification_retention: 90, // days
          batch_size: 100,
          daily_digest: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      setUnsavedChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-email/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Email test failed');
      
      alert('Test email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Error testing email:', error);
      alert('Failed to send test email. Please check your settings.');
    }
  };

  const renderInputField = (category, key, label, type = 'text', options = null) => {
    const value = settings[category]?.[key] || '';
    
    if (type === 'select') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <select
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleSettingChange(category, key, e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => handleSettingChange(category, key, type === 'number' ? parseInt(e.target.value) : e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={type === 'password' ? '********' : ''}
        />
      </div>
    );
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'storage', name: 'Storage', icon: Cloud },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'content', name: 'Content', icon: Music },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={!unsavedChanges || saving}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              unsavedChanges && !saving
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">Unsaved Changes</p>
              <p className="text-yellow-700 text-sm">You have unsaved changes. Don't forget to save them!</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('general', 'platform_name', 'Platform Name')}
                {renderInputField('general', 'admin_email', 'Admin Email', 'email')}
                {renderInputField('general', 'support_email', 'Support Email', 'email')}
                {renderInputField('general', 'timezone', 'Timezone', 'select', [
                  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
                  { value: 'UTC', label: 'UTC' },
                  { value: 'America/New_York', label: 'America/New_York (EST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' }
                ])}
                {renderInputField('general', 'language', 'Default Language', 'select', [
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                  { value: 'es', label: 'Spanish' }
                ])}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Platform Status</h4>
                <div className="space-y-4">
                  {renderInputField('general', 'maintenance_mode', 'Maintenance Mode', 'checkbox')}
                  {renderInputField('general', 'registration_enabled', 'Allow New Registrations', 'checkbox')}
                </div>
              </div>

              <div className="border-t pt-6">
                {renderInputField('general', 'platform_description', 'Platform Description', 'textarea')}
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
                </div>
                <button
                  onClick={testEmailSettings}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Test Email</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('email', 'smtp_host', 'SMTP Host')}
                {renderInputField('email', 'smtp_port', 'SMTP Port', 'number')}
                {renderInputField('email', 'smtp_username', 'SMTP Username')}
                {renderInputField('email', 'smtp_password', 'SMTP Password', 'password')}
                {renderInputField('email', 'from_email', 'From Email')}
                {renderInputField('email', 'email_backend', 'Email Backend', 'select', [
                  { value: 'smtp', label: 'SMTP' },
                  { value: 'console', label: 'Console (Development)' },
                  { value: 'ses', label: 'Amazon SES' }
                ])}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Email Options</h4>
                <div className="space-y-4">
                  {renderInputField('email', 'smtp_use_tls', 'Use TLS', 'checkbox')}
                  {renderInputField('email', 'admin_notifications', 'Admin Email Notifications', 'checkbox')}
                </div>
              </div>
            </div>
          )}

          {/* Storage Settings */}
          {activeTab === 'storage' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Cloud className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Storage Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('storage', 'storage_backend', 'Storage Backend', 'select', [
                  { value: 's3', label: 'Amazon S3' },
                  { value: 'local', label: 'Local Storage' },
                  { value: 'cloudinary', label: 'Cloudinary' }
                ])}
                {renderInputField('storage', 's3_bucket_name', 'S3 Bucket Name')}
                {renderInputField('storage', 's3_region', 'S3 Region')}
                {renderInputField('storage', 's3_access_key', 'S3 Access Key')}
                {renderInputField('storage', 's3_secret_key', 'S3 Secret Key', 'password')}
                {renderInputField('storage', 'max_file_size', 'Max File Size (MB)', 'number')}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">File Formats</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Allowed Audio Formats</label>
                    <input
                      type="text"
                      value={settings.storage?.allowed_audio_formats?.join(', ') || ''}
                      onChange={(e) => handleSettingChange('storage', 'allowed_audio_formats', e.target.value.split(', ').filter(f => f.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="mp3, wav, flac, m4a"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Allowed Image Formats</label>
                    <input
                      type="text"
                      value={settings.storage?.allowed_image_formats?.join(', ') || ''}
                      onChange={(e) => handleSettingChange('storage', 'allowed_image_formats', e.target.value.split(', ').filter(f => f.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="jpg, jpeg, png, webp"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Paystack Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField('payments', 'paystack_public_key', 'Paystack Public Key')}
                    {renderInputField('payments', 'paystack_secret_key', 'Paystack Secret Key', 'password')}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Flutterwave Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField('payments', 'flutterwave_public_key', 'Flutterwave Public Key')}
                    {renderInputField('payments', 'flutterwave_secret_key', 'Flutterwave Secret Key', 'password')}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Payout Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderInputField('payments', 'commission_rate', 'Commission Rate (%)', 'number')}
                    {renderInputField('payments', 'minimum_payout', 'Minimum Payout (₦)', 'number')}
                    {renderInputField('payments', 'payout_schedule', 'Payout Schedule', 'select', [
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'manual', label: 'Manual' }
                    ])}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('security', 'password_min_length', 'Minimum Password Length', 'number')}
                {renderInputField('security', 'session_timeout', 'Session Timeout (minutes)', 'number')}
                {renderInputField('security', 'max_login_attempts', 'Max Login Attempts', 'number')}
                {renderInputField('security', 'lockout_duration', 'Lockout Duration (minutes)', 'number')}
                {renderInputField('security', 'api_rate_limit', 'API Rate Limit (per hour)', 'number')}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Security Features</h4>
                <div className="space-y-4">
                  {renderInputField('security', 'require_email_verification', 'Require Email Verification', 'checkbox')}
                  {renderInputField('security', 'two_factor_auth', 'Enable Two-Factor Authentication', 'checkbox')}
                </div>
              </div>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === 'content' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Music className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Content Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('content', 'max_songs_per_artist', 'Max Songs per Artist', 'number')}
                {renderInputField('content', 'minimum_song_duration', 'Min Song Duration (seconds)', 'number')}
                {renderInputField('content', 'maximum_song_duration', 'Max Song Duration (seconds)', 'number')}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Content Moderation</h4>
                <div className="space-y-4">
                  {renderInputField('content', 'auto_approve_songs', 'Auto-approve Songs', 'checkbox')}
                  {renderInputField('content', 'require_artist_verification', 'Require Artist Verification', 'checkbox')}
                  {renderInputField('content', 'content_moderation', 'Enable Content Moderation', 'checkbox')}
                  {renderInputField('content', 'duplicate_detection', 'Enable Duplicate Detection', 'checkbox')}
                  {renderInputField('content', 'quality_check_enabled', 'Enable Quality Checks', 'checkbox')}
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField('notifications', 'notification_retention', 'Notification Retention (days)', 'number')}
                {renderInputField('notifications', 'batch_size', 'Batch Size', 'number')}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Notification Types</h4>
                <div className="space-y-4">
                  {renderInputField('notifications', 'email_notifications', 'Email Notifications', 'checkbox')}
                  {renderInputField('notifications', 'push_notifications', 'Push Notifications', 'checkbox')}
                  {renderInputField('notifications', 'sms_notifications', 'SMS Notifications', 'checkbox')}
                  {renderInputField('notifications', 'daily_digest', 'Daily Digest', 'checkbox')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
