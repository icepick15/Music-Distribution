import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  StarIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const SubscriptionPage = () => {
  const { user, triggerDataRefresh, apiCall } = useAuth();
  const { fetchSubscription, subscription } = useSubscription();
  const navigate = useNavigate();
  
  // State management
  const [loadingPlan, setLoadingPlan] = useState(null); // Which plan is loading: 'pay_per_song' | 'yearly' | null
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [showManualVerify, setShowManualVerify] = useState(false);
  
  // Refs for tracking payment state
  const pendingPaymentRef = useRef(null); // Stores { reference, plan } when payment is initiated
  const verificationTimerRef = useRef(null);
  const verifyingRef = useRef(false);

  // Subscription data
  const subscriptionType = subscription?.subscription_type || 'free';
  const songCredits = subscription?.remaining_credits || 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verificationTimerRef.current) {
        clearTimeout(verificationTimerRef.current);
      }
    };
  }, []);

  // Auto-verify pending payments on mount
  useEffect(() => {
    const checkPendingPayments = async () => {
      try {
        const response = await apiCall('/payments/verify-pending/', { method: 'POST' });
        if (response && response.verified_count > 0) {
          console.log(`Auto-verified ${response.verified_count} pending payment(s)`);
          await Promise.all([fetchSubscription(), triggerDataRefresh()]);
          toast.success(`${response.verified_count} pending payment(s) verified!`);
        }
      } catch (error) {
        console.error('Auto-check failed:', error);
      }
    };
    
    checkPendingPayments();
  }, []);

  /**
   * Main upgrade handler - initiates payment
   */
  const handleUpgrade = async (plan) => {
    setLoadingPlan(plan);
    setShowManualVerify(false);
    pendingPaymentRef.current = null;

    try {
      // Get pricing
      const pricingData = await apiCall('/payments/pricing/');
      if (!pricingData?.subscriptions?.[plan]) {
        toast.error('Invalid subscription plan');
        setLoadingPlan(null);
        return;
      }

      // Initialize payment
      const paymentData = await apiCall('/payments/subscription/upgrade/', {
        method: 'POST',
        body: JSON.stringify({ subscription_type: plan, auto_renew: true })
      });

      if (!paymentData?.reference || !paymentData?.amount) {
        toast.error('Invalid payment data received');
        setLoadingPlan(null);
        return;
      }

      // Store pending payment info
      pendingPaymentRef.current = { reference: paymentData.reference, plan };

      // Get user email
      const userEmail = user.email || 
                        user.emailAddresses?.[0]?.emailAddress || 
                        user.primaryEmailAddress?.emailAddress || 
                        'user@example.com';

      // Check Paystack is loaded
      if (!window.PaystackPop) {
        toast.error('Payment system not loaded. Please refresh the page.');
        setLoadingPlan(null);
        return;
      }

      // Open Paystack payment modal
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: paymentData.amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: paymentData.reference,
        onSuccess: (transaction) => {
          console.log('✅ Paystack payment successful:', transaction);
          // Start verification immediately
          startPaymentVerification(paymentData.reference, plan);
        },
        onClose: () => {
          console.log('Paystack modal closed');
          // Check if we have a pending payment to verify
          if (pendingPaymentRef.current) {
            console.log('Payment was initiated, showing manual verify option');
            setShowManualVerify(true);
          } else {
            // User cancelled before completing payment
            console.log('Payment cancelled by user');
            setLoadingPlan(null);
            toast.error('Payment cancelled');
          }
        }
      });

      handler.openIframe();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
      setLoadingPlan(null);
      pendingPaymentRef.current = null;
    }
  };

  /**
   * Start payment verification with retries
   */
  const startPaymentVerification = async (reference, plan) => {
    if (verifyingRef.current) {
      console.log('Verification already in progress');
      return;
    }

    verifyingRef.current = true;
    console.log('🔄 Starting payment verification for:', reference);

    try {
      // Wait a moment for backend to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call verification endpoint
      const response = await apiCall('/payments/verify/', {
        method: 'POST',
        body: JSON.stringify({ reference })
      });

      console.log('Verification response:', response);

      if (response?.status === 'success') {
        // Payment verified successfully
        await handleVerificationSuccess(response, plan);
      } else {
        // Verification failed
        console.error('Verification failed:', response);
        setShowManualVerify(true);
        toast.error('Auto-verification failed. Please use manual verification button below.');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setShowManualVerify(true);
      toast.error('Verification failed. Please use manual verification button below.');
    } finally {
      verifyingRef.current = false;
    }
  };

  /**
   * Handle successful verification
   */
  const handleVerificationSuccess = async (response, plan) => {
    console.log('✅ Payment verified successfully!');
    
    // Clear pending payment
    pendingPaymentRef.current = null;
    
    // Refresh subscription data
    await Promise.all([fetchSubscription(), triggerDataRefresh()]);
    
    // Prepare success details
    const songCredits = response.remaining_credits || response.song_credits;
    let planName, benefits;
    
    if (plan === 'yearly') {
      planName = 'Yearly Premium';
      benefits = 'Unlimited uploads for one year';
    } else {
      planName = 'Pay Per Song';
      benefits = `${songCredits} upload credit${songCredits > 1 ? 's' : ''}`;
    }
    
    // Show success
    setSuccessDetails({
      planName,
      benefits,
      subscriptionType: response.subscription_type,
      songCredits
    });
    setShowSuccessModal(true);
    setLoadingPlan(null);
    setShowManualVerify(false);
    
    toast.success('🎉 Payment successful!', { duration: 5000 });
  };

  /**
   * Manual verification - for backup when auto-verification fails
   */
  const handleManualVerification = async () => {
    if (!pendingPaymentRef.current) {
      toast.error('No pending payment found');
      return;
    }

    const { reference, plan } = pendingPaymentRef.current;
    
    toast.loading('Verifying payment...', { id: 'manual-verify' });
    
    try {
      const response = await apiCall('/payments/verify-pending/', {
        method: 'POST'
      });

      if (response && response.verified_count > 0) {
        toast.success('Payment verified!', { id: 'manual-verify' });
        await Promise.all([fetchSubscription(), triggerDataRefresh()]);
        
        // Show success modal
        const songCredits = response.song_credits || subscription?.remaining_credits || 0;
        setSuccessDetails({
          planName: plan === 'yearly' ? 'Yearly Premium' : 'Pay Per Song',
          benefits: plan === 'yearly' ? 'Unlimited uploads for one year' : `${songCredits} upload credits`,
          subscriptionType: plan,
          songCredits
        });
        setShowSuccessModal(true);
        setLoadingPlan(null);
        setShowManualVerify(false);
        pendingPaymentRef.current = null;
      } else {
        toast.error('No pending payments found to verify', { id: 'manual-verify' });
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      toast.error('Verification failed. Please contact support.', { id: 'manual-verify' });
    }
  };

  /**
   * Force refresh account status
   */
  const handleForceRefresh = async () => {
    toast.loading('Refreshing account...', { id: 'refresh' });
    try {
      await Promise.all([fetchSubscription(), triggerDataRefresh()]);
      toast.success('Account refreshed!', { id: 'refresh' });
      setLoadingPlan(null);
      setShowManualVerify(false);
      pendingPaymentRef.current = null;
    } catch (error) {
      toast.error('Refresh failed', { id: 'refresh' });
    }
  };

  /**
   * Success modal handlers
   */
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    navigate('/dashboard/music', { 
      state: { 
        message: 'Subscription updated successfully! You can now upload songs.',
        type: 'success'
      }
    });
  };

  const handleContinueToUpload = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    navigate('/upload', {
      state: {
        message: 'Subscription updated successfully! You can now upload your music.',
        type: 'success'
      }
    });
  };

  // Plan definitions
  const plans = [
    {
      id: 'pay_per_song',
      name: 'Pay Per Song',
      price: '₦5,000',
      period: 'per upload',
      description: 'Perfect for artists just starting out or releasing occasionally',
      features: [
        'Upload individual songs',
        'Distribute to 100+ platforms',
        'Keep 90% of your royalties',
        'Basic analytics dashboard',
        'Standard processing (3-5 days)',
        'Community support',
        'No subscription commitment'
      ],
      popular: false,
      current: false
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: '₦39,900',
      originalPrice: '₦50,400',
      period: 'per year',
      savings: 'Save ₦10,500',
      description: 'Best value for serious artists and consistent releases',
      features: [
        'Unlimited song uploads',
        'Distribute to 150+ platforms',
        'Keep 95% of your royalties',
        'Advanced analytics & insights',
        'Album & EP creation',
        'Release scheduling',
        'Priority processing (1-2 days)',
        'Pre-order campaigns',
        'Revenue optimization tools',
        'Priority email support',
        'Early access to new features'
      ],
      popular: true,
      current: subscriptionType === 'yearly'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {' '}Music Journey
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From individual songs to unlimited releases. Choose the plan that fits your artistic vision and budget.
            </p>
          </div>

          {/* Current Status */}
          {subscriptionType !== 'free' && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CreditCardIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">
                      Current Plan: {subscriptionType === 'yearly' ? 'Yearly Premium' : 'Pay Per Song'}
                    </h3>
                    <p className="text-purple-700">
                      {subscriptionType === 'yearly' && subscription?.end_date && 
                        `Unlimited uploads until ${new Date(subscription.end_date).toLocaleDateString()}`}
                      {subscriptionType === 'pay_per_song' && 
                        `${songCredits} upload credits remaining (no expiry)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? 'border-4 border-purple-500' : 'border border-gray-200'
                } ${plan.current ? 'opacity-75' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-bl-2xl font-semibold">
                    <StarIcon className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}

                {/* Current Plan Badge */}
                {plan.current && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-6 py-2 rounded-br-2xl font-semibold">
                    <CheckIcon className="w-4 h-4 inline mr-1" />
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <p className="text-gray-400 line-through text-lg">{plan.originalPrice}</p>
                    )}
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">/ {plan.period}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-green-600 font-semibold mt-2">{plan.savings}</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.current || loadingPlan !== null}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 mb-6 ${
                      plan.current
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : loadingPlan === plan.id
                        ? 'bg-gray-400 text-white cursor-wait'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : plan.current ? (
                      'Current Plan'
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </button>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Manual Verification Section */}
          {showManualVerify && (
            <div className="mb-8 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  ⚠️ Payment Verification Needed
                </h3>
                <p className="text-yellow-800 mb-4">
                  We detected your payment but auto-verification is taking longer than expected. 
                  Please click below to manually verify your payment.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleManualVerification}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🔍 Verify Payment Now
                  </button>
                  <button
                    onClick={handleForceRefresh}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🔄 Refresh Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions for Pay Per Song */}
          {subscriptionType === 'pay_per_song' && !loadingPlan && (
            <div className="mt-12 text-center">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 max-w-md mx-auto">
                <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold text-indigo-900 mb-2">Need more upload credits?</h3>
                <p className="text-indigo-700 mb-4">
                  You have {songCredits} credits remaining
                </p>
                <button
                  onClick={() => handleUpgrade('pay_per_song')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Buy More Credits
                </button>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I switch between plans?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade to yearly anytime or switch to pay-per-song when your yearly subscription ends.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you take a cut of my royalties?
                </h3>
                <p className="text-gray-600">
                  We take a small commission (5-10%) to maintain our platform and provide ongoing support. Premium users keep more!
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What platforms do you distribute to?
                </h3>
                <p className="text-gray-600">
                  Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal, and 100+ more platforms worldwide.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How long does distribution take?
                </h3>
                <p className="text-gray-600">
                  Pay-per-song: 3-5 business days. Yearly Premium: 1-2 business days with priority processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && successDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative animate-in fade-in duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Your subscription has been activated successfully.
              </p>
              
              {/* Plan Details */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-purple-900 mb-2">
                  {successDetails.planName}
                </h4>
                <p className="text-purple-700 text-lg font-medium">
                  ✨ {successDetails.benefits}
                </p>
                {successDetails.subscriptionType === 'yearly' && (
                  <p className="text-purple-600 text-sm mt-2">
                    🚀 Unlimited uploads until {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinueToUpload}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center"
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Start Uploading Now
              </button>
              <button
                onClick={handleSuccessModalClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubscriptionPage;
