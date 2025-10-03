import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  MusicalNoteIcon,
  UserGroupIcon,
  ChartBarIcon,
  GiftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ReferralLanding = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateReferralCode();
    trackReferralClick();
  }, [code]);

  const validateReferralCode = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/referrals/validate/${code}/`);
      
      if (response.ok) {
        const data = await response.json();
        setIsValid(data.valid);
        setReferrerName(data.referrer_name);
      } else {
        setIsValid(false);
        toast.error('Invalid referral code');
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const trackReferralClick = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/referrals/track/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          user_agent: navigator.userAgent
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store tracking cookie
        if (data.tracking_cookie) {
          localStorage.setItem('referral_tracking', data.tracking_cookie);
        }
      }
    } catch (error) {
      console.error('Error tracking referral:', error);
    }
  };

  const handleSignup = () => {
    navigate('/register', { state: { referralCode: code } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Referral Code</h1>
          <p className="text-gray-600 mb-6">
            This referral link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign Up Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MusicalNoteIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Music Distribution</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full text-white mb-6">
            <GiftIcon className="h-5 w-5" />
            <span className="font-medium">You've been invited by {referrerName}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Distribute Your Music<br />to the World
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of artists uploading their music to major streaming platforms.
            Get started today with our powerful distribution tools.
          </p>
          
          <button
            onClick={handleSignup}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started Free
          </button>
          
          <p className="text-white/80 mt-4 text-sm">
            No credit card required • Start uploading in minutes
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <MusicalNoteIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Easy Upload</h3>
            <p className="text-white/80">
              Upload your tracks in minutes with our intuitive upload wizard. Support for all major audio formats.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track Analytics</h3>
            <p className="text-white/80">
              Monitor your music's performance with real-time analytics and detailed insights.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Global Reach</h3>
            <p className="text-white/80">
              Distribute to Spotify, Apple Music, Amazon Music, and 150+ streaming platforms worldwide.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Why Artists Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Keep 100% of Your Rights</h4>
                <p className="text-white/80 text-sm">You own your music, always. No hidden fees or rights grabs.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Fast Distribution</h4>
                <p className="text-white/80 text-sm">Your music goes live on major platforms within 24-48 hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Flexible Pricing</h4>
                <p className="text-white/80 text-sm">Pay per song or get unlimited uploads with our yearly plan.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">Expert Support</h4>
                <p className="text-white/80 text-sm">Get help from real people who understand music distribution.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Share Your Music?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join {referrerName} and thousands of other artists today
          </p>
          <button
            onClick={handleSignup}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Create Your Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLanding;
