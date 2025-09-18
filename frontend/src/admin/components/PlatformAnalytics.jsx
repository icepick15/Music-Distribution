import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Music, 
  Download,
  Play,
  Eye,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  MapPin,
  Clock
} from "lucide-react";

const PlatformAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeMetric, setActiveMetric] = useState('users');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics data');
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback mock data
      setAnalyticsData({
        overview: {
          total_users: 3400,
          new_users: 234,
          total_songs: 1250,
          new_songs: 45,
          total_plays: 125000,
          total_downloads: 8500,
          user_growth: 12.5,
          song_growth: 8.3,
          engagement_growth: 15.7
        },
        user_metrics: {
          daily_active: 850,
          weekly_active: 2100,
          monthly_active: 3200,
          retention_rate: 68.5,
          bounce_rate: 32.1
        },
        content_metrics: {
          songs_by_genre: [
            { genre: 'Pop', count: 320, percentage: 25.6 },
            { genre: 'Hip-Hop', count: 275, percentage: 22.0 },
            { genre: 'Electronic', count: 180, percentage: 14.4 },
            { genre: 'Rock', count: 150, percentage: 12.0 },
            { genre: 'R&B', count: 125, percentage: 10.0 },
            { genre: 'Jazz', count: 100, percentage: 8.0 },
            { genre: 'Classical', count: 75, percentage: 6.0 },
            { genre: 'Other', count: 25, percentage: 2.0 }
          ],
          top_artists: [
            { artist: 'Nova Star', songs: 25, plays: 15000, downloads: 1200 },
            { artist: 'Rayne Music', songs: 18, plays: 12500, downloads: 950 },
            { artist: 'Lux Beats', songs: 22, plays: 11800, downloads: 780 },
            { artist: 'Echo Sound', songs: 15, plays: 9500, downloads: 650 },
            { artist: 'Melody Wave', songs: 20, plays: 8200, downloads: 580 }
          ]
        },
        engagement_metrics: {
          daily_plays: [
            { date: '2024-01-01', plays: 3200, downloads: 180 },
            { date: '2024-01-02', plays: 3450, downloads: 205 },
            { date: '2024-01-03', plays: 2980, downloads: 165 },
            { date: '2024-01-04', plays: 4100, downloads: 225 },
            { date: '2024-01-05', plays: 3800, downloads: 195 },
            { date: '2024-01-06', plays: 4250, downloads: 240 },
            { date: '2024-01-07', plays: 3950, downloads: 210 }
          ],
          peak_hours: [
            { hour: '00:00', activity: 15 },
            { hour: '06:00', activity: 25 },
            { hour: '12:00', activity: 45 },
            { hour: '18:00', activity: 75 },
            { hour: '21:00', activity: 95 }
          ]
        },
        geographic_data: [
          { country: 'Nigeria', users: 1850, percentage: 54.4 },
          { country: 'Ghana', users: 520, percentage: 15.3 },
          { country: 'South Africa', users: 385, percentage: 11.3 },
          { country: 'Kenya', users: 285, percentage: 8.4 },
          { country: 'United States', users: 180, percentage: 5.3 },
          { country: 'United Kingdom', users: 120, percentage: 3.5 },
          { country: 'Other', users: 60, percentage: 1.8 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toLocaleString() || '0';
  };

  const getGrowthIndicator = (growth) => {
    return (
      <div className={`flex items-center space-x-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className={`w-4 h-4 ${growth < 0 ? 'rotate-180' : ''}`} />
        <span className="text-sm font-medium">
          {growth >= 0 ? '+' : ''}{growth}%
        </span>
      </div>
    );
  };

  const renderChart = (data, type = 'bar') => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item.plays || item.count || item.users || item.activity || 0));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item.plays || item.count || item.users || item.activity || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">
                {item.genre || item.country || item.hour || item.date || item.artist || `Item ${index + 1}`}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-sm font-medium text-gray-900 text-right">
                {formatNumber(value)}
              </div>
              {item.percentage && (
                <div className="w-12 text-xs text-gray-500 text-right">
                  {item.percentage}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor platform performance and user engagement</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview?.total_users)}</p>
              {getGrowthIndicator(analyticsData.overview?.user_growth)}
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Songs</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview?.total_songs)}</p>
              {getGrowthIndicator(analyticsData.overview?.song_growth)}
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Music className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Plays</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview?.total_plays)}</p>
              {getGrowthIndicator(analyticsData.overview?.engagement_growth)}
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview?.total_downloads)}</p>
              <div className="flex items-center space-x-1 text-blue-600">
                <Download className="w-4 h-4" />
                <span className="text-sm">Downloads</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'users', name: 'User Analytics', icon: Users },
            { id: 'content', name: 'Content Analytics', icon: Music },
            { id: 'engagement', name: 'Engagement', icon: Activity },
            { id: 'geography', name: 'Geography', icon: Globe }
          ].map((metric) => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                activeMetric === metric.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <metric.icon className="w-4 h-4" />
              <span>{metric.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Content */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Analytics */}
          {activeMetric === 'users' && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Daily Active Users</span>
                    <span className="font-semibold text-gray-900">{analyticsData.user_metrics?.daily_active?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Weekly Active Users</span>
                    <span className="font-semibold text-gray-900">{analyticsData.user_metrics?.weekly_active?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Monthly Active Users</span>
                    <span className="font-semibold text-gray-900">{analyticsData.user_metrics?.monthly_active?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Retention Rate</span>
                    <span className="font-semibold text-green-600">{analyticsData.user_metrics?.retention_rate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">New Users (Last 7 days)</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const value = Math.floor(Math.random() * 50) + 20;
                    const percentage = (value / 70) * 100;
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <div className="w-8 text-sm text-gray-600">{day}</div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-8 text-sm font-medium text-gray-900">{value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Content Analytics */}
          {activeMetric === 'content' && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Songs by Genre</h3>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                {renderChart(analyticsData.content_metrics?.songs_by_genre)}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Artists</h3>
                  <Music className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analyticsData.content_metrics?.top_artists?.map((artist, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">{artist.artist[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{artist.artist}</p>
                          <p className="text-xs text-gray-500">{artist.songs} songs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatNumber(artist.plays)} plays</p>
                        <p className="text-xs text-gray-500">{formatNumber(artist.downloads)} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Engagement Analytics */}
          {activeMetric === 'engagement' && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Daily Engagement</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                {renderChart(analyticsData.engagement_metrics?.daily_plays)}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Peak Activity Hours</h3>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                {renderChart(analyticsData.engagement_metrics?.peak_hours)}
              </div>
            </>
          )}

          {/* Geographic Analytics */}
          {activeMetric === 'geography' && (
            <>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users by Country</h3>
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                {renderChart(analyticsData.geographic_data)}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Geographic Insights</h3>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">Top Market</p>
                    <p className="text-blue-600">Nigeria accounts for 54.4% of all users</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">Fastest Growing</p>
                    <p className="text-green-600">Ghana showing 23% growth this month</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-purple-800 font-medium">Expansion Opportunity</p>
                    <p className="text-purple-600">Consider targeting East African markets</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlatformAnalytics;
