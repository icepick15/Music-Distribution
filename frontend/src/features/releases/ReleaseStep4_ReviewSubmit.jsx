import { Eye, Music, Palette, FileText, Calendar, User, ArrowRight, ArrowLeft, Edit } from "lucide-react";

const ReleaseStep4_ReviewSubmit = ({ formData, nextStep, prevStep }) => {
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
          <Eye className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Release</h2>
        <p className="text-gray-600 text-lg">Check all details before submitting</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Release Title</label>
              <p className="text-gray-900 font-medium">{formData.releaseTitle || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Artist Name</label>
              <p className="text-gray-900 font-medium">{formData.artistName || "Not provided"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Release Date</label>
              <p className="text-gray-900 font-medium">
                {formData.releaseDate ? new Date(formData.releaseDate).toLocaleDateString() : "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Genre & Artwork */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Genre & Artwork</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Genre</label>
              <p className="text-gray-900 font-medium">{formData.genre || "Not selected"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Cover Artwork</label>
              {formData.artworkPreview ? (
                <div className="w-32 h-32 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={formData.artworkPreview} 
                    alt="Cover artwork"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No artwork</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio & Lyrics */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Music className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Audio & Lyrics</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Audio File</label>
              {formData.audioFile ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Music className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formData.audioFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(formData.audioFile.size)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No audio file uploaded</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Lyrics</label>
              {formData.lyrics ? (
                <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">{formData.lyrics}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No lyrics added</p>
              )}
            </div>
          </div>
        </div>

        {/* Warning if missing required fields */}
        {(!formData.releaseTitle || !formData.artistName || !formData.releaseDate || !formData.genre || !formData.artwork || !formData.audioFile) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Missing Required Information</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please complete all required fields before submitting:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {!formData.releaseTitle && <li>Release title</li>}
                    {!formData.artistName && <li>Artist name</li>}
                    {!formData.releaseDate && <li>Release date</li>}
                    {!formData.genre && <li>Genre selection</li>}
                    {!formData.artwork && <li>Cover artwork</li>}
                    {!formData.audioFile && <li>Audio file</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Edit
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!formData.releaseTitle || !formData.artistName || !formData.releaseDate || !formData.genre || !formData.artwork || !formData.audioFile}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Submit
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default ReleaseStep4_ReviewSubmit;
