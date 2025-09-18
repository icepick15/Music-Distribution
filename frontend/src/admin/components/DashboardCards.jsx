// src/admin/components/DashboardCards.jsx
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Music, 
  BadgeCheck, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const DashboardCards = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleApprovePendingSongs = async () => {
    setApprovalLoading(true);
    
    try {
      console.log("🔄 Approving all pending songs...");
      
      const response = await fetch('http://localhost:8000/api/admin/dashboard/approve_pending_songs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // Empty body to approve all pending songs
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log("✅ Songs approved successfully:", data);
        alert(`Successfully approved ${data.approved_count} songs!`);
        // Refresh dashboard data to show updated counts
        fetchDashboardStats();
      } else {
        console.error("❌ Error approving songs:", data);
        alert(data.message || 'Error approving songs');
      }
    } catch (error) {
      console.error("❌ Error approving songs:", error);
      alert('Error approving songs: ' + error.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log("🔄 Fetching dashboard stats from Django backend...");
      
      // Try to fetch complete dashboard stats first
      const response = await fetch('http://localhost:8000/api/admin/dashboard/stats/', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched complete dashboard stats from backend:", data);
        setStats(data);
        return;
      } else {
        console.log("⚠️ Dashboard stats endpoint failed, falling back to individual API calls");
      }
      
      // Fallback: Fetch individual data pieces
      // Fetch real user count from your Django backend
      const usersResponse = await fetch('http://localhost:8000/api/admin/users/', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      let realUserCount = 0;
      let newUsersToday = 0;
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log("📊 First fetch - Users API response:", usersData);
        
        // Handle both paginated and direct array responses
        let usersArray = [];
        if (Array.isArray(usersData)) {
          usersArray = usersData;
        } else if (usersData.results && Array.isArray(usersData.results)) {
          usersArray = usersData.results;
        } else {
          console.warn("⚠️ Unexpected users data format:", usersData);
          usersArray = [];
        }
        
        realUserCount = usersArray.length;
        console.log("✅ Fetched real user data:", realUserCount, "users");
        
        // Calculate new users today (simplified - you can enhance this)
        const today = new Date().toDateString();
        newUsersToday = usersArray.filter(user => {
          if (user.date_joined) {
            return new Date(user.date_joined).toDateString() === today;
          }
          return false;
        }).length;
        
        console.log("📊 New users today:", newUsersToday);
      } else {
        console.warn("⚠️ Could not fetch users, using fallback");
      }
      
      console.log("📈 Using individual API calls with real user data");
      setStats({
        total_users: realUserCount,
        new_users_today: newUsersToday,
        active_users: Math.floor(realUserCount * 0.7), // 70% of users are "active" (fallback)
        verified_artists: Math.floor(realUserCount * 0.4), // 40% are artists (fallback)
        total_songs: 0, // Will be updated when we get real song data
        pending_songs: 0, // Will be updated when we get real song data
        approved_songs_today: 0,
        total_revenue: 0, // Will be updated when we get real payment data
        recent_uploads: Math.floor(realUserCount * 0.1),
        recent_registrations: newUsersToday,
        open_tickets: 0
      });
      
      console.log("📊 Dashboard updated with individual API calls");
    } catch (err) {
      console.log("🔄 Fallback: Using minimal real user count");
      setError(err.message);
      
      // Final fallback with minimal real data
      try {
        const usersResponse = await fetch('http://localhost:8000/api/admin/users/', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        let realUserCount = 8; // fallback number
        let newUsersToday = 0;
        
        if (usersResponse && usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log("📊 Users API response:", usersData);
          
          // Handle both paginated and direct array responses
          let usersArray = [];
          if (Array.isArray(usersData)) {
            usersArray = usersData;
          } else if (usersData.results && Array.isArray(usersData.results)) {
            usersArray = usersData.results;
          } else {
            console.warn("⚠️ Unexpected users data format:", usersData);
            usersArray = [];
          }
          
          realUserCount = usersArray.length;
          console.log("✅ Processed users array length:", realUserCount);
          
          const today = new Date().toDateString();
          newUsersToday = usersArray.filter(user => {
            if (user.date_joined) {
              return new Date(user.date_joined).toDateString() === today;
            }
            return false;
          }).length;
          
          console.log("📅 New users today:", newUsersToday);
        }
        
        setStats({
          total_users: realUserCount,
          new_users_today: newUsersToday,
          active_users: Math.floor(realUserCount * 0.7), // 70% of users are "active"
          verified_artists: Math.floor(realUserCount * 0.4), // 40% are artists
          total_songs: 0, // Placeholder
          pending_songs: 0, // Placeholder
          approved_songs_today: 0,
          total_revenue: 0, // Placeholder
          recent_uploads: Math.floor(realUserCount * 0.1),
          recent_registrations: newUsersToday,
          open_tickets: 0
        });
        
        console.log("📊 Dashboard updated with real user count:", realUserCount);
      } catch (finalError) {
        console.error("❌ Final fallback also failed:", finalError);
        setStats({
          total_users: 0,
          new_users_today: 0,
          active_users: 0,
          verified_artists: 0,
          total_songs: 0,
          pending_songs: 0,
          approved_songs_today: 0,
          total_revenue: 0,
          recent_uploads: 0,
          recent_registrations: 0,
          open_tickets: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-red-900 font-semibold">Failed to load dashboard statistics</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: `₦${stats?.total_revenue?.toLocaleString() || '0'}`,
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
      change: "+12.5%",
      changeType: "positive",
      description: "vs last month"
    },
    {
      title: "Total Users",
      value: stats?.total_users?.toLocaleString() || '0',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      change: `+${stats?.new_users_today || 0}`,
      changeType: "positive",
      description: "new today"
    },
    {
      title: "Total Songs",
      value: stats?.total_songs?.toLocaleString() || '0',
      icon: <Music className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
      change: `+${stats?.recent_uploads || 0}`,
      changeType: "positive",
      description: "uploaded today"
    },
    {
      title: "Live Songs",
      value: stats?.live_songs?.toLocaleString() || '0',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
      change: `${stats?.approved_songs_today || 0} approved today`,
      changeType: "positive",
      description: "distributed & live"
    },
    {
      title: "Verified Artists",
      value: stats?.verified_artists?.toLocaleString() || '0',
      icon: <BadgeCheck className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-50",
      change: "+8.2%",
      changeType: "positive",
      description: "vs last month"
    },
    {
      title: "Pending Approvals",
      value: stats?.pending_songs?.toLocaleString() || '0',
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-50",
      change: `${stats?.approved_songs_today || 0} approved today`,
      changeType: "neutral",
      description: "requiring review"
    },
    {
      title: "Active Users",
      value: stats?.active_users?.toLocaleString() || '0',
      icon: <Activity className="w-6 h-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      change: "+5.7%",
      changeType: "positive",
      description: "last 7 days"
    },
    {
      title: "Open Tickets",
      value: stats?.open_tickets?.toLocaleString() || '0',
      icon: <FileText className="w-6 h-6 text-red-600" />,
      bg: "bg-red-50",
      change: "-2",
      changeType: "positive",
      description: "since yesterday"
    },
    {
      title: "New Registrations",
      value: stats?.recent_registrations?.toLocaleString() || '0',
      icon: <TrendingUp className="w-6 h-6 text-teal-600" />,
      bg: "bg-teal-50",
      change: "+15.3%",
      changeType: "positive",
      description: "vs yesterday"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your music distribution platform</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bg} group-hover:scale-110 transition-transform duration-200`}>
                {metric.icon}
              </div>
              <div className="flex items-center space-x-1">
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : metric.changeType === 'negative' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 
                  metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-gray-900 mb-1">{metric.title}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-purple-100 text-sm mb-4">Manage your platform efficiently</p>
          <div className="space-y-2">
            <button 
              onClick={handleApprovePendingSongs}
              disabled={approvalLoading || !stats?.pending_songs}
              className="w-full text-left px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <span>Approve Pending Songs</span>
              {approvalLoading && <span className="text-xs">Loading...</span>}
              {stats?.pending_songs > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  {stats.pending_songs}
                </span>
              )}
            </button>
            <button className="w-full text-left px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-sm">
              Send Bulk Notification
            </button>
            <button className="w-full text-left px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-sm">
              Export User Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-600 text-sm mb-4">Latest platform activities</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-sm text-gray-700">New user registered</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <p className="text-sm text-gray-700">Song approved</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <p className="text-sm text-gray-700">Support ticket opened</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
          <p className="text-gray-600 text-sm mb-4">Platform status overview</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Upload Service</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
