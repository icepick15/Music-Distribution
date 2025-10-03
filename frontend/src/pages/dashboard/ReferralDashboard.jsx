import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  GiftIcon,
  ChartBarIcon,
  ShareIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const ReferralDashboard = () => {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
    fetchStats();
    fetchReferrals();
    fetchCredits();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/referrals/codes/my_code/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/referrals/codes/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/referrals/codes/referrals/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/referrals/credits/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaTwitter = () => {
    const text = `🎵 Join me on this amazing music distribution platform! Upload your music and reach millions. Use my referral code: ${referralData?.code}`;
    const url = referralData?.referral_url;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = referralData?.referral_url;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = `🎵 Join me on this amazing music distribution platform! Upload your music and reach millions. ${referralData?.referral_url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-gray-600">
            Earn free upload credits by referring artists. For every 2 artists who make a payment, you get 1 free upload!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_clicks || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signups</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_signups || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_paid_referrals || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Credits</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats?.available_credits || 0}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <GiftIcon className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Next Credit */}
        {stats && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Progress to Next Credit</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {stats.next_credit_progress.current} of {stats.next_credit_progress.required} paid referrals
                </p>
              </div>
              <GiftIcon className="h-12 w-12 text-white opacity-75" />
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.next_credit_progress.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-indigo-100 mt-3">
              {stats.next_credit_progress.required - stats.next_credit_progress.current === 1
                ? '1 more paid referral to earn a credit!'
                : `${stats.next_credit_progress.required - stats.next_credit_progress.current} more paid referrals to earn a credit`}
            </p>
          </div>
        )}

        {/* Referral Link Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Link</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Referral Code</p>
                <p className="text-2xl font-bold text-indigo-600 font-mono">{referralData?.code}</p>
              </div>
              <button
                onClick={() => copyToClipboard(referralData?.code)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Full Referral URL</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralData?.referral_url || ''}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralData?.referral_url)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareViaTwitter}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              Share on Twitter
            </button>
            <button
              onClick={shareViaFacebook}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              Share on Facebook
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Referrals</h2>
          
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No referrals yet. Start sharing your link!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">First Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {referral.referred_user_email || 'Pending signup'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'credit_awarded' ? 'bg-green-100 text-green-700' :
                          referral.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                          referral.status === 'signed_up' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {referral.status === 'credit_awarded' && <CheckCircleIcon className="h-4 w-4" />}
                          {referral.status === 'pending' && <ClockIcon className="h-4 w-4" />}
                          {referral.status.replace('_', ' ').charAt(0).toUpperCase() + referral.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {referral.signed_up_at ? new Date(referral.signed_up_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {referral.first_payment_at ? (
                          <div>
                            <p>{new Date(referral.first_payment_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">${referral.first_payment_amount}</p>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Credits History */}
        {credits.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Credits History</h2>
            <div className="space-y-3">
              {credits.map((credit) => (
                <div key={credit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      credit.status === 'available' ? 'bg-green-100' :
                      credit.status === 'used' ? 'bg-gray-100' :
                      'bg-yellow-100'
                    }`}>
                      <GiftIcon className={`h-6 w-6 ${
                        credit.status === 'available' ? 'text-green-600' :
                        credit.status === 'used' ? 'text-gray-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {credit.amount} Upload Credit{credit.amount > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        Earned from {credit.referral_count} referral{credit.referral_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      credit.status === 'available' ? 'bg-green-100 text-green-700' :
                      credit.status === 'used' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(credit.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReferralDashboard;
