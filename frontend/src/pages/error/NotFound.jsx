import { Home, ArrowLeft, Search, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-bold text-white/10 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Music className="h-16 w-16 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8">
            Oops! The page you're looking for seems to have gone off-key.
          </p>
          <p className="text-lg text-white/60 mb-12">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 group"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </button>
            
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center px-6 py-3 bg-white text-purple-900 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
            >
              <Search className="mr-2 h-5 w-5" />
              Dashboard
            </button>
          </div>

          {/* Fun Elements */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-white/60">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li><button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate("/pricing")} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate("/about-us")} className="hover:text-white transition-colors">About Us</button></li>
              </ul>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Support</h3>
              <ul className="space-y-1">
                <li><button onClick={() => navigate("/help-center")} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate("/contact-us")} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigate("/dashboard/tickets")} className="hover:text-white transition-colors">Support Tickets</button></li>
              </ul>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="font-semibold text-white mb-2">Account</h3>
              <ul className="space-y-1">
                <li><button onClick={() => navigate("/login")} className="hover:text-white transition-colors">Sign In</button></li>
                <li><button onClick={() => navigate("/register")} className="hover:text-white transition-colors">Sign Up</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="hover:text-white transition-colors">Dashboard</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-xl opacity-20"></div>
      </div>
    </div>
  );
};

export default NotFound;
