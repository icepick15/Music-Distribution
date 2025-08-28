import { useState, useRef } from "react";
import { Palette, Upload, Image, ArrowRight, ArrowLeft, AlertCircle, X } from "lucide-react";

const genres = [
  "Afrobeats",
  "Hip-Hop/Rap",
  "R&B/Soul",
  "Pop",
  "Dance",
  "Electronic",
  "Reggae",
  "Classical",
  "Rock",
  "Jazz",
  "Country",
  "Folk",
  "Blues",
  "Indie",
  "Alternative"
];

const ReleaseStep2_GenreArtwork = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleGenreChange = (e) => {
    setFormData({ ...formData, genre: e.target.value });
    if (errors.genre) {
      setErrors(prev => ({ ...prev, genre: "" }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData({
            ...formData,
            artwork: file,
            artworkPreview: e.target.result
          });
        };
        reader.readAsDataURL(file);
        if (errors.artwork) {
          setErrors(prev => ({ ...prev, artwork: "" }));
        }
      } else {
        setErrors(prev => ({ ...prev, artwork: "Please select a valid image file" }));
      }
    }
  };

  const removeArtwork = () => {
    setFormData({
      ...formData,
      artwork: null,
      artworkPreview: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.genre) {
      newErrors.genre = "Please select a genre";
    }
    if (!formData.artwork) {
      newErrors.artwork = "Please upload artwork for your release";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Palette className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Genre & Artwork</h2>
        <p className="text-gray-600 text-lg">Choose your genre and upload cover art</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Genre Selection */}
        <div className="space-y-4">
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
            Select Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleGenreChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
              errors.genre ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">Choose a genre</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          {errors.genre && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.genre}
            </div>
          )}
        </div>

        {/* Artwork Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Cover Artwork
          </label>
          
          {!formData.artworkPreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 ${
                errors.artwork ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="p-4 bg-purple-100 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Cover Art</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop or click to select your artwork
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Image className="h-4 w-4 mr-2" />
                  JPG, PNG, or GIF (max 10MB) • Recommended: 3000x3000px
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square w-64 mx-auto rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={formData.artworkPreview} 
                  alt="Cover artwork preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={removeArtwork}
                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="text-center mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Change Artwork
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {errors.artwork && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.artwork}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-lg group"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default ReleaseStep2_GenreArtwork;
