import { useState } from 'react';
import { 
  Music, 
  Upload, 
  Headphones, 
  Users, 
  TrendingUp, 
  Play, 
  Clock, 
  Globe,
  Plus,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import DashboardLayout from '../components/DashboardLayout';
import ReleasesPage from '../features/components/ReleasesPage';

const DashboardMusic = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock data for stats
  const musicStats = [
    { label: 'Total Tracks', value: '24', icon: Music, change: '+3 this month', color: 'from-purple-500 to-pink-500' },
    { label: 'Total Streams', value: '125.4K', icon: Headphones, change: '+15.2% vs last month', color: 'from-blue-500 to-indigo-500' },
    { label: 'Monthly Listeners', value: '8.7K', icon: Users, change: '+8.1% vs last month', color: 'from-green-500 to-emerald-500' },
    { label: 'Revenue', value: '$2,847', icon: TrendingUp, change: '+22.3% vs last month', color: 'from-orange-500 to-red-500' },
  ];

  const quickActions = [
    { 
      title: 'Upload Single', 
      description: 'Release a single track',
      icon: Upload,
      action: () => setShowUploadModal(true),
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Create Album', 
      description: 'Bundle multiple tracks',
      icon: Plus,
      action: () => navigate('/dashboard/create-album'),
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      title: 'View Analytics', 
      description: 'Track performance',
      icon: BarChart3,
      action: () => navigate('/dashboard/analytics'),
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Schedule Release', 
      description: 'Plan future drops',
      icon: Calendar,
      action: () => navigate('/dashboard/schedule'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <SignedIn>
        <DashboardLayout>
          <div className="p-6 space-y-8">
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
                  {musicStats.map((stat, index) => {
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
                  })}
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
                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
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
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Share Your Music?</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Upload your tracks and reach millions of listeners worldwide across all major streaming platforms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg group"
                  >
                    <Upload className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Upload New Track
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/create-album')}
                    className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg border-2 border-purple-200 group"
                  >
                    <Plus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Create Album
                  </button>
                </div>
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
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Release
                    </button>
                  </div>
                </div>
              </div>
              <ReleasesPage />
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Music</h2>
                    <p className="text-gray-600">Share your creativity with the world</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:border-purple-300 transition-colors">
                      <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Drag & drop your audio file</p>
                      <p className="text-gray-600 mb-4">or click to browse</p>
                      <button className="px-6 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">
                        Choose File
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Track Title</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter track title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option>Select genre</option>
                          <option>Pop</option>
                          <option>Hip Hop</option>
                          <option>Rock</option>
                          <option>Electronic</option>
                          <option>R&B</option>
                          <option>Country</option>
                          <option>Jazz</option>
                          <option>Classical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-4 pt-6">
                      <button 
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium">
                        Upload Track
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default DashboardMusic;
