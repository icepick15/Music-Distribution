import React, { useState, useRef } from 'react';
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

// API helper function (use the same one from AuthContext)
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('authToken');
  const url = `http://127.0.0.1:8000/api${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.detail || responseData.error || 'An error occurred');
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { fetchSubscription, subscription } = useSubscription();
  const navigate = useNavigate();
  const [loadingPayPerSong, setLoadingPayPerSong] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  // Derive from subscription context (backend truth) not user metadata which may be stale
  const subscriptionType = subscription?.subscription_type || 'free';
  const songCredits = subscription?.song_credits || 0;
  const yearlyFeatures = user?.publicMetadata?.yearlyFeatures || false;
  const uploadCount = user?.publicMetadata?.uploadCount || 0;
  const { canUpload } = useSubscription();
  const verifyingRef = useRef(false);

  const handleUpgrade = async (plan) => {
    // Set loading state for the specific plan
    if (plan === 'pay_per_song') {
      setLoadingPayPerSong(true);
    } else if (plan === 'yearly') {
      setLoadingYearly(true);
    }
    
    try {
      // Get pricing information
      const pricingResponse = await apiCall('/payments/pricing/');
      if (!pricingResponse.success) {
        toast.error('Failed to get pricing information');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      const pricing = pricingResponse.data.subscriptions[plan];
      if (!pricing) {
        toast.error('Invalid subscription plan');
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
        return;
      }
      
      // Initialize payment
      const paymentResponse = await apiCall('/payments/subscription/upgrade/', 'POST', {
        subscription_type: plan,
        auto_renew: true
      });
      
      if (paymentResponse.success) {
        console.log('Payment Response:', paymentResponse.data); // Debug log
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
        if (!paymentResponse.data.reference || !paymentResponse.data.amount) {
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
          amount: paymentResponse.data.amount * 100, // Convert to kobo (amount is already in Naira)
          currency: 'NGN',
          ref: paymentResponse.data.reference,
          onSuccess: function(transaction) {
            console.log('Payment successful:', transaction);
            // Verify payment
            verifyPayment(transaction.reference, plan);
          },
          onClose: function() {
            // Paystack calls onClose for both cancel and after success close. If still loading and not verifying, treat as cancel.
            if (!verifyingRef.current) {
              console.log('Payment popup closed before verification');
              toast.error('Payment popup closed');
              if (plan === 'pay_per_song') setLoadingPayPerSong(false);
              if (plan === 'yearly') setLoadingYearly(false);
            }
          }
        });
        
        handler.openIframe();
      } else {
        toast.error(`Failed to initialize payment: ${paymentResponse.error || 'Unknown error'}`);
        if (plan === 'pay_per_song') setLoadingPayPerSong(false);
        if (plan === 'yearly') setLoadingYearly(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed');
      if (plan === 'pay_per_song') setLoadingPayPerSong(false);
      if (plan === 'yearly') setLoadingYearly(false);
    }
  };
  
  const verifyPayment = async (reference, plan) => {
    try {
      if (verifyingRef.current) return; // prevent duplicate
      verifyingRef.current = true;
      console.log('Verifying payment with reference:', reference);
      
      const response = await apiCall('/payments/verify/', 'POST', { reference });
      console.log('Payment verification response:', response);
      
      if (response.success) {
        // Reset loading states
        setLoadingPayPerSong(false);
        setLoadingYearly(false);
        
        // Prepare success details
        const subscriptionType = response.data.subscription_type;
        const songCredits = response.data.song_credits;
        
        let planName, benefits;
        if (plan === 'yearly') {
          planName = 'Yearly Premium';
          benefits = 'Unlimited uploads for one year';
        } else if (plan === 'pay_per_song') {
          planName = 'Pay Per Song';
          benefits = `${songCredits} upload credit${songCredits > 1 ? 's' : ''}`;
        }
        
        // Show success toast with details
        toast.success(
          `🎉 Payment successful! You now have ${plan === 'yearly' ? 'unlimited uploads' : songCredits + ' upload credit' + (songCredits > 1 ? 's' : '')}`,
          { 
            duration: 5000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: 'bold'
            }
          }
        );
        
        setSuccessDetails({
          planName,
          benefits,
          subscriptionType,
          songCredits
        });
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Refresh subscription data
        await fetchSubscription();
        
      } else {
        toast.error('Payment verification failed: ' + (response.error || 'Unknown error'));
        setLoadingPayPerSong(false);
        setLoadingYearly(false);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast.error('Payment verification failed: ' + error.message);
      setLoadingPayPerSong(false);
      setLoadingYearly(false);
    } finally {
      verifyingRef.current = false;
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    
    // Navigate to dashboard with success message
    navigate('/dashboard', { 
      state: { 
        message: 'Subscription updated successfully! You can now upload songs.',
        type: 'success'
      }
    });
  };

  const handleContinueToUpload = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    navigate('/upload');
  };

  // Test function for payment verification
  const testPaymentVerification = async () => {
    try {
      const response = await apiCall('/payments/dev/test-verify/');
      if (response.success) {
        toast.success(`Test result: ${JSON.stringify(response.data, null, 2)}`);
        console.log('Test verification result:', response.data);
        // Refresh subscription after test
        await fetchSubscription();
      } else {
        toast.error(`Test failed: ${response.error}`);
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
  current: subscriptionType === 'pay_per_song' || (subscription && subscription.subscription_type === 'pay_per_song')
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
                    {subscriptionType === 'yearly' && 'Unlimited uploads until Dec 2026'}
                    {subscriptionType === 'pay_per_song' && `${songCredits} upload credits remaining`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600">Next billing: Dec 15, 2025</p>
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
                    {plan.id === 'yearly' ? 'Go Premium' : 'Start Uploading'}
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
