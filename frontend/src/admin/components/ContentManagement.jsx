// src/admin/components/ContentManagement.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Music, Search, Filter, Check, X, Clock, Radio, Eye,
  ChevronDown, Download, Upload, Play, Pause, MoreVertical,
  AlertCircle, CheckCircle, XCircle, Send, ArrowRight
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { canPerformAction } from "../../utils/permissions";

export default function ContentManagement() {
  const { user } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, distributed, rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [stats, setStats] = useState({});
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchSongs();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/cp/dashboard/stats/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      let url = `http://localhost:8000/api/cp/content/`;
      
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const songsData = Array.isArray(data) ? data : data.results || [];
        setSongs(songsData);
      }
    } catch (error) {
      console.error('Songs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (songId, newStatus) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/cp/content/${songId}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh songs list
        fetchSongs();
        fetchStats();
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedSongs.length === 0) return;

    try {
      const authToken = localStorage.getItem('authToken');
      
      for (const songId of selectedSongs) {
        await fetch(`http://localhost:8000/api/cp/content/${songId}/update_status/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: action }),
        });
      }

      // Clear selection and refresh
      setSelectedSongs([]);
      setShowBulkActions(false);
      fetchSongs();
      fetchStats();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const selectAllSongs = () => {
    if (selectedSongs.length === songs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(songs.map(song => song.id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" />, text: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-3 h-3" />, text: 'Approved' },
      distributed: { color: 'bg-green-100 text-green-700', icon: <Radio className="w-3 h-3" />, text: 'Live' },
      rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" />, text: 'Rejected' },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const filteredSongs = songs.filter(song =>
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    all: stats.total_songs || 0,
    pending: stats.pending_songs || 0,
    approved: (stats.total_songs || 0) - (stats.pending_songs || 0) - (stats.live_songs || 0),
    distributed: stats.live_songs || 0,
    rejected: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 mt-1">Manage and approve songs for distribution</p>
        </div>
        <button
          onClick={fetchSongs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['all', 'pending', 'approved', 'distributed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filter === status
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{statusCounts[status]}</p>
            <p className="text-sm text-gray-600 capitalize mt-1">{status}</p>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by song title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSongs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {selectedSongs.length} song{selectedSongs.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('approved')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleBulkAction('distributed')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Distribute
            </button>
            <button
              onClick={() => handleBulkAction('rejected')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => setSelectedSongs([])}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Songs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSongs.length === songs.length && songs.length > 0}
                    onChange={selectAllSongs}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Song
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Artist
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Upload Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Workflow
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No songs found</p>
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={() => toggleSongSelection(song.id)}
                        className="rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{song.title || 'Untitled'}</p>
                          <p className="text-sm text-gray-500">{song.genre || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{song.artist_name || 'Unknown Artist'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(song.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">
                        {song.created_at ? new Date(song.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {/* Workflow Progress */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${song.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className={`w-2 h-2 rounded-full ${song.status === 'approved' || song.status === 'distributed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className={`w-2 h-2 rounded-full ${song.status === 'distributed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {song.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(song.id, 'approved')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                              title="Approve"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(song.id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                              title="Reject"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        {song.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(song.id, 'distributed')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                            title="Distribute to Platforms"
                          >
                            <Send className="w-3 h-3" />
                            Distribute
                          </button>
                        )}
                        {song.status === 'distributed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg flex items-center gap-1">
                            <Radio className="w-3 h-3" />
                            Live
                          </span>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
