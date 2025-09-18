import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  MusicalNoteIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const CreateAlbum = () => {
  const navigate = useNavigate();
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([{ id: 1, title: '', file: null }]);
  const [albumData, setAlbumData] = useState({
    title: '',
    artist_name: '',
    release_date: '',
    genre: '',
    description: '',
    cover_image: null
  });

  const addTrack = () => {
    const newTrack = { id: Date.now(), title: '', file: null };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter(track => track.id !== id));
    }
  };

  const updateTrack = (id, field, value) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, [field]: value } : track
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would be implemented when we have album endpoints
      console.log('Album data:', albumData);
      console.log('Tracks:', tracks);
      
      // For now, show success message and redirect
      navigate('/dashboard/music', { 
        state: { message: 'Album creation feature coming soon! For now, please upload tracks individually.' }
      });
    } catch (error) {
      console.error('Album creation error:', error);
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
              <h1 className="text-3xl font-bold text-gray-900">Create Album</h1>
              <p className="text-gray-600">Bundle multiple tracks into an album release</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Album Creation Coming Soon!</h3>
              <p className="text-blue-800 mb-4">
                We're working on full album creation functionality. For now, you can upload individual tracks 
                and we'll help you bundle them into albums later.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload Single Track
                </button>
                <button 
                  onClick={() => navigate('/dashboard/music')}
                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview of Future Form */}
        <form onSubmit={handleSubmit} className="space-y-8 opacity-50 pointer-events-none">
          {/* Album Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Album Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Album Title</label>
                <input 
                  type="text"
                  value={albumData.title}
                  onChange={(e) => setAlbumData({...albumData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter album title"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
                <input 
                  type="text"
                  value={albumData.artist_name}
                  onChange={(e) => setAlbumData({...albumData, artist_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter artist name"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                <input 
                  type="date"
                  value={albumData.release_date}
                  onChange={(e) => setAlbumData({...albumData, release_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select 
                  value={albumData.genre}
                  onChange={(e) => setAlbumData({...albumData, genre: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled
                >
                  <option value="">Select genre</option>
                  <option value="pop">Pop</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="rock">Rock</option>
                  <option value="electronic">Electronic</option>
                  <option value="rnb">R&B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tracks */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tracks</h2>
              <button 
                type="button"
                onClick={addTrack}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                disabled
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Track
              </button>
            </div>

            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text"
                        placeholder="Track title"
                        value={track.title}
                        onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled
                      />
                      <input 
                        type="file"
                        accept="audio/*"
                        onChange={(e) => updateTrack(track.id, 'file', e.target.files[0])}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled
                      />
                    </div>
                    {tracks.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeTrack(track.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateAlbum;
