import React, { useState, useEffect } from "react";
import { 
  Clock, 
  User, 
  Activity, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Settings,
  Shield,
  Database,
  FileText,
  Users,
  Music
} from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action_type: '',
    user_type: '',
    date_range: '7',
    severity: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchTerm, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/audit-logs/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      
      const data = await response.json();
      setLogs(data.results);
      setTotalPages(data.total_pages);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Fallback mock data
      setLogs([
        {
          id: 1,
          user: { username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
          action: 'user_verification',
          description: 'Verified artist account for Nova Star',
          resource_type: 'User',
          resource_id: 15,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T10:30:00Z',
          severity: 'info',
          metadata: {
            previous_status: 'unverified',
            new_status: 'verified',
            artist_name: 'Nova Star'
          }
        },
        {
          id: 2,
          user: { username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
          action: 'song_rejection',
          description: 'Rejected song "Bad Quality Track" due to audio quality issues',
          resource_type: 'Song',
          resource_id: 23,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T09:45:00Z',
          severity: 'warning',
          metadata: {
            song_title: 'Bad Quality Track',
            artist: 'Unknown Artist',
            rejection_reason: 'Audio quality below platform standards'
          }
        },
        {
          id: 3,
          user: { username: 'system', first_name: 'System', last_name: '', role: 'system' },
          action: 'bulk_notification',
          description: 'Sent bulk notification to 1,250 users about platform update',
          resource_type: 'Notification',
          resource_id: 45,
          ip_address: '127.0.0.1',
          user_agent: 'System/1.0',
          timestamp: '2024-01-15T08:00:00Z',
          severity: 'info',
          metadata: {
            notification_type: 'platform_update',
            recipient_count: 1250,
            template: 'platform_announcement'
          }
        },
        {
          id: 4,
          user: { username: 'staff_user', first_name: 'Staff', last_name: 'Member', role: 'staff' },
          action: 'user_suspension',
          description: 'Suspended user account for violating terms of service',
          resource_type: 'User',
          resource_id: 89,
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: '2024-01-14T16:20:00Z',
          severity: 'critical',
          metadata: {
            suspended_user: 'violator123',
            reason: 'Terms of service violation',
            duration: 'permanent'
          }
        },
        {
          id: 5,
          user: { username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
          action: 'settings_update',
          description: 'Updated platform commission rate from 10% to 15%',
          resource_type: 'Settings',
          resource_id: 1,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-14T14:15:00Z',
          severity: 'warning',
          metadata: {
            setting_key: 'commission_rate',
            old_value: '10',
            new_value: '15'
          }
        }
      ]);
      setTotalCount(5);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      user_verification: <CheckCircle className="w-4 h-4" />,
      user_suspension: <XCircle className="w-4 h-4" />,
      song_approval: <Music className="w-4 h-4" />,
      song_rejection: <XCircle className="w-4 h-4" />,
      bulk_notification: <FileText className="w-4 h-4" />,
      settings_update: <Settings className="w-4 h-4" />,
      login: <User className="w-4 h-4" />,
      logout: <User className="w-4 h-4" />,
      create: <Plus className="w-4 h-4" />,
      update: <Edit className="w-4 h-4" />,
      delete: <Trash2 className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      database: <Database className="w-4 h-4" />
    };
    return icons[action] || <Activity className="w-4 h-4" />;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      info: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Info</span>,
      warning: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Warning</span>,
      error: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Error</span>,
      critical: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Critical</span></span>
    };
    return badges[severity] || badges.info;
  };

  const getUserRoleBadge = (role) => {
    const badges = {
      admin: <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Admin</span>,
      staff: <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Staff</span>,
      user: <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">User</span>,
      artist: <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Artist</span>,
      system: <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">System</span>
    };
    return badges[role] || badges.user;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
        export: 'csv'
      });

      const response = await fetch(`/api/admin/audit-logs/export/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export logs');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs. Please try again.');
    }
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system activities and user actions</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
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
              <p className="text-gray-600 text-sm">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.severity === 'critical').length}
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
              <p className="text-gray-600 text-sm">Admin Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.user.role === 'admin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">System Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.user.role === 'system').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs by action, user, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.action_type}
              onChange={(e) => setFilters(prev => ({ ...prev, action_type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="user_verification">User Verification</option>
              <option value="user_suspension">User Suspension</option>
              <option value="song_approval">Song Approval</option>
              <option value="song_rejection">Song Rejection</option>
              <option value="bulk_notification">Bulk Notification</option>
              <option value="settings_update">Settings Update</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>

            <select
              value={filters.user_type}
              onChange={(e) => setFilters(prev => ({ ...prev, user_type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
              <option value="artist">Artist</option>
              <option value="system">System</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={filters.date_range}
              onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {log.user.first_name?.[0] || log.user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.user.first_name && log.user.last_name 
                              ? `${log.user.first_name} ${log.user.last_name}` 
                              : log.user.username}
                          </p>
                          {getUserRoleBadge(log.user.role)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium text-gray-900 capitalize">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">{log.description}</p>
                      <p className="text-xs text-gray-500">
                        {log.resource_type} #{log.resource_id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewLogDetails(log)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} logs
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {selectedLog.user.first_name?.[0] || selectedLog.user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedLog.user.first_name && selectedLog.user.last_name 
                          ? `${selectedLog.user.first_name} ${selectedLog.user.last_name}` 
                          : selectedLog.user.username}
                      </p>
                      {getUserRoleBadge(selectedLog.user.role)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getActionIcon(selectedLog.action)}
                    <span className="font-medium text-gray-900 capitalize">
                      {selectedLog.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Type</label>
                    <p className="text-sm text-gray-900">{selectedLog.resource_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                    <p className="text-sm text-gray-900">#{selectedLog.resource_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ip_address}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="text-sm text-gray-900 break-all">{selectedLog.user_agent}</p>
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
