import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Search,
  MoreVertical,
  Music,
  User,
  Calendar,
  FileAudio,
  AlertTriangle
} from "lucide-react";

const ContentManagementPanel = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    genre: '',
    date_range: ''
  });
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSongForRejection, setSelectedSongForRejection] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, [searchTerm, filters]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/songs/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch songs');
      
      const data = await response.json();
      setSongs(data.results || data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      // Fallback mock data
      setSongs([
        {
          id: 1,
          title: "Lost in Sound",
          artist: { username: "Nova", first_name: "Nova", last_name: "Star" },
          genre: "Electronic",
          status: "pending",
          duration: "3:45",
          file_size: "5.2 MB",
          upload_date: "2024-01-15T10:30:00Z",
          audio_file: "/media/songs/lost_in_sound.mp3",
          artwork: "/media/artwork/lost_in_sound.jpg",
          plays_count: 0,
          downloads_count: 0
        },
        {
          id: 2,
          title: "Echoes of Tomorrow",
          artist: { username: "Rayne", first_name: "Rayne", last_name: "Music" },
          genre: "Pop",
          status: "approved",
          duration: "4:12",
          file_size: "6.8 MB",
          upload_date: "2024-01-14T15:45:00Z",
          audio_file: "/media/songs/echoes.mp3",
          artwork: "/media/artwork/echoes.jpg",
          plays_count: 150,
          downloads_count: 25
        },
        {
          id: 3,
          title: "Midnight Chill",
          artist: { username: "LUX", first_name: "Lux", last_name: "Beats" },
          genre: "Lo-Fi",
          status: "rejected",
          duration: "2:58",
          file_size: "4.1 MB",
          upload_date: "2024-01-13T08:20:00Z",
          audio_file: "/media/songs/midnight_chill.mp3",
          artwork: "/media/artwork/midnight_chill.jpg",
          rejection_reason: "Audio quality below standards",
          plays_count: 0,
          downloads_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSongAction = async (songId, action, reason = null) => {
    try {
      const endpoint = action === 'approve' ? 'approve_song' : 'reject_song';
      const body = action === 'reject' && reason ? { reason } : {};
      
      const response = await fetch(`/api/admin/songs/${songId}/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Failed to ${action} song`);
      
      // Update local state
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { ...song, status: action === 'approve' ? 'approved' : 'rejected', rejection_reason: reason }
            : song
        )
      );
      
      // Show success notification
      alert(`Song ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing song:`, error);
      alert(`Failed to ${action} song`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedSongs.length === 0) {
      alert('Please select songs to perform bulk action');
      return;
    }

    try {
      const response = await fetch(`/api/admin/songs/bulk_${action}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_ids: selectedSongs }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} songs`);
      
      fetchSongs(); // Refresh the list
      setSelectedSongs([]);
      alert(`Bulk ${action} completed successfully`);
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      alert(`Failed to ${action} songs`);
    }
  };

  const togglePlayPause = (songId) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Pending</span></span>,
      approved: <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1"><CheckCircle className="w-3 h-3" /><span>Approved</span></span>,
      rejected: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center space-x-1"><XCircle className="w-3 h-3" /><span>Rejected</span></span>
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openRejectModal = (song) => {
    setSelectedSongForRejection(song);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    handleSongAction(selectedSongForRejection.id, 'reject', rejectionReason);
    setShowRejectModal(false);
    setSelectedSongForRejection(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Review and manage uploaded songs</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Songs</p>
              <p className="text-2xl font-bold text-gray-900">{songs.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Music className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {songs.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {songs.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {songs.filter(s => s.status === 'rejected').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search songs by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.genre}
              onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="electronic">Electronic</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSongs.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-purple-700 font-medium">
                {selectedSongs.length} song(s) selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Songs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading songs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSongs(songs.map(s => s.id));
                        } else {
                          setSelectedSongs([]);
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Song Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSongs(prev => [...prev, song.id]);
                          } else {
                            setSelectedSongs(prev => prev.filter(id => id !== song.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            {song.artwork ? (
                              <img 
                                src={song.artwork} 
                                alt={song.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Music className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <button
                            onClick={() => togglePlayPause(song.id)}
                            className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            {currentlyPlaying === song.id ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{song.title}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{song.genre}</span>
                            <span>•</span>
                            <span>{song.duration}</span>
                            <span>•</span>
                            <span>{song.file_size}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {song.artist.first_name?.[0] || song.artist.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {song.artist.first_name && song.artist.last_name 
                              ? `${song.artist.first_name} ${song.artist.last_name}` 
                              : song.artist.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(song.status)}
                      {song.status === 'rejected' && song.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">{song.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{song.plays_count} plays</p>
                        <p className="text-gray-500">{song.downloads_count} downloads</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(song.upload_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {song.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSongAction(song.id, 'approve')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve Song"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(song)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Song"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview Song"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Song</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              You are about to reject "{selectedSongForRejection?.title}". Please provide a reason:
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Song
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagementPanel;
