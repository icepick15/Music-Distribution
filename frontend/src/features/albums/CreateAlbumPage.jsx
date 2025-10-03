import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  MusicalNoteIcon, 
  ArrowLeftIcon, 
  CalendarIcon,
  PhotoIcon,
  InformationCircleIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CreateAlbumPage = () => {
  const navigate = useNavigate();
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAlbum, setCreatedAlbum] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    releaseType: 'album', // album, ep, single
    releaseDate: '',
    description: '',
    numberOfTracks: '',
    coverArt: null,
    coverArtPreview: null,
    genre: '',
    isExplicit: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCoverArtChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover art must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        coverArt: file,
        coverArtPreview: URL.createObjectURL(file)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Album/EP title is required';
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Release date is required';
    } else {
      const selectedDate = new Date(formData.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.releaseDate = 'Release date cannot be in the past';
      }
    }

    if (!formData.numberOfTracks || formData.numberOfTracks < 1) {
      newErrors.numberOfTracks = 'Please specify number of tracks (minimum 1)';
    }

    if (formData.releaseType === 'ep' && (formData.numberOfTracks < 3 || formData.numberOfTracks > 6)) {
      newErrors.numberOfTracks = 'An EP typically has 3-6 tracks';
    }

    if (formData.releaseType === 'album' && formData.numberOfTracks < 7) {
      newErrors.numberOfTracks = 'An album typically has 7 or more tracks';
    }

    if (!formData.genre) {
      newErrors.genre = 'Please select a genre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('release_type', formData.releaseType);
      submitData.append('release_date', formData.releaseDate);
      submitData.append('description', formData.description);
      submitData.append('number_of_tracks', formData.numberOfTracks);
      submitData.append('genre', formData.genre);
      submitData.append('is_explicit', formData.isExplicit);
      
      if (formData.coverArt) {
        submitData.append('cover_art', formData.coverArt);
      }

      // API call to create album
      const response = await apiCall('/songs/albums/', {
        method: 'POST',
        body: submitData,
        // Don't set Content-Type header - let browser set it with boundary for FormData
        headers: {}
      });

      if (response) {
        setCreatedAlbum(response);
        setShowSuccessModal(true);
        toast.success('Album/EP created successfully! 🎉');
        
        // Check if release is scheduled
        const releaseDate = new Date(formData.releaseDate);
        const today = new Date();
        if (releaseDate > today) {
          toast.success(`Release scheduled for ${releaseDate.toLocaleDateString()}`, {
            duration: 5000,
            icon: '📅'
          });
        }
      }
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error(error.message || 'Failed to create album. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard/music');
  };

  const handleAddTracks = () => {
    setShowSuccessModal(false);
    navigate(`/dashboard/albums/${createdAlbum.id}/tracks`);
  };

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country', 
    'Jazz', 'Classical', 'Reggae', 'Blues', 'Folk', 'Soul',
    'Indie', 'Alternative', 'Metal', 'Punk', 'Gospel', 'Latin',
    'K-Pop', 'Afrobeats', 'Amapiano', 'Other'
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={() => navigate('/dashboard/music')}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-4xl font-bold mb-2">Create Album/EP</h1>
                <p className="text-xl text-white/80">Set up your album and add tracks later</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex items-start space-x-3">
              <InformationCircleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">How it works:</p>
                <p className="text-white/90">
                  1. Create your album/EP details here → 2. Upload individual tracks after creation → 3. Submit for review
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-8">
            {/* Release Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Release Type *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['single', 'ep', 'album'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, releaseType: type }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.releaseType === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <MusicalNoteIcon className={`h-8 w-8 mx-auto mb-2 ${
                        formData.releaseType === type ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <div className="font-semibold capitalize">{type}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {type === 'single' && '1-2 tracks'}
                        {type === 'ep' && '3-6 tracks'}
                        {type === 'album' && '7+ tracks'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.releaseType === 'album' ? 'Album' : formData.releaseType === 'ep' ? 'EP' : 'Single'} Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter album/EP title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Number of Tracks */}
            <div>
              <label htmlFor="numberOfTracks" className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Tracks *
              </label>
              <input
                type="number"
                id="numberOfTracks"
                name="numberOfTracks"
                value={formData.numberOfTracks}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.numberOfTracks ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="How many tracks?"
              />
              {errors.numberOfTracks && <p className="mt-1 text-sm text-red-600">{errors.numberOfTracks}</p>}
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Genre *
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.genre ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
            </div>

            {/* Release Date */}
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="inline h-5 w-5 mr-1" />
                Release Date *
              </label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.releaseDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.releaseDate && <p className="mt-1 text-sm text-red-600">{errors.releaseDate}</p>}
              <p className="mt-2 text-sm text-gray-600">
                <SparklesIcon className="inline h-4 w-4 mr-1 text-purple-500" />
                You can schedule this for a future date!
              </p>
            </div>

            {/* Cover Art */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PhotoIcon className="inline h-5 w-5 mr-1" />
                Cover Art (Optional - can add later)
              </label>
              <div className="mt-2 flex items-center space-x-4">
                {formData.coverArtPreview ? (
                  <div className="relative">
                    <img
                      src={formData.coverArtPreview}
                      alt="Cover preview"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverArt: null, coverArtPreview: null }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-2">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverArtChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="flex-1 text-sm text-gray-600">
                  <p className="font-medium mb-1">Recommended: 3000x3000px</p>
                  <p>JPG or PNG, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us about this album/EP..."
              />
            </div>

            {/* Explicit Content */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isExplicit"
                name="isExplicit"
                checked={formData.isExplicit}
                onChange={handleChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isExplicit" className="ml-3 text-sm font-medium text-gray-700">
                This album contains explicit content
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard/music')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Album/EP'}
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && createdAlbum && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative animate-in fade-in duration-300">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.releaseType.charAt(0).toUpperCase() + formData.releaseType.slice(1)} Created! 🎉
                </h3>
                <p className="text-gray-600 mb-4">
                  Your {formData.releaseType} "{formData.title}" has been created successfully.
                </p>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                  <p className="text-purple-700 text-sm">
                    <strong>Next Step:</strong> Upload {formData.numberOfTracks} track(s) to complete this {formData.releaseType}.
                  </p>
                </div>

                {formData.releaseDate && new Date(formData.releaseDate) > new Date() && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      📅 <strong>Scheduled for:</strong> {new Date(formData.releaseDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddTracks}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  <MusicalNoteIcon className="w-5 h-5 mr-2" />
                  Upload Tracks Now
                </button>
                <button
                  onClick={handleSuccessModalClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateAlbumPage;
