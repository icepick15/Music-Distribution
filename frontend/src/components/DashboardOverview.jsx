import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { 
  MusicalNoteIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, href }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      {href && (
        <div className="mt-4">
          <Link to={href} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View details →
          </Link>
        </div>
      )}
    </div>
  );
};

const QuickAction = ({ title, description, icon: Icon, href, color = "blue", disabled = false, onClick }) => {
  const colorClasses = {
    blue: disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-blue-50 text-blue-700 border-blue-200",
    green: disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-green-50 text-green-700 border-green-200",
    purple: disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-purple-50 text-purple-700 border-purple-200",
    orange: disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-orange-50 text-orange-700 border-orange-200"
  };

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      if (onClick) onClick();
      return false;
    }
  };

  const content = (
    <div className={`rounded-xl border p-6 transition-all ${disabled ? '' : 'hover:shadow-md hover:scale-105'} ${colorClasses[color]}`}>
      <div className="flex items-center">
        <Icon className="h-8 w-8 mr-4" />
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm opacity-75">{description}</p>
          {disabled && (
            <p className="text-xs mt-1 opacity-60">Subscription required</p>
          )}
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div onClick={handleClick} className="block">
        {content}
      </div>
    );
  }

  return (
    <Link to={href} className="block">
      {content}
    </Link>
  );
};

