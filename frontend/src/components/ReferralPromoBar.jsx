import { useState } from 'react';
import { GiftIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ReferralPromoBar = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 overflow-hidden">
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
              <GiftIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm sm:text-base flex items-center flex-wrap gap-2">
                <span>Got a referral code?</span>
                <SparklesIcon className="h-4 w-4 animate-pulse inline" />
                <span className="text-white/90 font-normal">Enter it during signup to unlock bonuses!</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/register"
              className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign Up Now
            </Link>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default ReferralPromoBar;
