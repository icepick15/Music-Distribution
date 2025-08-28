import { Send, CheckCircle, ArrowLeft, Sparkles, Music, Clock } from "lucide-react";
import { useState } from "react";

const ReleaseStep5_Review = ({ formData, prevStep, handleSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit();
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Release Submitted!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Your music release "{formData.releaseTitle}" has been successfully submitted for review.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">What's Next?</span>
            </div>
            <ul className="text-sm text-green-700 space-y-2 text-left">
              <li>• Review process: 2-3 business days</li>
              <li>• Distribution to platforms: 5-7 days</li>
              <li>• You'll receive email updates</li>
            </ul>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/music'}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-lg"
        >
          <Music className="mr-2 h-5 w-5" />
          Back to Music Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
          <Send className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Release</h2>
        <p className="text-gray-600 text-lg">Ready to share your music with the world?</p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Quick Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Release Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium text-gray-900">{formData.releaseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Artist:</span>
              <span className="font-medium text-gray-900">{formData.artistName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Genre:</span>
              <span className="font-medium text-gray-900">{formData.genre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Release Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(formData.releaseDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Confirmation */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>I confirm that I own the rights to this music</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>I agree to the distribution terms and conditions</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>I understand the review process may take 2-3 business days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-8 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Review
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              Submit Release
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReleaseStep5_Review;
