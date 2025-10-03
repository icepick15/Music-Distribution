import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { StarIcon, XMarkIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SubscriptionGuard = ({ children, requiredPlan = 'yearly', featureName }) => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subscriptionType = subscription?.subscription_type || 'free';
  const hasAccess = subscriptionType === 'yearly';

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    toast.loading('Redirecting to subscription page...', { duration: 1000 });
    setTimeout(() => {
      navigate('/dashboard/subscription');
    }, 1000);
  };

  if (!hasAccess) {
    return (
      <>
        <div onClick={() => setShowUpgradeModal(true)}>
          {children}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative animate-in fade-in duration-300">
              {/* Close Button */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>

              {/* Premium Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <StarIcon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Premium Feature 🎵
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  {featureName || 'This feature'} is available exclusively for <span className="font-semibold text-purple-600">Yearly Premium</span> subscribers.
                </p>

                {/* Features List */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 text-left">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Unlock with Yearly Premium:
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700"><strong>Unlimited uploads</strong> for an entire year</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700"><strong>Create Albums & EPs</strong> with multiple tracks</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700"><strong>Schedule future releases</strong> in advance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700"><strong>Priority distribution</strong> (1-2 days)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700"><strong>Keep 95% of royalties</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUpgradeClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <StarIcon className="w-5 h-5 mr-2" />
                  Upgrade to Yearly Premium
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Has access - render children normally (clickable)
  return <>{children}</>;
};

export default SubscriptionGuard;
