import { useState } from "react";
import { Music, Calendar, User, ArrowRight, AlertCircle } from "lucide-react";

const ReleaseStep1_Info = ({ formData, setFormData, nextStep }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.releaseTitle.trim()) {
      newErrors.releaseTitle = "Release title is required";
    }
    if (!formData.artistName.trim()) {
      newErrors.artistName = "Artist name is required";
    }
    if (!formData.releaseDate) {
      newErrors.releaseDate = "Release date is required";
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
          <Music className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Release Information</h2>
        <p className="text-gray-600 text-lg">Let's start with the basics of your release</p>
      </div>

      {/* Form Fields */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Release Title */}
        <div className="space-y-2">
          <label htmlFor="releaseTitle" className="flex items-center text-sm font-medium text-gray-700">
            <Music className="h-4 w-4 mr-2" />
            Release Title
          </label>
          <input
            type="text"
            id="releaseTitle"
            name="releaseTitle"
            placeholder="Enter your release title (e.g., 'Midnight Dreams')"
            value={formData.releaseTitle}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
              errors.releaseTitle ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.releaseTitle && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.releaseTitle}
            </div>
          )}
        </div>

        {/* Artist Name */}
        <div className="space-y-2">
          <label htmlFor="artistName" className="flex items-center text-sm font-medium text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Artist Name
          </label>
          <input
            type="text"
            id="artistName"
            name="artistName"
            placeholder="Enter artist or band name"
            value={formData.artistName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
              errors.artistName ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.artistName && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.artistName}
            </div>
          )}
        </div>

        {/* Release Date */}
        <div className="space-y-2">
          <label htmlFor="releaseDate" className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4 mr-2" />
            Release Date
          </label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
              errors.releaseDate ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.releaseDate && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.releaseDate}
            </div>
          )}
          <p className="text-sm text-gray-500">Select when you want your music to be available</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-8 border-t border-gray-100">
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

export default ReleaseStep1_Info;
