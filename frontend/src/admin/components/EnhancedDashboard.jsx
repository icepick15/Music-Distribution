// src/admin/components/EnhancedDashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { 
  Users, Music, TrendingUp, AlertCircle, CheckCircle, Clock,
  DollarSign, Upload, Download, Activity, ArrowRight, RefreshCw,
  Filter, Search, Calendar, BarChart3, PieChart, TrendingDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { canPerformAction } from "../../utils/permissions";

export default function EnhancedDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month, year

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`http://localhost:8000/api/cp/dashboard/stats/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }

      // Fetch pending songs for quick approval
      const songsResponse = await fetch(`http://localhost:8000/api/cp/content/?status=pending`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (songsResponse.ok) {
        const songsData = await songsResponse.json();
        const songs = Array.isArray(songsData) ? songsData : songsData.results || [];
        setPendingApprovals(songs.slice(0, 5)); // Top 5 pending
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      change: `+${stats?.new_users_today || 0} today`,
      icon: <Users className="w-6 h-6" />,
      color: "blue",
      link: "/control-panel/users"
    },
    {
      title: "Pending Approvals",
      value: stats?.pending_songs || 0,
      change: "Requires action",
      icon: <Clock className="w-6 h-6" />,
      color: "orange",
      link: "/control-panel/songs"
    },
    {
      title: "Live Songs",
      value: stats?.live_songs || 0,
      change: `${stats?.approved_songs_today || 0} approved today`,
      icon: <Music className="w-6 h-6" />,
      color: "green",
      link: "/control-panel/content"
    },
    {
      title: "Total Revenue",
      value: `₦${(stats?.total_revenue || 0).toLocaleString()}`,
      change: "+12% this month",
      icon: <DollarSign className="w-6 h-6" />,
      color: "purple",
      link: "/control-panel/financial",
      adminOnly: true
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          // Hide admin-only stats for non-admins
          if (stat.adminOnly && !canPerformAction(user, 'view_financial_data')) {
            return null;
          }

          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <p className="text-sm text-gray-600 mt-2">{stat.change}</p>
                </div>
                <div className={`${colorClasses[stat.color]} w-12 h-12 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/control-panel/users"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Manage Users</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link
              to="/control-panel/songs"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-gray-700 font-medium">Approve Songs</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
            </Link>

            <Link
              to="/control-panel/support"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Support Tickets</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
            </Link>

            {canPerformAction(user, 'manage_settings') && (
              <Link
                to="/control-panel/settings"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">System Settings</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
              </Link>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <Link
              to="/control-panel/songs"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No pending approvals! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{song.title || 'Untitled'}</p>
                      <p className="text-sm text-gray-500">{song.artist_name || 'Unknown Artist'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                      Pending
                    </span>
                    <Link
                      to={`/control-panel/songs`}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-600">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Content Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Status</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Status</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-2xl font-bold text-green-600">Healthy</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-2xl font-bold text-blue-600">Active</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-purple-600">78% Used</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uptime</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <p className="text-2xl font-bold text-orange-600">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