const DashboardOverview = () => {
  const { user, apiCall, refreshTrigger } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { canUpload } = useSubscription();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching dashboard data...');
        console.log('🔄 Current user:', user);
        console.log('🔄 User authenticated:', !!user);
        
        if (!user) {
          console.log('❌ No user logged in, skipping dashboard fetch');
          setLoading(false);
          return;
        }
        
        // Fetch songs and stats in parallel
        console.log('📡 Making API calls to /songs/ and /songs/stats/');
        const [songsResponse, statsResponse] = await Promise.all([
          apiCall('/songs/'),
          apiCall('/songs/stats/')
        ]);
        
        console.log('✅ Dashboard data received:', { songs: songsResponse, stats: statsResponse });
        
        // Normalize songs response (API may return array or paginated object)
        let songsArray = [];
        if (Array.isArray(songsResponse)) {
          songsArray = songsResponse;
        } else if (songsResponse && Array.isArray(songsResponse.results)) {
          songsArray = songsResponse.results;
        } else if (songsResponse && Array.isArray(songsResponse.data)) {
          songsArray = songsResponse.data;
        }

        console.log('📊 Processed songs array:', songsArray);
        console.log('📊 Stats response:', statsResponse);

        // Transform the data to match the expected format
        const transformedData = {
          user: user,
            stats: {
            total_releases: statsResponse.total_songs || 0,
            total_streams: statsResponse.total_streams || 0,
            total_revenue: statsResponse.total_revenue || 0,
              has_active_subscription: canUpload() || false,
            distributed_songs: statsResponse.distributed_songs || 0,
            pending_songs: statsResponse.pending_songs || 0, // Add pending songs
            draft_songs: statsResponse.draft_songs || 0 // Add draft songs
          },
          recent_releases: (songsArray || []).slice(0, 5).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist_name || user?.firstName || 'You',
            status: song.status,
            cover_image: song.cover_image,
            created_at: song.created_at
          }))
        };
        
        console.log('🎯 Final transformed data:', transformedData);
        setDashboardData(transformedData);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data for better UX
        setDashboardData({
          user: user,
          stats: {
            total_releases: 0,
            total_streams: 0,
            total_revenue: 0,
            has_active_subscription: false,
            pending_songs: 0,
            draft_songs: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Listen for refresh trigger from uploads
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch songs and stats in parallel
        const [songsResponse, statsResponse] = await Promise.all([
          apiCall('/songs/'),
          apiCall('/songs/stats/')
        ]);
        
        // Normalize songs response (API may return array or paginated object)
        let songsArray = [];
        if (Array.isArray(songsResponse)) {
          songsArray = songsResponse;
        } else if (songsResponse && Array.isArray(songsResponse.results)) {
          songsArray = songsResponse.results;
        } else if (songsResponse && Array.isArray(songsResponse.data)) {
          songsArray = songsResponse.data;
        }

        // Transform the data to match the expected format
        const transformedData = {
          user: user,
            stats: {
            total_releases: statsResponse.total_songs || 0,
            total_streams: statsResponse.total_streams || 0,
            total_revenue: statsResponse.total_revenue || 0,
              has_active_subscription: canUpload() || false,
            distributed_songs: statsResponse.distributed_songs || 0
          },
          recent_releases: (songsArray || []).slice(0, 5).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist_name || user?.firstName || 'You',
            status: song.status,
            cover_image: song.cover_image,
            created_at: song.created_at
          }))
        };
        
        setDashboardData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data for better UX
        setDashboardData({
          user: user,
          stats: {
            total_releases: 0,
            total_streams: 0,
            total_revenue: 0,
            has_active_subscription: false
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (refreshTrigger > 0 && user) {
      console.log('📈 DashboardOverview: Refreshing data due to trigger:', refreshTrigger);
      fetchDashboardData();
    }
  }, [refreshTrigger]);

  // Listen for refresh trigger from uploads
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Refreshing dashboard data due to trigger...');
        
        // Fetch songs and stats in parallel
        const [songsResponse, statsResponse] = await Promise.all([
          apiCall('/songs/'),
          apiCall('/songs/stats/')
        ]);
        
        console.log('✅ Refresh data received:', { songs: songsResponse, stats: statsResponse });
        
        // Normalize songs response (API may return array or paginated object)
        let songsArray = [];
        if (Array.isArray(songsResponse)) {
          songsArray = songsResponse;
        } else if (songsResponse && Array.isArray(songsResponse.results)) {
          songsArray = songsResponse.results;
        } else if (songsResponse && Array.isArray(songsResponse.data)) {
          songsArray = songsResponse.data;
        }

        // Transform the data to match the expected format
        const transformedData = {
          user: user,
            stats: {
            total_releases: statsResponse.total_songs || 0,
            total_streams: statsResponse.total_streams || 0,
            total_revenue: statsResponse.total_revenue || 0,
              has_active_subscription: canUpload() || false,
            distributed_songs: statsResponse.distributed_songs || 0,
            pending_songs: statsResponse.pending_songs || 0,
            draft_songs: statsResponse.draft_songs || 0
          },
          recent_releases: (songsArray || []).slice(0, 5).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist_name || user?.firstName || 'You',
            status: song.status,
            cover_image: song.cover_image,
            created_at: song.created_at
          }))
        };
        
        console.log('🎯 Refresh transformed data:', transformedData);
        setDashboardData(transformedData);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to refresh dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data for better UX
        setDashboardData({
          user: user,
          stats: {
            total_releases: 0,
            total_streams: 0,
            total_revenue: 0,
            has_active_subscription: false,
            pending_songs: 0,
            draft_songs: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (refreshTrigger > 0 && user) {
      console.log('📈 DashboardOverview: Refreshing data due to trigger:', refreshTrigger);
      fetchDashboardData();
    }
  }, [refreshTrigger]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const userData = dashboardData?.user || user;
  const stats = dashboardData?.stats || {
    total_releases: 0,
    total_streams: 0,
    total_revenue: 0,
    has_active_subscription: user?.publicMetadata?.subscription !== 'free' || false
  };

  const statsData = [
    {
      title: "Total Uploads",
      value: stats.total_releases || 0,
      change: null,
      changeType: "neutral",
      icon: MusicalNoteIcon,
      href: "/dashboard/music"
    },
    {
      title: "Pending Reviews", 
      value: stats.pending_songs || 0,
      change: null,
      changeType: "neutral",
      icon: ChartBarIcon,
      href: "/dashboard/music"
    },
    {
      title: "Live Releases",
      value: stats.distributed_songs || 0,
      change: null,
      changeType: "neutral", 
      icon: UserGroupIcon,
      href: "/dashboard/music"
    },
    {
      title: "Draft Songs",
      value: stats.draft_songs || 0,
      change: null,
      changeType: "neutral",
      icon: CurrencyDollarIcon,
      href: "/dashboard/music"
    }
  ];

  const quickActions = [
    {
      title: "Upload New Music",
      description: canUpload() ? "Upload and queue your tracks for distribution" : "Get a subscription to upload music",
      icon: PlusIcon,
      href: canUpload() ? "/upload" : "/dashboard/subscription",
      color: "blue",
      disabled: !canUpload(),
      onClick: !canUpload() ? () => {
        // Could add a toast notification here
        console.log('Subscription required for uploads');
      } : undefined
    },
    {
      title: "View Music Library",
      description: "Check your uploads and their status",
      icon: MusicalNoteIcon,
      href: "/dashboard/music",
      color: "green"
    },
    {
      title: "Manage Subscription",
      description: "View and upgrade your plan",
      icon: CurrencyDollarIcon,
      href: "/dashboard/subscription",
      color: "purple"
    },
    {
      title: "Get Support",
      description: "Need help? Contact our support team",
      icon: LifebuoyIcon,
      href: "/dashboard/tickets",
      color: "orange"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.firstName || userData?.first_name || user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your music uploads and distribution queue.</p>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <span>Role: {userData?.role || user?.publicMetadata?.role || 'User'}</span>
          <span>•</span>
          <span>Plan: {userData?.subscription || user?.publicMetadata?.subscription || 'Free'}</span>
          {(userData?.is_verified || user?.publicMetadata?.isVerified) && (
            <>
              <span>•</span>
              <span className="text-green-600 font-medium">✓ Verified</span>
            </>
          )}
        </div>
      </div>

      {/* API Development Notice */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Platform Development Update</h3>
            <p className="mt-1 text-sm text-blue-700">
              We're currently integrating with major distribution platforms. Advanced features like analytics, revenue tracking, and release scheduling will be available soon! 
              For now, focus on uploading your music - we'll handle the distribution queue.
            </p>
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              Distribution API integration in progress
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {stats.total_releases > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <MusicalNoteIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Upload Activity</p>
                  <p className="text-xs text-blue-600">You have {stats.total_releases} upload{stats.total_releases !== 1 ? 's' : ''} in your library</p>
                </div>
              </div>
              {(stats.distributed_songs || 0) > 0 && (
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Distribution Status</p>
                    <p className="text-xs text-green-600">{stats.distributed_songs} release{stats.distributed_songs !== 1 ? 's' : ''} live on platforms</p>
                  </div>
                </div>
              )}
              {(stats.total_releases - (stats.distributed_songs || 0)) > 0 && (
                <div className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Pending Review</p>
                    <p className="text-xs text-orange-600">{stats.total_releases - (stats.distributed_songs || 0)} upload{(stats.total_releases - (stats.distributed_songs || 0)) !== 1 ? 's' : ''} awaiting distribution</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No uploads yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first track.</p>
              <div className="mt-6">
                {canUpload() ? (
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Upload Your First Track
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button
                      disabled
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Upload Your First Track
                    </button>
                    <p className="text-xs text-gray-500">
                      <Link to="/dashboard/subscription" className="text-blue-600 hover:text-blue-700 underline">
                        Get a subscription
                      </Link> to start uploading your music
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Notice */}
      <div className={`mt-8 rounded-xl p-6 ${
        stats.has_active_subscription 
          ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
          : 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CurrencyDollarIcon className={`h-6 w-6 ${
              stats.has_active_subscription ? 'text-green-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              stats.has_active_subscription ? 'text-green-800' : 'text-blue-800'
            }`}>
              Subscription Status
            </h3>
            <p className={`mt-1 text-sm ${
              stats.has_active_subscription ? 'text-green-700' : 'text-blue-700'
            }`}>
              {stats.has_active_subscription 
                ? `You have an active ${userData?.subscription || user?.publicMetadata?.subscription || 'subscription'} plan. Keep creating amazing music!`
                : "You don't have an active subscription plan. Subscribe to start distributing your music to major platforms."
              }
            </p>
            {!stats.has_active_subscription && (
              <div className="mt-4">
                <Link
                  to="/dashboard/subscription"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-200 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Plans
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
