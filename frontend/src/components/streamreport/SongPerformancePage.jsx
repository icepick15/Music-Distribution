import React, { useState } from "react";
import { Play, TrendingUp, Eye, DollarSign, Calendar, Filter, Search, MoreHorizontal } from "lucide-react";

const songs = [
  {
    id: 1,
    title: "Blessings",
    artist: "Your Artist Name",
    albumArt: "/api/placeholder/40/40",
    releaseDate: "2024-08-15",
    platformData: {
      Spotify: { streams: 12450, growth: "+15%" },
      AppleMusic: { streams: 9800, growth: "+8%" },
      YouTube: { streams: 15600, growth: "+22%" },
      SoundCloud: { streams: 3200, growth: "+5%" },
    },
    totalStreams: 41050,
    revenue: "₦45,200",
    trend: "up"
  },
  {
    id: 2,
    title: "Vibes Only",
    artist: "Your Artist Name",
    albumArt: "/api/placeholder/40/40",
    releaseDate: "2024-07-20",
    platformData: {
      Spotify: { streams: 8100, growth: "+12%" },
      AppleMusic: { streams: 7200, growth: "+6%" },
      YouTube: { streams: 13400, growth: "+18%" },
      SoundCloud: { streams: 2800, growth: "+3%" },
    },
    totalStreams: 31500,
    revenue: "₦31,800",
    trend: "up"
  },
  {
    id: 3,
    title: "Take Over",
    artist: "Your Artist Name",
    albumArt: "/api/placeholder/40/40",
    releaseDate: "2024-06-10",
    platformData: {
      Spotify: { streams: 5000, growth: "-2%" },
      AppleMusic: { streams: 6200, growth: "+1%" },
      YouTube: { streams: 8800, growth: "+5%" },
      SoundCloud: { streams: 2100, growth: "-1%" },
    },
    totalStreams: 22100,
    revenue: "₦22,100",
    trend: "down"
  },
  {
    id: 4,
    title: "Midnight Dreams",
    artist: "Your Artist Name",
    albumArt: "/api/placeholder/40/40",
    releaseDate: "2024-05-05",
    platformData: {
      Spotify: { streams: 15800, growth: "+25%" },
      AppleMusic: { streams: 11200, growth: "+12%" },
      YouTube: { streams: 18900, growth: "+30%" },
      SoundCloud: { streams: 4100, growth: "+8%" },
    },
    totalStreams: 50000,
    revenue: "₦58,500",
    trend: "up"
  }
];

export default function SongPerformancePage() {
  const [sortBy, setSortBy] = useState('totalStreams');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const platforms = ['all', 'Spotify', 'AppleMusic', 'YouTube', 'SoundCloud'];

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case 'totalStreams':
        return b.totalStreams - a.totalStreams;
      case 'revenue':
        return parseFloat(b.revenue.replace(/[₦,]/g, '')) - parseFloat(a.revenue.replace(/[₦,]/g, ''));
      case 'releaseDate':
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      default:
        return 0;
    }
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Song Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed analytics for your music releases</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform}
              </option>
            ))}
          </select>
          
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="totalStreams">Sort by Streams</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="releaseDate">Sort by Date</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Song
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Release Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Streams
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform Breakdown
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSongs.map((song) => (
              <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{song.title}</div>
                      <div className="text-sm text-gray-500">{song.artist}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(song.releaseDate)}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(song.totalStreams)}
                  </div>
                  <div className="text-xs text-gray-500">Total plays</div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(song.platformData).map(([platform, data]) => (
                      <div key={platform} className="flex justify-between">
                        <span className="text-gray-600">{platform}:</span>
                        <div className="text-right">
                          <span className="font-medium">{formatNumber(data.streams)}</span>
                          <span className={`ml-1 ${
                            data.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {data.growth}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm font-semibold text-gray-900">{song.revenue}</span>
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    song.trend === 'up' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      song.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    {song.trend === 'up' ? 'Rising' : 'Declining'}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedSongs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No songs found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
