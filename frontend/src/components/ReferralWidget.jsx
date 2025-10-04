// src/components/ReferralWidget.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserGroupIcon,
  GiftIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ReferralWidget = ({ compact = false }) => {
  const { apiCall } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const [statsResponse, creditsResponse, myCodeResponse] = await Promise.all([
          apiCall('/referrals/codes/stats/'),
          apiCall('/referrals/credits/'),
          apiCall('/referrals/codes/my_code/')
        ]);

        setReferralData({
          stats: statsResponse,
          credits: creditsResponse,
          code: myCodeResponse
        });
      } catch (error) {
        console.error('Failed to fetch referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [apiCall]);

  const handleCopyLink = () => {
    if (referralData?.code?.referral_url) {
      navigator.clipboard.writeText(referralData.code.referral_url);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-purple-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-purple-100 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-purple-200 rounded"></div>
      </div>
    );
  }

  if (!referralData) {
    return null;
  }

  const totalReferrals = referralData.stats?.total_referrals || 0;
  const paidReferrals = referralData.stats?.paid_referrals || 0;
  const creditsEarned = referralData.credits?.total_credits || 0;
  const creditsUsed = referralData.credits?.used_credits || 0;
  const creditsAvailable = creditsEarned - creditsUsed;
  const progress = referralData.stats?.next_credit_progress || 0;

  // Compact version for sidebar or smaller spaces
  if (compact) {
    return (
      <Link
        to="/dashboard/referrals"
        className="block bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <GiftIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-semibold text-purple-900">Earn Free Credits</h3>
          </div>
          {creditsAvailable > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {creditsAvailable}
            </span>
          )}
        </div>
        <p className="text-xs text-purple-700 mb-2">
          {totalReferrals > 0 
            ? `${totalReferrals} friend${totalReferrals !== 1 ? 's' : ''} joined`
            : 'Invite friends, get free uploads'
          }
        </p>
        {progress > 0 && (
          <div className="bg-white rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </Link>
    );
  }

  // Full widget version for dashboard
  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-xl border border-purple-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-purple-600 rounded-lg p-2 mr-3">
            <GiftIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900">Referral Program</h3>
            <p className="text-sm text-purple-700">Earn free upload credits</p>
          </div>
        </div>
        {creditsAvailable > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <SparklesIcon className="h-4 w-4" />
              <span className="font-bold">{creditsAvailable}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <UserGroupIcon className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{totalReferrals}</p>
          <p className="text-xs text-gray-600">Referrals</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <CheckIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{paidReferrals}</p>
          <p className="text-xs text-gray-600">Paid</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <SparklesIcon className="h-5 w-5 text-pink-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{creditsEarned}</p>
          <p className="text-xs text-gray-600">Credits</p>
        </div>
      </div>

      {/* Progress to Next Credit */}
      {progress < 100 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
            <span>Next free credit</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="bg-white rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              {progress > 20 && (
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              )}
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            {2 - (paidReferrals % 2)} more paid referral{(2 - (paidReferrals % 2)) !== 1 ? 's' : ''} needed
          </p>
        </div>
      )}

      {/* Quick Copy Link */}
      <div className="bg-white rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-2 font-medium">Your Referral Link</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={referralData.code?.referral_url || ''}
            className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 truncate"
          />
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded transition-colors"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <ClipboardDocumentIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to="/dashboard/referrals"
        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
      >
        <span className="flex items-center justify-center">
          View Full Dashboard
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </span>
      </Link>

      {/* How It Works */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-purple-700 font-medium mb-2">How it works:</p>
        <ul className="text-xs text-purple-600 space-y-1">
          <li className="flex items-start">
            <span className="text-purple-400 mr-1">1.</span>
            <span>Share your referral link</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-1">2.</span>
            <span>Friends sign up and make a purchase</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-1">3.</span>
            <span>Get 1 free credit for every 2 paid referrals</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralWidget;
