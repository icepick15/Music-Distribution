import { useState, useEffect, useCallback } from 'react';
import { 
  MusicalNoteIcon,
  CloudArrowUpIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PlayIcon,
  ClockIcon,
  GlobeAltIcon,
  PlusIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import DashboardLayout from '../components/DashboardLayout';

const DashboardMusic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, apiCall, refreshTrigger } = useAuth();
  
  const { canUpload, remainingUploads, subscription } = useSubscription();

  const showUpgradeAlert = () => {
    alert('Please get a subscription plan to start uploading music!');
    navigate('/dashboard/subscription');
  };
  
  const [timeRange, setTimeRange] = useState('7d');
  const [songs, setSongs] = useState([]);
  const [musicStats, setMusicStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check for success message from upload
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
      // Auto-hide after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

  // Extract fetchMusicData as a separate function with useCallback
  const fetchMusicData = useCallback(async () => {
    console.log('🎵 DashboardMusic: Fetching music data...');
    try {
      setLoading(true);
      
      // Fetch songs and stats in parallel
      const [songsResponse, statsResponse] = await Promise.all([
        apiCall('/songs/'),
        apiCall('/songs/stats/')
      ]);
      
      console.log('🎵 Songs response:', songsResponse);
      console.log('📊 Stats response:', statsResponse);
      
      // Normalize songs response to always be an array
      let songsArray = [];
      if (Array.isArray(songsResponse)) {
        songsArray = songsResponse;
      } else if (songsResponse && Array.isArray(songsResponse.results)) {
        songsArray = songsResponse.results;
      } else if (songsResponse && Array.isArray(songsResponse.data)) {
        songsArray = songsResponse.data;
      }

      console.log('🎵 Processed songs array:', songsArray);
      
      setSongs(songsArray);
      setMusicStats(statsResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch music data:', err);
      setError('Failed to load music data');
      // Set fallback data
      setSongs([]);
      setMusicStats({
        total_songs: 0,
        distributed_songs: 0,
        total_streams: 0,
        total_revenue: 0
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove apiCall from dependencies to prevent infinite re-renders

  // Initial load when user becomes available
  useEffect(() => {
    if (user) {
      fetchMusicData();
    }
  }, [user, fetchMusicData]);

  // Listen for refresh trigger from uploads
  useEffect(() => {
    if (refreshTrigger > 0 && user) {
      console.log('📊 DashboardMusic: Refreshing data due to trigger:', refreshTrigger);
      fetchMusicData();
    }
  }, [refreshTrigger, user, fetchMusicData]);

  const statsCards = musicStats ? [
    { 
      label: 'Total Uploads', 
      value: musicStats.total_songs || 0, 
      icon: MusicalNoteIcon, 
      change: musicStats.distributed_songs > 0 ? `${musicStats.distributed_songs} live` : 'No live releases yet',
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      label: 'Live Releases', 
      value: musicStats.distributed_songs || 0, 
      icon: GlobeAltIcon, 
      change: musicStats.distributed_songs > 0 ? 'On streaming platforms' : 'Upload to go live',
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Pending Review', 
      value: (musicStats.total_songs || 0) - (musicStats.distributed_songs || 0), 
      icon: ClockIcon, 
      change: 'Processing for distribution',
      color: 'from-orange-500 to-yellow-500' 
    },
    { 
      label: 'Upload Credits', 
      value: (typeof remainingUploads !== 'undefined') ? remainingUploads : (user?.publicMetadata?.songCredits || 0), 
      icon: CurrencyDollarIcon, 
      change: user?.publicMetadata?.subscriptionType === 'yearly' ? 'Premium plan' : 'Pay per upload',
      color: 'from-blue-500 to-indigo-500' 
    },
  ] : [];

  const quickActions = [
    { 
      title: 'Upload Music', 
      description: canUpload() ? 'Upload your latest track' : 'Get a plan to upload',
      icon: ArrowUpTrayIcon,
      action: canUpload() ? () => navigate('/upload') : showUpgradeAlert,
      color: canUpload() ? 'from-purple-500 to-pink-500' : 'from-gray-400 to-gray-500',
      disabled: !canUpload()
    },
    { 
      title: 'Manage Library', 
      description: 'View all your uploads',
      icon: MusicalNoteIcon,
      action: () => {}, // Stay on same page
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      title: 'Analytics (Soon)', 
      description: 'Track performance metrics',
      icon: ChartBarIcon,
      action: () => alert('Analytics will be available soon once our distribution API is live!'),
      color: 'from-gray-400 to-gray-500',
      disabled: true
    },
    { 
      title: 'Upgrade Plan', 
      description: 'Get more features',
      icon: CurrencyDollarIcon,
      action: () => navigate('/dashboard/subscription'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <p className="text-green-800 font-medium">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-24 -translate-x-24" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Music Dashboard</h1>
                    <p className="text-xl text-white/80">Manage your musical journey</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select 
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 3 months</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse">
                        <div className="h-12 w-12 bg-white/20 rounded-xl mb-4"></div>
                        <div className="h-8 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 bg-white/20 rounded mb-2"></div>
                        <div className="h-3 bg-white/20 rounded"></div>
                      </div>
                    ))
                  ) : error ? (
                    <div className="col-span-full text-center py-8">
                      <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <p className="text-red-300">{error}</p>
                    </div>
                  ) : (
                    statsCards.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-3xl font-bold mb-1">{stat.value}</p>
                            <p className="text-white/60 text-sm mb-2">{stat.label}</p>
                            <p className="text-green-300 text-xs">{stat.change}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    disabled={action.disabled}
                    className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 ${
                      action.disabled ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Enhanced Upload Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <ArrowUpTrayIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Share Your Music?</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Upload your tracks and we'll handle the distribution to major streaming platforms.
                </p>
                {canUpload() ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/upload')}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg group"
                    >
                      <ArrowUpTrayIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                      Upload New Track
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/subscription')}
                      className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg border-2 border-purple-200 group"
                    >
                      <CurrencyDollarIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                      Manage Plan
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-orange-600 mb-6 font-medium">
                      You need an active subscription to upload music
                    </p>
                    <button 
                      onClick={() => navigate('/dashboard/subscription')}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold text-lg group"
                    >
                      <CurrencyDollarIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                      Get Subscription Plan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Releases Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Releases</h2>
                    <p className="text-gray-600 mt-1">Manage and track your music releases</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button 
                      onClick={canUpload() ? () => navigate('/upload') : showUpgradeAlert}
                      className={`inline-flex items-center px-6 py-2 rounded-xl transition-all duration-300 font-medium ${
                        canUpload() 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!canUpload()}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {canUpload() ? 'New Release' : 'Get Plan'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-12">
                    <MusicalNoteIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No releases yet</h3>
                    <p className="text-gray-600 mb-6">Upload your first track to get started</p>
                    <button 
                      onClick={canUpload() ? () => navigate('/upload') : showUpgradeAlert}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                        canUpload() 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!canUpload()}
                    >
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      {canUpload() ? 'Upload Your First Track' : 'Get Plan to Upload'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {songs.slice(0, 5).map((song) => (
                      <div key={song.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img 
                              src={song.cover_image || '/api/placeholder/60/60'} 
                              alt={song.title}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <PlayIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{song.title}</h3>
                            <p className="text-gray-600 text-sm">{song.artist_name || user?.first_name || 'You'}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                song.status === 'approved' ? 'bg-green-100 text-green-800' :
                                song.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {song.status === 'approved' ? 'Live' : song.status === 'pending' ? 'Processing' : 'Review'}
                              </span>
                              <span className="text-gray-500 text-xs">{song.duration || '3:45'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              song.status === 'approved' ? 'bg-green-100 text-green-800' :
                              song.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              song.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {song.status === 'approved' ? 'Live' : 
                               song.status === 'pending' ? 'Pending' : 
                               song.status === 'processing' ? 'Processing' : 'Review'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded {new Date(song.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {songs.length > 5 && (
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => navigate('/dashboard/music')}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View all {songs.length} releases →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DashboardLayout>
  );
};

export default DashboardMusic;
