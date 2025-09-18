import { Shield, ArrowLeft, Home, LogIn, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Shield Icon with Animation */}
        <div className="relative mb-8">
          <div className="text-[8rem] md:text-[12rem] font-bold text-white/10 leading-none">
            401
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="h-16 w-16 text-red-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400 mr-3" />
            <h1 className="text-3xl md:text-5xl font-bold">
              Access Denied
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8">
            You don't have permission to access this page.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <p className="text-lg text-white/70 mb-4">
              This page requires authentication or special permissions.
            </p>
            <ul className="text-sm text-white/60 space-y-2 text-left max-w-md mx-auto">
              <li>• Make sure you're signed in to your account</li>
              <li>• Check if your subscription includes access to this feature</li>
              <li>• Contact support if you believe this is an error</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/sign-in")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-white text-red-900 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/contact-us")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 text-sm"
              >
                <h4 className="font-medium text-white mb-2">Contact Support</h4>
                <p className="text-white/60">Get help from our support team</p>
              </button>
              
              <button
                onClick={() => navigate("/help-center")}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 text-sm"
              >
                <h4 className="font-medium text-white mb-2">Help Center</h4>
                <p className="text-white/60">Browse our documentation</p>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-white/50 mt-8">
            <p>Error Code: 401 - Unauthorized Access</p>
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-xl opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full blur-xl opacity-20"></div>
      </div>
    </div>
  );
};

export default Unauthorized;
