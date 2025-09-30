import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
  MusicalNoteIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Upload = () => {
  const { user, apiCall, triggerDataRefresh } = useAuth();
  const { canUpload, remainingUploads, consumeUpload, subscription } = useSubscription();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    featured_artists: '',
    release_type: 'single',
    album_title: '',
    track_number: '',
    genre: '',
    subgenre: '',
    composer: '',
    publisher: '',
    price: '0.99',
    is_explicit: false,
    release_date: ''
  });
  
  const [files, setFiles] = useState({
  audio_file: null,
  cover_image: null
  });
  
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState({ audio_file: false, cover_image: false });

  useEffect(() => {
    // Fetch available genres
    const fetchGenres = async () => {
      setGenresLoading(true);
      try {
        const data = await apiCall('/songs/genres/');
        // Normalize API response to an array
        let genresArray = [];
        if (Array.isArray(data)) {
          genresArray = data;
        } else if (data && Array.isArray(data.results)) {
          genresArray = data.results;
        } else if (data && Array.isArray(data.data)) {
          genresArray = data.data;
        }
        console.log('Loaded genres:', genresArray);
        setGenres(genresArray);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        // Set default genres if API fails
        setGenres([
          { id: 1, name: 'Pop' },
          { id: 2, name: 'Hip-Hop' },
          { id: 3, name: 'R&B' },
          { id: 4, name: 'Afrobeats' },
          { id: 5, name: 'Rock' },
          { id: 6, name: 'Electronic' },
          { id: 7, name: 'Jazz' },
          { id: 8, name: 'Classical' }
        ]);
      } finally {
        setGenresLoading(false);
      }
  };

  fetchGenres();
  }, []);

  const handleInputChange = (e) => {
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

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fileType]: file }));
      // Clear error when file is selected
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };

  const handleDrag = (e, fileType, isDragActive) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: isDragActive }));
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: false }));
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [fileType]: droppedFiles[0] }));
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!files.audio_file) newErrors.audio_file = 'Audio file is required';
    if (!files.cover_image) newErrors.cover_image = 'Cover image is required';
    if (!formData.genre) newErrors.genre = 'Genre is required';
    
    // File validations
    if (files.audio_file) {
      const audioExtensions = ['mp3', 'wav', 'flac', 'm4a'];
      const audioExt = files.audio_file.name.split('.').pop().toLowerCase();
      if (!audioExtensions.includes(audioExt)) {
        newErrors.audio_file = 'Invalid audio format. Use MP3, WAV, FLAC, or M4A';
      }
      if (files.audio_file.size > 100 * 1024 * 1024) { // 100MB
        newErrors.audio_file = 'Audio file too large. Maximum size is 100MB';
      }
    }
    
    if (files.cover_image) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const imageExt = files.cover_image.name.split('.').pop().toLowerCase();
      if (!imageExtensions.includes(imageExt)) {
        newErrors.cover_image = 'Invalid image format. Use JPG, PNG, or WebP';
      }
      if (files.cover_image.size > 10 * 1024 * 1024) { // 10MB
        newErrors.cover_image = 'Image file too large. Maximum size is 10MB';
      }
    }
    
    // Price validation
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      newErrors.price = 'Price must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check subscription status before upload
    if (!canUpload()) {
      setErrors({ 
        submit: subscription?.subscription_type === 'yearly' 
          ? 'Your yearly subscription has expired. Please renew to continue uploading.'
          : `You have ${remainingUploads} upload credits remaining. Please purchase more credits to upload.`
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      // Debug: Log form data before sending
      console.log('Form data to send:', formData);
      console.log('Genre value:', formData.genre, 'type:', typeof formData.genre);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          // For genre, send the UUID string directly (no conversion needed)
          console.log(`Adding ${key}:`, formData[key], 'type:', typeof formData[key]);
          uploadData.append(key, formData[key]);
        }
      });
      
      // Add files
      uploadData.append('audio_file', files.audio_file);
      uploadData.append('cover_image', files.cover_image);
      
      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of uploadData.entries()) {
        console.log(key, value, typeof value);
      }
      
      const response = await apiCall('/songs/', {
        method: 'POST',
        body: uploadData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary
        }
      });
      
      console.log('Upload response:', response);
      console.log('Response type:', typeof response);
      console.log('Response ID:', response?.id);
      
      // Consume upload credit after successful upload (only for pay-per-song subscriptions)
      if (subscription?.subscription_type === 'pay_per_song') {
        const creditConsumed = await consumeUpload();
        if (!creditConsumed) {
          console.warn('Failed to consume upload credit, but upload was successful');
        }
      }
      
      // Success toast
      toast.success('🎵 Song uploaded successfully!', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      
      // Trigger data refresh for dashboard components
      triggerDataRefresh();
      
      // Success - redirect to song detail or dashboard
      navigate('/dashboard/music', { 
        state: { 
          message: 'Song uploaded successfully!',
          songId: response.id 
        }
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      // Check authentication status
      const authToken = localStorage.getItem('authToken');
      console.error('Authentication debug:', {
        hasToken: !!authToken,
        tokenLength: authToken ? authToken.length : 0,
        userState: user,
        isSignedIn: !!user
      });
      
      toast.error(`Upload failed: ${error.message || 'Please try again.'}`, {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      setErrors({ submit: error.message || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const FileUploadArea = ({ fileType, accept, title, description, icon: Icon }) => (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors ${
        dragActive[fileType] 
          ? 'border-blue-400 bg-blue-50' 
          : files[fileType] 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300'
      } ${errors[fileType] ? 'border-red-400 bg-red-50' : ''}`}
      onDragEnter={(e) => handleDrag(e, fileType, true)}
      onDragLeave={(e) => handleDrag(e, fileType, false)}
      onDragOver={(e) => handleDrag(e, fileType, true)}
      onDrop={(e) => handleDrop(e, fileType)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e, fileType)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="space-y-2">
        {files[fileType] ? (
          <CheckCircleIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-green-500" />
        ) : (
          <Icon className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 ${errors[fileType] ? 'text-red-400' : 'text-gray-400'}`} />
        )}
        
        <div>
          <p className={`text-xs sm:text-sm font-medium ${files[fileType] ? 'text-green-700' : errors[fileType] ? 'text-red-700' : 'text-gray-900'}`}>
            {files[fileType] ? files[fileType].name : title}
          </p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        
        {files[fileType] && (
          <p className="text-xs text-green-600">
            Size: {(files[fileType].size / (1024 * 1024)).toFixed(2)} MB
          </p>
        )}
      </div>
      
      {errors[fileType] && (
        <p className="mt-2 text-xs sm:text-sm text-red-600">{errors[fileType]}</p>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload New Music</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload your track and get it distributed to major streaming platforms.</p>
        </div>

        {/* Subscription Status */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Subscription Status</h3>
              {subscription ? (
                <p className="text-xs sm:text-sm text-blue-700">
                  {subscription.subscription_type === 'yearly' 
                    ? `Yearly subscription - Unlimited uploads until ${new Date(subscription.end_date).toLocaleDateString()}`
                    : `Pay per song - ${remainingUploads} upload credits remaining`
                  }
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-blue-700">No active subscription</p>
              )}
            </div>
            {!canUpload() && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/subscription')}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* File Uploads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Files</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File *
                </label>
                <FileUploadArea
                  fileType="audio_file"
                  accept=".mp3,.wav,.flac,.m4a"
                  title="Click or drag audio file here"
                  description="MP3, WAV, FLAC, M4A (max 100MB)"
                  icon={MusicalNoteIcon}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image *
                </label>
                <FileUploadArea
                  fileType="cover_image"
                  accept=".jpg,.jpeg,.png,.webp"
                  title="Click or drag cover image here"
                  description="JPG, PNG, WebP (min 1400x1400px, max 10MB)"
                  icon={PhotoIcon}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                    errors.title ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="Enter your track title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="featured_artists" className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Artists
                </label>
                <input
                  type="text"
                  id="featured_artists"
                  name="featured_artists"
                  value={formData.featured_artists}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. John Doe, Jane Smith"
                />
              </div>
              
              <div>
                <label htmlFor="release_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Type
                </label>
                <select
                  id="release_type"
                  name="release_type"
                  value={formData.release_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                  <option value="compilation">Compilation</option>
                </select>
              </div>
              
              {formData.release_type !== 'single' && (
                <>
                  <div>
                    <label htmlFor="album_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Album/EP Title
                    </label>
                    <input
                      type="text"
                      id="album_title"
                      name="album_title"
                      value={formData.album_title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter album or EP title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="track_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Track Number
                    </label>
                    <input
                      type="number"
                      id="track_number"
                      name="track_number"
                      value={formData.track_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Genre & Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Genre & Metadata</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.genre ? 'border-red-400' : 'border-gray-300'
                  }`}
                  disabled={genresLoading}
                >
                  <option value="">{genresLoading ? 'Loading genres...' : 'Select a genre'}</option>
                  {!genresLoading && Array.isArray(genres) ? genres.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  )) : null}
                </select>
                {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
              </div>
              
              <div>
                <label htmlFor="subgenre" className="block text-sm font-medium text-gray-700 mb-2">
                  Subgenre
                </label>
                <input
                  type="text"
                  id="subgenre"
                  name="subgenre"
                  value={formData.subgenre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Trap, Alternative"
                />
              </div>
              
              <div>
                <label htmlFor="composer" className="block text-sm font-medium text-gray-700 mb-2">
                  Composer
                </label>
                <input
                  type="text"
                  id="composer"
                  name="composer"
                  value={formData.composer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Who composed this track?"
                />
              </div>
              
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Publishing company"
                />
              </div>
            </div>
          </div>

          {/* Release Settings */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Release Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₦)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="0.99"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              
              <div>
                <label htmlFor="release_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  id="release_date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_explicit"
                  name="is_explicit"
                  checked={formData.is_explicit}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_explicit" className="ml-2 block text-sm text-gray-700">
                  Explicit Content
                </label>
              </div>
            </div>
          </div> */}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canUpload()}
              className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 ${
                canUpload() && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : canUpload() ? (
                <>
                  <CloudArrowUpIcon className="h-5 w-5" />
                  <span>Upload Track</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-5 w-5" />
                  <span>
                    {!subscription 
                      ? 'Subscription Required'
                      : subscription.subscription_type === 'yearly'
                        ? 'Subscription Expired'
                        : 'No Upload Credits'
                    }
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Upload Guidelines</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Audio files should be high quality (320kbps MP3 or WAV recommended)</li>
                  <li>Cover art must be at least 1400x1400 pixels for optimal quality</li>
                  <li>Your track will be reviewed before distribution to streaming platforms</li>
                  <li>Distribution typically takes 1-7 business days after approval</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </DashboardLayout>
  );
};

export default Upload;
