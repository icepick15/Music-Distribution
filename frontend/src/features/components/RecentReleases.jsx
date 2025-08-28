import { useState, useMemo } from "react";
import { 
  Play, 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Eye,
  Download,
  Share2
} from "lucide-react";

// Mock data for releases
const mockReleases = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "John Doe",
    status: "live",
    releaseDate: "2024-01-15",
    upc: "123456789012",
    streams: "125,400",
    revenue: "$847.50",
    platforms: ["Spotify", "Apple Music", "YouTube"],
    coverArt: "/api/placeholder/60/60",
    genre: "Pop",
    type: "Single"
  },
  {
    id: 2,
    title: "Ocean Waves",
    artist: "Jane Smith",
    status: "pending",
    releaseDate: "2024-02-01",
    upc: "123456789013",
    streams: "0",
    revenue: "$0.00",
    platforms: [],
    coverArt: "/api/placeholder/60/60",
    genre: "Electronic",
    type: "Single"
  },
  {
    id: 3,
    title: "City Lights EP",
    artist: "Mike Johnson",
    status: "live",
    releaseDate: "2024-01-01",
    upc: "123456789014",
    streams: "89,200",
    revenue: "$624.40",
    platforms: ["Spotify", "Apple Music"],
    coverArt: "/api/placeholder/60/60",
    genre: "Hip Hop",
    type: "EP"
  },
  {
    id: 4,
    title: "Broken Hearts",
    artist: "Sarah Wilson",
    status: "rejected",
    releaseDate: "2024-01-20",
    upc: "123456789015",
    streams: "0",
    revenue: "$0.00",
    platforms: [],
    coverArt: "/api/placeholder/60/60",
    genre: "Pop",
    type: "Single"
  }
];

const RecentReleases = ({ activeTab, searchQuery = "", sortBy = "date" }) => {
  const [selectedReleases, setSelectedReleases] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Filter and sort releases
  const filteredReleases = useMemo(() => {
    let filtered = mockReleases;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(release => release.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(release => 
        release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort releases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        case "streams":
          return parseInt(b.streams.replace(/,/g, "")) - parseInt(a.streams.replace(/,/g, ""));
        case "date":
        default:
          return new Date(b.releaseDate) - new Date(a.releaseDate);
      }
    });

    return filtered;
  }, [activeTab, searchQuery, sortBy]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      live: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Live" },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleSelectRelease = (releaseId) => {
    setSelectedReleases(prev => 
      prev.includes(releaseId) 
        ? prev.filter(id => id !== releaseId)
        : [...prev, releaseId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReleases(
      selectedReleases.length === filteredReleases.length 
        ? [] 
        : filteredReleases.map(release => release.id)
    );
  };

  if (filteredReleases.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No releases found</h3>
        <p className="text-gray-600">
          {searchQuery ? "Try adjusting your search criteria or browse all releases" : "Your music releases will appear here once uploaded"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedReleases.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">
              {selectedReleases.length} release{selectedReleases.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 rounded-lg transition-colors">
                Delete
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 rounded-lg transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Release Cards */}
      <div className="space-y-3">
        {filteredReleases.map((release) => (
          <div key={release.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedReleases.includes(release.id)}
                onChange={() => handleSelectRelease(release.id)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />

              {/* Cover Art */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {release.title.charAt(0)}
              </div>

              {/* Release Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{release.title}</h3>
                    <p className="text-gray-600">{release.artist}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      {getStatusBadge(release.status)}
                      <span className="text-sm text-gray-500">{release.type} • {release.genre}</span>
                      <span className="text-sm text-gray-500">Released {new Date(release.releaseDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{release.streams}</p>
                      <p className="text-sm text-gray-600">Streams</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{release.revenue}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {release.status === "live" && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200">
                          <Play className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                          <TrendingUp className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                          <ExternalLink className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowActionMenu(showActionMenu === release.id ? null : release.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {/* Action Menu */}
                      {showActionMenu === release.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <Eye className="h-4 w-4 mr-3" />
                            View Details
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <Edit className="h-4 w-4 mr-3" />
                            Edit Release
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <Download className="h-4 w-4 mr-3" />
                            Download
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <Share2 className="h-4 w-4 mr-3" />
                            Share
                          </button>
                          <hr className="my-2" />
                          <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center">
                            <Trash2 className="h-4 w-4 mr-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{release.streams}</p>
                    <p className="text-xs text-gray-600">Streams</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{release.revenue}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{release.platforms.length}</p>
                    <p className="text-xs text-gray-600">Platforms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredReleases.length >= 10 && (
        <div className="text-center pt-6">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
            Load More Releases
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReleases;
  