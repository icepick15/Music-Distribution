import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlayIcon, 
  MusicalNoteIcon, 
  GlobeAltIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ModernHero = () => {
  const { isSignedIn } = useAuth();
  const [currentPlatform, setCurrentPlatform] = useState(0);
  
  const platforms = [
    { name: "Spotify", color: "text-green-500", users: "500M+" },
    { name: "Apple Music", color: "text-gray-900", users: "100M+" },
    { name: "YouTube Music", color: "text-red-500", users: "80M+" },
    { name: "Amazon Music", color: "text-blue-500", users: "75M+" },
    { name: "Tidal", color: "text-blue-400", users: "5M+" },
    { name: "Deezer", color: "text-orange-500", users: "16M+" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [platforms.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] sm:min-h-[80vh]">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Trusted by 10,000+ Artists</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
              Distribute Your Music
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Globally in Minutes
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              Reach millions of listeners worldwide. Get your music on all major streaming platforms 
              with our simple, fast, and affordable distribution service.
            </p>

            {/* Platform Counter */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3 flex-wrap">
                <GlobeAltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-sm sm:text-base text-gray-300">Now distributing to</span>
                <span className={`font-bold text-sm sm:text-base ${platforms[currentPlatform].color} transition-colors duration-500`}>
                  {platforms[currentPlatform].name}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">({platforms[currentPlatform].users} users)</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-400 text-center lg:text-left">
                + 150 other streaming platforms worldwide
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              {isSignedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  
                  <Link
                    to="/upload"
                    className="group bg-white/10 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2"
                  >
                    <MusicalNoteIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Upload Music</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Start Distributing Now</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  
                  <Link
                    to="/pricing"
                    className="group bg-white/10 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>View Plans</span>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">150+</div>
                <div className="text-xs sm:text-sm text-gray-400">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">10K+</div>
                <div className="text-xs sm:text-sm text-gray-400">Artists</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">1M+</div>
                <div className="text-xs sm:text-sm text-gray-400">Songs Distributed</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Elements */}
          <div className="relative">
            {/* Main Visual */}
            <div className="relative">
              {/* Large Album Art Mockup */}
              <div className="w-80 h-80 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                <div className="w-full h-full bg-gray-900 rounded-3xl flex items-center justify-center">
                  <MusicalNoteIcon className="w-32 h-32 text-white/50" />
                </div>
              </div>

              {/* Floating Platform Cards */}
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MusicalNoteIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white font-medium">Spotify</div>
                    <div className="text-xs text-gray-400">Connected</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-xs text-white font-medium">Analytics</div>
                    <div className="text-xs text-gray-400">Real-time</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">$2,847</div>
                  <div className="text-xs text-gray-400">This Month</div>
                </div>
              </div>

              {/* Animated Pulse Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 border border-white/10 rounded-full animate-ping"></div>
                <div className="absolute w-80 h-80 border border-white/20 rounded-full animate-ping delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default ModernHero;
