// src/components/ReferralBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GiftIcon, 
  XMarkIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

/**
 * Referral promotional banner component
 * Can be shown after uploads, on empty states, or anywhere you want to promote referrals
 */
const ReferralBanner = ({ onDismiss, variant = 'default', className = '' }) => {
  const variants = {
    default: {
      bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
      title: 'Want More Free Uploads?',
      description: 'Invite friends and get 1 free upload credit for every 2 friends who subscribe!',
      buttonText: 'Get Your Referral Link',
      icon: GiftIcon
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      title: '🎉 Upload Successful!',
      description: 'Share your referral link and earn free credits for your next uploads!',
      buttonText: 'Invite Friends Now',
      icon: SparklesIcon
    },
    minimal: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      title: 'Earn Free Credits',
      description: 'Get 1 free upload for every 2 paid referrals',
      buttonText: 'Start Referring',
      icon: UserGroupIcon
    }
  };

  const config = variants[variant] || variants.default;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-6 relative">
        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-2">
              {config.title}
            </h3>
            <p className="text-white/90 text-sm mb-4 max-w-2xl">
              {config.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard/referrals"
                className="inline-flex items-center px-5 py-2.5 bg-white text-purple-600 hover:text-purple-700 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                {config.buttonText}
              </Link>
              <Link
                to="/dashboard/referrals"
                className="text-white/90 hover:text-white text-sm underline"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      </div>
    </div>
  );
};

export default ReferralBanner;
