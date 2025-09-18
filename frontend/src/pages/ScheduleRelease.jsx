import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const ScheduleRelease = () => {
  const navigate = useNavigate();
  const { user, apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    song_id: '',
    release_date: '',
    release_time: '',
    timezone: 'UTC',
    platforms: [],
    pre_save_enabled: false,
    announcement_date: ''
  });

  const platforms = [
    { id: 'spotify', name: 'Spotify', enabled: true },
    { id: 'apple', name: 'Apple Music', enabled: true },
    { id: 'youtube', name: 'YouTube Music', enabled: true },
    { id: 'soundcloud', name: 'SoundCloud', enabled: false },
    { id: 'tidal', name: 'TIDAL', enabled: false },
    { id: 'deezer', name: 'Deezer', enabled: false }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would be implemented when we have scheduling endpoints
      console.log('Schedule data:', scheduleData);
      
      // For now, show success message and redirect
      navigate('/dashboard/music', { 
        state: { message: 'Release scheduling feature coming soon! For now, releases go live immediately after approval.' }
      });
    } catch (error) {
      console.error('Scheduling error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard/music')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Release</h1>
              <p className="text-gray-600">Plan your music release for maximum impact</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">Release Scheduling Coming Soon!</h3>
              <p className="text-orange-800 mb-4">
                We're working on advanced release scheduling features including pre-save campaigns, 
                coordinated platform releases, and marketing automation. Currently, approved tracks 
                go live immediately across all selected platforms.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload Track Now
                </button>
                <button 
                  onClick={() => navigate('/dashboard/music')}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview of Future Form */}
        <form onSubmit={handleSubmit} className="space-y-8 opacity-50 pointer-events-none">
          {/* Release Timing */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarIcon className="h-6 w-6 text-purple-600 mr-3" />
              Release Timing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                <input 
                  type="date"
                  value={scheduleData.release_date}
                  onChange={(e) => setScheduleData({...scheduleData, release_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Time</label>
                <input 
                  type="time"
                  value={scheduleData.release_time}
                  onChange={(e) => setScheduleData({...scheduleData, release_time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select 
                  value={scheduleData.timezone}
                  onChange={(e) => setScheduleData({...scheduleData, timezone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <GlobeAltIcon className="h-6 w-6 text-purple-600 mr-3" />
              Platform Distribution
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center p-4 border border-gray-200 rounded-xl">
                  <input 
                    type="checkbox"
                    id={platform.id}
                    checked={scheduleData.platforms.includes(platform.id)}
                    disabled
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={platform.id} className="ml-3 flex-1">
                    <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                    {!platform.enabled && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-6 w-6 text-purple-600 mr-3" />
              Advanced Options
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Pre-Save Campaign</h3>
                  <p className="text-sm text-gray-600">Allow fans to save your release before it goes live</p>
                </div>
                <input 
                  type="checkbox"
                  checked={scheduleData.pre_save_enabled}
                  onChange={(e) => setScheduleData({...scheduleData, pre_save_enabled: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Date (Optional)</label>
                <input 
                  type="date"
                  value={scheduleData.announcement_date}
                  onChange={(e) => setScheduleData({...scheduleData, announcement_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="When to announce the release"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set when you want to announce this release to your fans
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/music')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
            >
              {loading ? 'Scheduling...' : 'Schedule Release'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ScheduleRelease;
