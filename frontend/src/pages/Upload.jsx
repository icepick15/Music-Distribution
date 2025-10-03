import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  InformationCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  FolderOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const Upload = () => {
  const { user, apiCall, triggerDataRefresh } = useAuth();
  const { canUpload, remainingUploads, consumeUpload, subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Album integration
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  
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
  
  // Audio preview state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'processing', 'complete'
  
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
    
    // Fetch user's albums (for yearly subscribers)
    if (subscription?.subscription_type === 'yearly') {
      fetchAlbums();
    }
    
    // Check if coming from album creation
    if (location.state?.albumId) {
      setSelectedAlbum(location.state.albumId);
      toast.success('Now upload tracks for your album!');
    }
  }, [subscription]);

  // Fetch user's albums
  const fetchAlbums = async () => {
    setAlbumsLoading(true);
    try {
      const data = await apiCall('/songs/albums/?status=draft,in_progress');
      setAlbums(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setAlbumsLoading(false);
    }
  };

  // Audio player controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
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
      
      // Create preview URLs
      if (fileType === 'audio_file') {
        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl);
        }
        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Auto-fill title from filename if empty
        if (!formData.title) {
          const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
          setFormData(prev => ({ ...prev, title: fileName }));
        }
      } else if (fileType === 'cover_image') {
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      }
      
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

  // Step validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Files validation
      if (!files.audio_file) newErrors.audio_file = 'Audio file is required';
      if (!files.cover_image) newErrors.cover_image = 'Cover image is required';
      
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
    } else if (step === 2) {
      // Basic info validation
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.genre) newErrors.genre = 'Genre is required';
      
      // Album-specific validation
      if (selectedAlbum && !formData.track_number) {
        newErrors.track_number = 'Track number is required for album tracks';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    return validateStep(1) && validateStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please complete all required fields');
      return;
    }
    
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
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          uploadData.append(key, formData[key]);
        }
      });
      
      // Add files
      uploadData.append('audio_file', files.audio_file);
      uploadData.append('cover_image', files.cover_image);
      
      // If uploading to an album, add album_id
      if (selectedAlbum) {
        uploadData.append('album_id', selectedAlbum);
      }
      
      // Simulate upload progress (since we can't track real progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await apiCall('/songs/songs/', {
        method: 'POST',
        body: uploadData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary
        }
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('processing');
      
      // If uploaded to album, link the track
      if (selectedAlbum && response.id) {
        try {
          await apiCall(`/songs/albums/${selectedAlbum}/add_track/`, {
            method: 'POST',
            body: JSON.stringify({
              song_id: response.id,
              track_number: formData.track_number || 1
            })
          });
        } catch (albumError) {
          console.error('Failed to link track to album:', albumError);
          toast.error('Track uploaded but failed to link to album');
        }
      }
      
      // Consume upload credit after successful upload (only for pay-per-song subscriptions)
      if (subscription?.subscription_type === 'pay_per_song') {
        const creditConsumed = await consumeUpload();
        if (!creditConsumed) {
          console.warn('Failed to consume upload credit, but upload was successful');
        }
      }
      
      setUploadStatus('complete');
      
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
      
      // Delay redirect to show completion
      setTimeout(() => {
        navigate('/dashboard/music', { 
          state: { 
            message: 'Song uploaded successfully!',
            songId: response.id 
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      setUploadStatus('');
      setUploadProgress(0);
      
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            Upload New Music
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Upload your track and get it distributed to major streaming platforms.</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep === step 
                      ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                      : currentStep > step 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircleSolid className="h-6 w-6" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Upload Files' : step === 2 ? 'Track Info' : 'Review'}
                  </span>
                </div>
                {step < totalSteps && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircleSolid className="h-5 w-5 text-green-500" />
                Subscription Status
              </h3>
              {subscription ? (
                <p className="text-sm text-blue-700 mt-1">
                  {subscription.subscription_type === 'yearly' 
                    ? `🎉 Yearly Premium - Unlimited uploads until ${new Date(subscription.end_date).toLocaleDateString()}`
                    : `💳 Pay per song - ${remainingUploads} upload credits remaining`
                  }
                </p>
              ) : (
                <p className="text-sm text-red-600 mt-1">⚠️ No active subscription</p>
              )}
            </div>
            {!canUpload() && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/subscription')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: File Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Album Selection (for yearly subscribers) */}
              {subscription?.subscription_type === 'yearly' && albums.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FolderOpenIcon className="h-6 w-6 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Add to Album (Optional)</h2>
                  </div>
                  <select
                    value={selectedAlbum || ''}
                    onChange={(e) => setSelectedAlbum(e.target.value || null)}
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Upload as standalone single</option>
                    {albums.map(album => (
                      <option key={album.id} value={album.id}>
                        {album.title} ({album.tracks_uploaded}/{album.number_of_tracks} tracks)
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-purple-600 mt-2">
                    💡 Select an album to automatically organize this track
                  </p>
                </div>
              )}

              {/* File Uploads */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
                  Upload Your Files
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Audio Preview */}
                {audioPreviewUrl && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MusicalNoteIcon className="h-5 w-5 text-blue-600" />
                      Audio Preview
                    </h3>
                    <audio
                      ref={audioRef}
                      src={audioPreviewUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-110"
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-5 w-5" />
                        ) : (
                          <PlayIcon className="h-5 w-5 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div 
                          className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5 text-purple-600" />
                      Cover Art Preview
                    </h3>
                    <div className="relative w-48 h-48 mx-auto">
                      <img
                        src={imagePreviewUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg shadow-lg border-4 border-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Track Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                  Track Details
                </h2>
            
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
                  disabled={subscription?.subscription_type === 'pay_per_song'}
                >
                  <option value="single">Single</option>
                  {subscription?.subscription_type === 'yearly' && (
                    <>
                      <option value="ep">EP</option>
                      <option value="album">Album</option>
                      <option value="compilation">Compilation</option>
                    </>
                  )}
                </select>
                {subscription?.subscription_type === 'pay_per_song' && (
                  <p className="mt-1 text-xs text-blue-600">
                    💡 Upgrade to Yearly Premium to upload EPs and Albums
                  </p>
                )}
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
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Genre & Metadata</h2>
            
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
                  {!genresLoading && Array.isArray(genres) && genres.length > 0 ? (
                    genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))
                  ) : !genresLoading && (
                    <option value="" disabled>No genres available</option>
                  )}
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
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Upload Progress */}
              {loading && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <CloudArrowUpIcon className="h-6 w-6 text-blue-600 animate-bounce" />
                    {uploadStatus === 'uploading' ? 'Uploading Your Track...' : 
                     uploadStatus === 'processing' ? 'Processing...' :
                     uploadStatus === 'complete' ? 'Complete! 🎉' : 'Preparing...'}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="h-full w-full bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 font-medium">
                      {uploadProgress}% Complete
                    </p>
                    {uploadStatus === 'processing' && (
                      <p className="text-center text-xs text-gray-500">
                        Processing your audio file and generating metadata...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Review Summary */}
              {!loading && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircleSolid className="h-6 w-6 text-green-600" />
                    Review Your Submission
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Files */}
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Files</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <MusicalNoteIcon className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{files.audio_file?.name}</p>
                              <p className="text-xs text-gray-500">
                                {files.audio_file ? `${(files.audio_file.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <PhotoIcon className="h-5 w-5 text-purple-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{files.cover_image?.name}</p>
                              <p className="text-xs text-gray-500">
                                {files.cover_image ? `${(files.cover_image.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cover Preview */}
                      {imagePreviewUrl && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cover Art</h3>
                          <img
                            src={imagePreviewUrl}
                            alt="Cover preview"
                            className="w-full max-w-xs rounded-lg shadow-lg border-2 border-gray-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Column - Track Info */}
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Track Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Title:</span>
                            <span className="font-medium text-gray-900">{formData.title}</span>
                          </div>
                          {formData.featured_artists && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Featured Artists:</span>
                              <span className="font-medium text-gray-900">{formData.featured_artists}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Release Type:</span>
                            <span className="font-medium text-gray-900 capitalize">{formData.release_type}</span>
                          </div>
                          {selectedAlbum && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Album:</span>
                              <span className="font-medium text-gray-900">
                                {albums.find(a => a.id === selectedAlbum)?.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Genre & Credits</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Genre:</span>
                            <span className="font-medium text-gray-900">
                              {genres.find(g => g.id === formData.genre)?.name || 'Not selected'}
                            </span>
                          </div>
                          {formData.subgenre && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subgenre:</span>
                              <span className="font-medium text-gray-900">{formData.subgenre}</span>
                            </div>
                          )}
                          {formData.composer && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Composer:</span>
                              <span className="font-medium text-gray-900">{formData.composer}</span>
                            </div>
                          )}
                          {formData.publisher && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Publisher:</span>
                              <span className="font-medium text-gray-900">{formData.publisher}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {subscription?.subscription_type === 'pay_per_song' && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Credits:</span> This upload will use 1 of your {remainingUploads} remaining credits.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Release Settings - Commented out for now */}
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <div>
              {currentStep > 1 && !loading && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                Cancel
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canUpload()}
                  className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all hover:scale-105 ${
                    canUpload()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canUpload()}
                  className={`px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all font-semibold ${
                    canUpload() && !loading
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : canUpload() ? (
                    <>
                      <CloudArrowUpIcon className="h-6 w-6" />
                      <span>Upload Track</span>
                      <SparklesIcon className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="h-5 w-5" />
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
              )}
            </div>
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
