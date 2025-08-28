import { useState, useRef } from "react";
import { Music, FileText, Upload, ArrowRight, ArrowLeft, AlertCircle, X, Play } from "lucide-react";

const ReleaseStep3_LyricsAudio = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const audioInputRef = useRef(null);

  const handleLyricsChange = (e) => {
    setFormData({ ...formData, lyrics: e.target.value });
    if (errors.lyrics) {
      setErrors(prev => ({ ...prev, lyrics: "" }));
    }
  };

  const handleAudioFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        if (file.size <= 50 * 1024 * 1024) { // 50MB limit
          setFormData({ ...formData, audioFile: file });
          if (errors.audioFile) {
            setErrors(prev => ({ ...prev, audioFile: "" }));
          }
        } else {
          setErrors(prev => ({ ...prev, audioFile: "Audio file must be less than 50MB" }));
        }
      } else {
        setErrors(prev => ({ ...prev, audioFile: "Please select a valid audio file" }));
      }
    }
  };

  const removeAudioFile = () => {
    setFormData({ ...formData, audioFile: null });
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.audioFile) {
      newErrors.audioFile = "Please upload an audio file for your release";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Music className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Audio & Lyrics</h2>
        <p className="text-gray-600 text-lg">Upload your track and add lyrics (optional)</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Audio Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Audio File *
          </label>
          
          {!formData.audioFile ? (
            <div 
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-50 ${
                errors.audioFile ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="p-4 bg-purple-100 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Audio File</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop or click to select your track
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Music className="h-4 w-4 mr-2" />
                  MP3, WAV, FLAC, or AAC (max 50MB)
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Music className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.audioFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(formData.audioFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                    <Play className="h-5 w-5" />
                  </button>
                  <button
                    onClick={removeAudioFile}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Change Audio File
                </button>
              </div>
            </div>
          )}

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioFileSelect}
            className="hidden"
          />
          
          {errors.audioFile && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.audioFile}
            </div>
          )}
        </div>

        {/* Lyrics Section */}
        <div className="space-y-4">
          <label htmlFor="lyrics" className="flex items-center text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4 mr-2" />
            Lyrics (Optional)
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            placeholder="Enter your song lyrics here... (optional)"
            value={formData.lyrics}
            onChange={handleLyricsChange}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-vertical"
          />
          <p className="text-sm text-gray-500">
            Adding lyrics helps with music discovery and accessibility
          </p>
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

export default ReleaseStep3_LyricsAudio;
