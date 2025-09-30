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
  const [loadingPayPerSong, setLoadingPayPerSong] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [showEmergencyActions, setShowEmergencyActions] = useState(false);
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false); // Track when payment is actually initiated

  // Derive from subscription context (backend truth) not user metadata which may be stale
  const subscriptionType = subscription?.subscription_type || 'free';
  const songCredits = subscription?.remaining_credits || 0;
  const yearlyFeatures = user?.publicMetadata?.yearlyFeatures || false;
  const uploadCount = user?.publicMetadata?.uploadCount || 0;
  const { canUpload } = useSubscription();
  const verifyingRef = useRef(false);
  const autoVerifyingRef = useRef(false); // Prevent concurrent auto-verifications

  // Simple auto-verification function - like the original working version
  const autoVerifyPendingPayments = async () => {
    try {
      // Prevent concurrent requests
      if (autoVerifyingRef.current) {
        console.log('⏭️ Auto-verification already in progress');
        return false;
      }
      
      autoVerifyingRef.current = true;
      console.log('🔍 Auto-checking for pending payments...');
      
      const response = await apiCall('/payments/verify-pending/', {
        method: 'POST'
      });
      
      if (response && response.verified_count > 0) {
        console.log(`✅ Auto-verified ${response.verified_count} pending payment(s)`);
        
        // Refresh data and reset states
        await Promise.all([
          fetchSubscription(),
          triggerDataRefresh()
        ]);
        
        toast.success(`Payment completed! ${response.verified_count} credit(s) added to your account.`);
        
        // Reset all states
        setLoadingPayPerSong(false);
        setLoadingYearly(false);
        setShowEmergencyActions(false);
        setPaymentModalOpened(false);
        setPaymentInitiated(false);
        
        return true;
      } else {
        console.log('🔍 No pending payments found to verify');
        return false;
      }
    } catch (error) {
      console.error('Auto-verify failed:', error);
      return false;
    } finally {
      autoVerifyingRef.current = false;
    }
  };

  // Emergency actions timer when payment is loading
  useEffect(() => {
    console.log('🔄 Emergency timer useEffect triggered:', { 
      loadingPayPerSong, 
      loadingYearly, 
      timestamp: new Date().toLocaleTimeString()
    });
    
    let timer;
    
    if (loadingPayPerSong || loadingYearly) {
      // Show emergency actions after 15 seconds
      timer = setTimeout(() => {
        setShowEmergencyActions(true);
        console.log('⏰ Payment processing timeout - showing emergency actions');
      }, 15000);
    } else {
      console.log('🔄 Resetting emergency actions');
      setShowEmergencyActions(false);
      setPaymentModalOpened(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loadingPayPerSong, loadingYearly]);

  // Show emergency actions when payment succeeds (manual verification is more reliable)
  useEffect(() => {
    console.log('💳 Payment state changed:', { 
      paymentInitiated,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (paymentInitiated) {
      console.log('💳 Payment successful - emergency actions available for manual verification');
      setShowEmergencyActions(true);
    } else {
      console.log('🔄 Resetting payment state');
      setShowEmergencyActions(false);
      autoVerifyingRef.current = false;
    }
  }, [paymentInitiated]);

  const handleUpgrade = async (plan) => {
    // Set loading state for the specific plan
    if (plan === 'pay_per_song') {
      setLoadingPayPerSong(true);
    } else if (plan === 'yearly') {
      setLoadingYearly(true);
    }
    
    try {
      // Get pricing information
      console.log('Fetching pricing information...');
      console.log('User authentication:', user?.email, 'has token:', !!localStorage.getItem('authToken'));
      
      const pricingData = await apiCall('/payments/pricing/');
      console.log('Pricing data received:', pricingData);
      
      if (!pricingData || !pricingData.subscriptions) {
        toast.error('Invalid pricing data received');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      const pricing = pricingData.subscriptions[plan];
      if (!pricing) {
        toast.error('Invalid subscription plan');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      console.log('Using pricing for plan:', plan, pricing);
      
      // Initialize payment
      const paymentData = await apiCall('/payments/subscription/upgrade/', {
        method: 'POST',
        body: JSON.stringify({
          subscription_type: plan,
          auto_renew: true
        })
      });
      
      console.log('Payment Response:', paymentData); // Debug log
      console.log('User email:', user.email); // Debug user email
      console.log('User object:', user); // Debug full user object
      
      // Check if PaystackPop is available
      if (!window.PaystackPop) {
        toast.error('Payment system not loaded. Please refresh the page and try again.');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      // Verify required data
      if (!paymentData.reference || !paymentData.amount) {
        toast.error('Invalid payment data received');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      // Get user email with fallbacks
      let userEmail = user.email || 
                     user.emailAddresses?.[0]?.emailAddress || 
                     user.primaryEmailAddress?.emailAddress ||
                     'test@example.com'; // Fallback for testing
      
      // Verify user email
      if (!userEmail || !userEmail.includes('@')) {
        userEmail = 'test@example.com'; // Use test email if invalid
        console.warn('Using fallback email for payment:', userEmail);
      }
      
      console.log('Using email for payment:', userEmail);
      
      // Open Paystack payment popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: paymentData.amount * 100, // Convert to kobo (amount is already in Naira)
        currency: 'NGN',
        ref: paymentData.reference,
        onSuccess: function(transaction) {
          console.log('🎉 Paystack payment successful:', transaction);
          setPaymentInitiated(true);
          
          // Guide user to manually verify - this is more reliable than auto-verification
          toast.success('🎉 Payment successful! Please click "Verify Payment" below to complete your subscription.', {
            duration: 10000,
            position: 'top-center'
          });
          console.log('💳 Payment successful - user guided to manual verification');
        },
        onClose: function() {
          // Paystack calls onClose for both cancel and after success close. If still loading and not verifying, treat as cancel.
          if (!verifyingRef.current) {
            console.log('Payment popup closed before verification');
            toast.error('Payment cancelled by user');
            if (plan === 'pay_per_song') setLoadingPayPerSong(false);
            if (plan === 'yearly') setLoadingYearly(false);
            setPaymentModalOpened(false); // Reset modal state on close
            setPaymentInitiated(false); // Reset payment initiation state
            // Redirect to dashboard/music with cancelled message
            navigate('/dashboard/music', {
              state: {
                message: 'Payment was cancelled. No changes were made to your subscription.',
                type: 'error'
              }
            });
          }
        }
      });
      
      // Track that payment modal is opening
      console.log('🚀 Opening Paystack payment modal...');
      setPaymentModalOpened(true);
      handler.openIframe();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(`Payment initialization failed: ${error.message || 'Unknown error'}`);
      if (plan === 'pay_per_song') setLoadingPayPerSong(false);
      if (plan === 'yearly') setLoadingYearly(false);
    }
  };
  
  const verifyPayment = async (reference, plan) => {
    try {
      if (verifyingRef.current) return; // prevent duplicate
      verifyingRef.current = true;
      console.log('🔄 Verifying payment with reference:', reference);
      
      // Wait a moment for backend processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add timeout wrapper for verification call
      const verifyWithTimeout = async () => {
        return Promise.race([
          apiCall('/payments/verify/', 'POST', { reference }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Verification timeout - took longer than 30 seconds')), 30000)
          )
        ]);
      };
      
      const response = await verifyWithTimeout();
      console.log('✅ Payment verification response:', response);
      
      // Reset all payment-related states IMMEDIATELY regardless of response
      setLoadingPayPerSong(false);
      setLoadingYearly(false);
      setShowEmergencyActions(false);
      setPaymentModalOpened(false);
      setPaymentInitiated(false);
      
      if (response && response.status === 'success') {
        console.log('🎉 Payment verified successfully!');
        
        // Prepare success details
        const subscriptionType = response.subscription_type;
        const songCredits = response.remaining_credits || response.song_credits;
        
        let planName, benefits;
        if (plan === 'yearly') {
          planName = 'Yearly Premium';
          benefits = 'Unlimited uploads for one year';
        } else if (plan === 'pay_per_song') {
          planName = 'Pay Per Song';
          benefits = `${songCredits} upload credit${songCredits > 1 ? 's' : ''}`;
        }
        
        // Show immediate success feedback
        toast.success(
          `🎉 Payment successful! You now have ${plan === 'yearly' ? 'unlimited uploads' : songCredits + ' upload credit' + (songCredits > 1 ? 's' : '')}`,
          { 
            duration: 6000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: 'bold'
            }
          }
        );
        
        // Set modal data
        setSuccessDetails({
          planName,
          benefits,
          subscriptionType,
          songCredits
        });
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Force refresh data in background with retries
        console.log('🔄 Refreshing user data...');
        const refreshData = async () => {
          try {
            await Promise.all([
              fetchSubscription(),
              triggerDataRefresh()
            ]);
            console.log('✅ Data refreshed successfully');
          } catch (err) {
            console.warn('⚠️ Data refresh failed, retrying...', err);
            // Retry once after a short delay
            setTimeout(async () => {
              try {
                await Promise.all([
                  fetchSubscription(),
                  triggerDataRefresh()
                ]);
                console.log('✅ Data refreshed on retry');
              } catch (retryErr) {
                console.error('❌ Data refresh failed on retry:', retryErr);
              }
            }, 2000);
          }
        };
        
        refreshData();
        
      } else {
        console.error('❌ Payment verification failed:', response);
        toast.error('Payment verification failed. Please contact support if your payment was charged.');
        
        navigate('/dashboard/music', {
          state: {
            message: 'Payment verification failed. Please contact support if your payment was charged.',
            type: 'error'
          }
        });
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      
      // Reset ALL loading states and emergency actions - FORCE RESET
      setLoadingPayPerSong(false);
      setLoadingYearly(false);
      setShowEmergencyActions(false);
      
      toast.error('Payment verification failed: ' + error.message);
      
      navigate('/dashboard/music', {
        state: {
          message: 'Payment verification failed. Please contact support if your payment was charged.',
          type: 'error'
        }
      });
    } finally {
      verifyingRef.current = false;
      // Final safety net - force reset all payment states after a delay
      setTimeout(() => {
        setLoadingPayPerSong(false);
        setLoadingYearly(false);
        setShowEmergencyActions(false);
        setPaymentModalOpened(false);
        setPaymentInitiated(false);
      }, 1000);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    
    // Navigate to music dashboard with success message
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

  // Emergency verification function for stuck payments
  const forceVerifyPayment = async () => {
    try {
      // Reset all payment-related states
      setLoadingPayPerSong(false);
      setLoadingYearly(false);
      setShowEmergencyActions(false);
      setPaymentModalOpened(false);
      setPaymentInitiated(false);
      
      // Force refresh user data
      await Promise.all([
        fetchSubscription(),
        triggerDataRefresh()
      ]);
      
      toast.success('Account status refreshed successfully!');
    } catch (error) {
      console.error('Force refresh failed:', error);
      toast.error('Failed to refresh account status: ' + error.message);
    }
  };



  // Test function for payment verification
  const testPaymentVerification = async () => {
    try {
      const response = await apiCall('/payments/dev/test-verify/');
      if (response) {
        toast.success(`Test result: ${JSON.stringify(response, null, 2)}`);
        console.log('Test verification result:', response);
        // Refresh subscription after test
        await fetchSubscription();
      } else {
        toast.error('Test failed: No response received');
      }
    } catch (error) {
      toast.error(`Test error: ${error.message}`);
      console.error('Test verification error:', error);
    }
  };

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
      current: false // Always allow pay-per-song users to buy more credits
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
  current: subscriptionType === 'yearly' || (subscription && subscription.subscription_type === 'yearly')
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Current Plan: {subscriptionType === 'yearly' ? 'Yearly Premium' : 'Pay Per Song'}
                  </h3>
                  <p className="text-purple-700">
                    {subscriptionType === 'yearly' && subscription?.end_date && `Unlimited uploads until ${new Date(subscription.end_date).toLocaleDateString()}`}
                    {subscriptionType === 'pay_per_song' && `${songCredits} upload credits remaining (no expiry)`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {subscriptionType === 'yearly' && subscription?.end_date && (
                  <p className="text-sm text-purple-600">Expires: {new Date(subscription.end_date).toLocaleDateString()}</p>
                )}
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Manage billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative rounded-3xl p-8 ${
              plan.popular 
                ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white shadow-2xl scale-105' 
                : 'bg-white border-2 border-gray-200'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-400 text-purple-900 px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-lg line-through text-purple-200">
                        {plan.originalPrice}
                      </span>
                      <span className="bg-green-400 text-purple-900 px-2 py-1 rounded text-sm font-semibold">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`ml-2 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'text-green-300' : 'text-green-500'
                    }`} />
                    <span className={plan.popular ? 'text-purple-50' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={(plan.id === 'pay_per_song' ? loadingPayPerSong : loadingYearly) || plan.current}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center ${
                  plan.current
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-white text-purple-600 hover:bg-gray-50 shadow-lg'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {(plan.id === 'pay_per_song' ? loadingPayPerSong : loadingYearly) ? (
                  <div className="flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </div>
                ) : plan.current ? (
                  'Current Plan'
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    {plan.id === 'yearly' ? 'Go Premium' : (songCredits > 0 ? 'Buy More Credits' : 'Start Uploading')}
                  </>
                )}
              </button>

              {plan.id === 'pay_per_song' && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  No monthly fees • Pay only when you upload
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {subscriptionType === 'pay_per_song' && (
          <div className="mt-12 text-center">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 max-w-md mx-auto">
              <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-indigo-900 mb-2">Need more upload credits?</h3>
              <p className="text-indigo-700 mb-4">
                You have {songCredits} credits remaining
              </p>
              <button
                onClick={() => handleUpgrade('buy_credits')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Buy More Credits
              </button>
            </div>
          </div>
        )}

        {/* Payment Processing Status */}
        {(loadingPayPerSong || loadingYearly) && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <h3 className="font-semibold text-blue-900">
                  {!paymentInitiated ? 'Waiting for Payment...' : 'Payment Processing...'}
                </h3>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                {!paymentInitiated 
                  ? 'Please complete your payment in the Paystack window.'
                  : paymentInitiated 
                    ? 'Verifying your payment. Auto-verification will start shortly.'
                    : 'This usually takes 5-10 seconds.'
                }
              </p>
              
              {paymentInitiated && (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ Payment detected! Auto-verification is active.
                  </p>
                </div>
              )}
              
              {showEmergencyActions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm mb-3 font-medium">
                    🚨 Taking longer than expected? Try these options:
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={autoVerifyPendingPayments}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      🔍 Check & Verify Pending Payments
                    </button>
                    <button
                      onClick={forceVerifyPayment}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      🔄 Refresh Account Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
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
