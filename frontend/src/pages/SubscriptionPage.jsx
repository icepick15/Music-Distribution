import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import DashboardLayout from '../components/DashboardLayout';
import ReferralPromoBar from '../components/ReferralPromoBar';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  StarIcon,
  CheckIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const SubscriptionPage = () => {
  const { user, triggerDataRefresh, apiCall } = useAuth();
  const { fetchSubscription, subscription } = useSubscription();
  const navigate = useNavigate();
  
  // State management
  const [loadingPlan, setLoadingPlan] = useState(null); // Which plan is loading: 'pay_per_song' | 'yearly' | null
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelDetails, setCancelDetails] = useState(null);
  const [showManualVerify, setShowManualVerify] = useState(false);
  
  // Refs for tracking payment state
  const pendingPaymentRef = useRef(null); // Stores { reference, plan } when payment is initiated
  const verificationTimerRef = useRef(null);
  const verifyingRef = useRef(false);
  const paymentInitiatedRef = useRef(false); // Tracks if user actually clicked pay button

  // Subscription data
  const subscriptionType = subscription?.subscription_type || 'free';
  const songCredits = subscription?.remaining_credits || 0;

  // Debug: Log cancel modal state changes
  useEffect(() => {
    console.log('🎭 Cancel Modal State:', { showCancelModal, cancelDetails });
  }, [showCancelModal, cancelDetails]);

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
          await Promise.all([fetchSubscription(), triggerDataRefresh()]);
          toast.success(`${response.verified_count} pending payment(s) verified!`);
        }
      } catch (error) {
        // Silent fail - not critical
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
    paymentInitiatedRef.current = false;

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
      console.log('🚀 Setting up Paystack with reference:', paymentData.reference);
      
      // Store reference for callbacks
      const paymentRef = paymentData.reference;
      const paymentPlan = plan;
      
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: paymentData.amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: paymentRef,
        callback: function(response) {
          console.log('✅ Paystack callback fired!', response);
          paymentInitiatedRef.current = true;
          // Payment completed - start verification immediately
          startPaymentVerification(paymentRef, paymentPlan);
        },
        onClose: function() {
          console.log('🚪 Paystack onClose fired!');
          console.log('📦 pendingPaymentRef:', pendingPaymentRef.current);
          console.log('🔒 verifyingRef:', verifyingRef.current);
          
          // Modal closed - check if payment was completed or cancelled
          // Wait 2 seconds to give callback a chance to fire first
          setTimeout(() => {
            console.log('⏰ onClose timeout fired - checking status...');
            console.log('📦 pendingPaymentRef now:', pendingPaymentRef.current);
            console.log('🔒 verifyingRef now:', verifyingRef.current);
            
            if (paymentInitiatedRef.current) {
              // User clicked pay button - either verifying or should poll
              console.log('✅ Payment was initiated by user');
              if (!verifyingRef.current && pendingPaymentRef.current) {
                console.log('🔄 Starting background polling (payment may be pending)...');
                toast('Checking payment status...', {
                  duration: 3000,
                  icon: '🔍'
                });
                startBackgroundPolling(paymentRef, paymentPlan);
              } else {
                console.log('⏭️ Verification already in progress');
              }
            } else {
              // User closed modal without clicking pay - show cancellation
              console.log('❌ Payment cancelled - user never clicked pay button');
              setCancelDetails({
                planName: paymentPlan === 'yearly' ? 'Yearly Premium' : 'Pay Per Song',
                plan: paymentPlan
              });
              setShowCancelModal(true);
              setLoadingPlan(null);
            }
          }, 2000);
        }
      });

      console.log('📱 Opening Paystack iframe...');
      handler.openIframe();
      console.log('✅ Iframe opened - waiting for user to complete payment...');
      
      // FALLBACK: Start delayed polling in case callbacks don't fire
      // This ensures we always check for payment completion
      console.log('⏰ Setting up fallback polling (starts in 30s)...');
      setTimeout(() => {
        console.log('🔍 Fallback check: Is payment still pending?');
        if (pendingPaymentRef.current && !verifyingRef.current) {
          console.log('⚠️ Callbacks did not fire - starting fallback polling');
          startBackgroundPolling(paymentRef, paymentPlan);
        } else {
          console.log('✅ Payment already being processed - fallback not needed');
        }
      }, 30000); // Wait 30 seconds before starting fallback

    } catch (error) {
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
      setLoadingPlan(null);
      pendingPaymentRef.current = null;
    }
  };

  /**
   * Start background polling - only called after modal closes
   */
  const startBackgroundPolling = (reference, plan) => {
    console.log('🔄 startBackgroundPolling called with reference:', reference);
    
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 5 minutes
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`🔍 Background poll attempt ${pollCount}/${maxPolls}`);
      
      // Stop if payment is no longer pending
      if (!pendingPaymentRef.current) {
        console.log('⏹️ Stopping poll - payment no longer pending');
        clearInterval(pollInterval);
        return;
      }
      
      // Stop if max attempts reached
      if (pollCount >= maxPolls) {
        console.log('⚠️ Max poll attempts reached - showing manual verify');
        clearInterval(pollInterval);
        
        // Show cancellation modal instead of manual verify if no payment detected
        setCancelDetails({
          planName: plan === 'yearly' ? 'Yearly Premium' : 'Pay Per Song',
          plan: plan,
          wasPolling: true
        });
        setShowCancelModal(true);
        setLoadingPlan(null);
        return;
      }
      
      try {
        const response = await apiCall('/payments/verify-pending/', {
          method: 'POST'
        });
        
        console.log(`📊 Poll ${pollCount} response:`, response);
        
        if (response && response.verified_count > 0) {
          console.log('✅ Payment verified successfully via polling!');
          clearInterval(pollInterval);
          
          // Refresh subscription data
          await Promise.all([fetchSubscription(), triggerDataRefresh()]);
          
          // Get updated subscription info
          const songCredits = response.song_credits || subscription?.remaining_credits || 0;
          
          // Prepare success response
          const successResponse = {
            status: 'success',
            subscription_type: plan,
            remaining_credits: songCredits,
            song_credits: songCredits
          };
          
          await handleVerificationSuccess(successResponse, plan);
        } else {
          console.log(`⏳ Poll ${pollCount}: Payment still processing...`);
        }
      } catch (error) {
        console.log(`⚠️ Poll ${pollCount} error (will retry):`, error.message);
        // Continue polling silently - errors expected while processing
      }
    }, 10000); // Poll every 10 seconds (reduced frequency)
    
    console.log('✅ Background polling interval started');
    // Store interval ref for cleanup
    verificationTimerRef.current = pollInterval;
  };

  /**
   * Start payment verification with polling and retries
   * Called immediately from onSuccess callback
   */
  const startPaymentVerification = async (reference, plan, retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds between retries
    
    console.log(`🔄 startPaymentVerification attempt ${retryCount + 1}/${maxRetries}`);
    
    if (verifyingRef.current && retryCount === 0) {
      console.log('⏭️ Already verifying - skipping');
      return;
    }

    verifyingRef.current = true;
    console.log('🔒 Set verifyingRef = true');

    // Show manual verification button immediately as backup
    if (retryCount === 0) {
      setShowManualVerify(true);
      toast('Payment processing... You can use manual verification if it takes too long.', {
        duration: 5000,
        icon: 'ℹ️'
      });
    }
    
    try {
      // Wait even longer for Paystack to fully process
      const waitTime = retryCount === 0 ? 10000 : 5000; // Wait 10s first, then 5s
      console.log(`⏳ Waiting ${waitTime}ms for Paystack to process...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      console.log('📞 Calling verification API (verify-pending)...');
      // Use verify-pending endpoint which is more reliable
      const response = await apiCall('/payments/verify-pending/', {
        method: 'POST'
      });

      console.log('📬 Verification response:', response);
      
      // Check if any payments were verified using verify-pending response structure
      if (response && response.verified_count > 0) {
        // Payment was verified successfully
        console.log('✅ Payment verified successfully via verify-pending!');
        
        // Refresh subscription data first to get the actual credits
        await Promise.all([fetchSubscription(), triggerDataRefresh()]);
        
        // Wait a moment for subscription context to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get updated subscription info from the subscription context
        const updatedSubscription = subscription;
        const songCredits = updatedSubscription?.remaining_credits || 0;
        
        console.log('📊 Updated subscription credits:', songCredits);
        
        // Prepare success response
        const successResponse = {
          status: 'success',
          subscription_type: plan,
          remaining_credits: songCredits,
          song_credits: songCredits
        };
        
        await handleVerificationSuccess(successResponse, plan);
        return; // Success - exit
      } else if (response && response.verified_count === 0) {
        // Payment still pending - retry if we have retries left
        console.log('⏳ Payment still pending (verified_count = 0)...');
        if (retryCount < maxRetries - 1) {
          console.log(`🔄 Will retry in ${retryDelay}ms...`);
          verifyingRef.current = false; // Reset for retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Check if payment is still pending before retrying
          if (pendingPaymentRef.current) {
            return startPaymentVerification(reference, plan, retryCount + 1);
          } else {
            console.log('⏹️ Payment cleared - stopping retries');
            return;
          }
        } else {
          // Max retries reached - show manual verification option
          console.log('⚠️ Max retries reached - showing manual verification');
          setShowManualVerify(true);
          toast('Payment processing taking longer than expected. Please use manual verification.', {
            duration: 8000,
            icon: 'ℹ️'
          });
          // Also start background polling as backup
          startBackgroundPolling(reference, plan);
        }
      }

    } catch (error) {
      console.log(`❌ Verification error (attempt ${retryCount + 1}):`, error.message);
      // Retry on network errors
      if (retryCount < maxRetries - 1 && pendingPaymentRef.current) {
        console.log(`🔄 Retrying after error in ${retryDelay}ms...`);
        verifyingRef.current = false;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return startPaymentVerification(reference, plan, retryCount + 1);
      } else {
        // Show manual verification and start background polling
        console.log('⚠️ All retries failed - showing manual verification');
        setShowManualVerify(true);
        toast('Please use manual verification to complete your payment.', { 
          duration: 8000,
          icon: 'ℹ️'
        });
        startBackgroundPolling(reference, plan);
      }
    } finally {
      if (retryCount === maxRetries - 1 || !pendingPaymentRef.current) {
        console.log('🔓 Setting verifyingRef = false');
        verifyingRef.current = false;
      }
    }
  };

  /**
   * Handle successful verification
   */
  const handleVerificationSuccess = async (response, plan) => {
    // Clear polling interval if it exists
    if (verificationTimerRef.current) {
      clearInterval(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }
    
    // Clear pending payment
    pendingPaymentRef.current = null;
    
    // Refresh subscription data and wait for it to update
    await Promise.all([fetchSubscription(), triggerDataRefresh()]);
    
    // Make a fresh API call to get the ACTUAL current subscription data
    let songCredits = 0;
    let planName, benefits;
    
    try {
      const freshSubData = await apiCall('/payments/subscription/');
      songCredits = freshSubData?.remaining_credits || 0;
      
      console.log('💳 Fresh subscription data from API:', freshSubData);
      console.log('💳 Actual credits:', songCredits);
    } catch (error) {
      console.error('Failed to fetch fresh subscription:', error);
      // Fallback to context data
      songCredits = subscription?.remaining_credits || 0;
      console.log('💳 Credits from context (fallback):', songCredits);
    }
    
    // Prepare display text
    if (plan === 'yearly') {
      planName = 'Yearly Premium';
      benefits = 'Unlimited uploads for one year';
    } else {
      planName = 'Pay Per Song';
      benefits = `${songCredits} upload credit${songCredits !== 1 ? 's' : ''}`;
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
    console.log('🔍 Manual verification triggered for:', reference);
    
    try {
      const response = await apiCall('/payments/verify-pending/', {
        method: 'POST'
      });

      console.log('📬 Manual verification response:', response);

      if (response && response.verified_count > 0) {
        console.log('✅ Manual verification successful!');
        toast.success('Payment verified!', { id: 'manual-verify' });
        
        // Refresh subscription data
        await Promise.all([fetchSubscription(), triggerDataRefresh()]);
        
        // Make a fresh API call to get the ACTUAL current credits
        let songCredits = 0;
        try {
          const freshSubData = await apiCall('/payments/subscription/');
          songCredits = freshSubData?.remaining_credits || 0;
          console.log('💳 Manual verify - Fresh credits from API:', songCredits);
        } catch (error) {
          console.error('Failed to fetch fresh subscription:', error);
          songCredits = subscription?.remaining_credits || 0;
          console.log('💳 Manual verify - Credits from context (fallback):', songCredits);
        }
        
        // Show success modal
        setSuccessDetails({
          planName: plan === 'yearly' ? 'Yearly Premium' : 'Pay Per Song',
          benefits: plan === 'yearly' ? 'Unlimited uploads for one year' : `${songCredits} upload credit${songCredits !== 1 ? 's' : ''}`,
          subscriptionType: plan,
          songCredits
        });
        setShowSuccessModal(true);
        setLoadingPlan(null);
        setShowManualVerify(false);
        pendingPaymentRef.current = null;
      } else {
        console.log('⚠️ No pending payments found');
        toast.error('No pending payments found to verify', { id: 'manual-verify' });
      }
    } catch (error) {
      console.log('❌ Manual verification error:', error);
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

  /**
   * Cancellation modal handlers
   */
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelDetails(null);
  };

  const handleRetryPayment = () => {
    setShowCancelModal(false);
    const plan = cancelDetails?.plan;
    setCancelDetails(null);
    if (plan) {
      // Retry the same plan
      setTimeout(() => handleUpgrade(plan), 300);
    }
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
      {/* Referral Promo Bar - Only for non-subscribed users */}
      {subscriptionType === 'free' && <ReferralPromoBar />}
      
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

          {/* Referral Banner */}
          <div className="mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start space-x-4 text-white">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <GiftIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center">
                    Get Free Upload Credits!
                    <SparklesIcon className="h-5 w-5 ml-2 animate-pulse" />
                  </h3>
                  <p className="text-purple-100 text-sm">
                    Don't want to pay? Invite friends and earn free uploads! Get 1 free credit for every 2 friends who subscribe.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/referrals"
                className="flex-shrink-0 bg-white text-purple-600 hover:text-purple-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Start Referring →
              </Link>
            </div>
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
            <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-xl p-6 max-w-2xl mx-auto shadow-lg animate-pulse">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-900 mb-3">
                  ✅ Payment Completed!
                </h3>
                <p className="text-green-800 mb-4 text-lg">
                  We've confirmed your payment with Paystack. Click the button below to activate your subscription immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleManualVerification}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                  >
                    � Activate Subscription Now
                  </button>
                  <button
                    onClick={handleForceRefresh}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
                  >
                    🔄 Refresh Account
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Auto-verification is still running in the background...
                </p>
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

      {/* Cancellation Modal */}
      {showCancelModal && cancelDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative animate-in fade-in duration-300">
            {/* Cancel Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            {/* Cancel Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Canceled
              </h3>
              <p className="text-gray-600 mb-4">
                {cancelDetails.wasPolling 
                  ? "We couldn't verify your payment. If you completed the payment, you can try manual verification. Otherwise, feel free to try again."
                  : "You closed the payment window. No charges were made to your account."
                }
              </p>
              
              {/* Plan Details */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-orange-900 mb-1">
                  {cancelDetails.planName}
                </h4>
                <p className="text-orange-700 text-sm">
                  You can restart the payment process whenever you're ready
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              {cancelDetails.wasPolling && (
                <button
                  onClick={handleManualVerification}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center"
                >
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Try Manual Verification
                </button>
              )}
              <button
                onClick={handleRetryPayment}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center"
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Retry Payment
              </button>
              <button
                onClick={handleCancelModalClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubscriptionPage;
