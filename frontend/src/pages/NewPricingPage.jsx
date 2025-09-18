import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckIcon,
  StarIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ClockIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const PricingPage = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('yearly');

  const plans = [
    {
      id: 'pay_per_song',
      name: 'Pay Per Song',
      price: '$4.99',
      period: 'per upload',
      description: 'Perfect for artists just starting out or releasing occasionally',
      features: [
        'Upload individual songs',
        'Distribute to 100+ platforms',
        'Keep 100% of your royalties',
        'Basic analytics dashboard',
        'Standard processing (3-5 days)',
        'Community support',
        'No subscription commitment'
      ],
      limitations: [
        'No album creation',
        'No release scheduling',
        'Limited analytics'
      ],
      popular: false,
      cta: 'Start Uploading',
      color: 'gray'
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: billingCycle === 'yearly' ? '$59.99' : '$6.99',
      originalPrice: billingCycle === 'yearly' ? '$83.88' : null,
      period: billingCycle === 'yearly' ? 'per year' : 'per month',
      savings: billingCycle === 'yearly' ? 'Save $23.89' : null,
      description: 'Best value for serious artists and consistent releases',
      features: [
        'Unlimited song uploads',
        'Distribute to 150+ platforms',
        'Keep 100% of your royalties',
        'Advanced analytics & insights',
        'Album & EP creation',
        'Release scheduling',
        'Priority processing (1-2 days)',
        'Pre-order campaigns',
        'Revenue optimization tools',
        'Priority email support',
        'Early access to new features'
      ],
      limitations: [],
      popular: true,
      cta: 'Go Premium',
      color: 'purple'
    }
  ];

  const comparisonFeatures = [
    {
      category: 'Distribution',
      features: [
        { name: 'Song uploads', payPerSong: 'Pay per song', yearly: 'Unlimited' },
        { name: 'Streaming platforms', payPerSong: '100+', yearly: '150+' },
        { name: 'Processing time', payPerSong: '3-5 days', yearly: '1-2 days' },
        { name: 'Keep royalties', payPerSong: '100%', yearly: '100%' }
      ]
    },
    {
      category: 'Features',
      features: [
        { name: 'Album creation', payPerSong: '✗', yearly: '✓' },
        { name: 'Release scheduling', payPerSong: '✗', yearly: '✓' },
        { name: 'Pre-order campaigns', payPerSong: '✗', yearly: '✓' },
        { name: 'Advanced analytics', payPerSong: '✗', yearly: '✓' }
      ]
    },
    {
      category: 'Support',
      features: [
        { name: 'Support level', payPerSong: 'Community', yearly: 'Priority' },
        { name: 'Response time', payPerSong: '2-3 days', yearly: '24 hours' },
        { name: 'Phone support', payPerSong: '✗', yearly: '✓' },
        { name: 'Account manager', payPerSong: '✗', yearly: '✓' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {' '}Music Journey
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From individual songs to unlimited releases. Choose the plan that fits your artistic vision and budget.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save 28%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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

              <Link
                to={user ? "/dashboard/subscription" : "/register"}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center ${
                  plan.popular
                    ? 'bg-white text-purple-600 hover:bg-gray-50 shadow-lg'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                {plan.cta}
              </Link>

              {plan.id === 'pay_per_song' && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  No monthly fees • Pay only when you upload
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Detailed Comparison
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Pay Per Song
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-purple-50">
                      Yearly Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonFeatures.map((category) => (
                    <React.Fragment key={category.category}>
                      <tr className="bg-gray-25">
                        <td colSpan="3" className="px-6 py-3 text-sm font-semibold text-gray-900 bg-gray-50">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {feature.name}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {feature.payPerSong}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600 bg-purple-25">
                            {feature.yearly}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I switch between plans?
                </h3>
                <p className="text-gray-600">
                  Absolutely! You can upgrade to yearly anytime or switch to pay-per-song when your subscription ends.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do you take a cut of my royalties?
                </h3>
                <p className="text-gray-600">
                  Never! You keep 100% of your royalties. We only charge the upfront distribution fee.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What platforms do you distribute to?
                </h3>
                <p className="text-gray-600">
                  Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal, and 100+ more platforms worldwide.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  How long does distribution take?
                </h3>
                <p className="text-gray-600">
                  Pay-per-song: 3-5 business days. Yearly Premium: 1-2 business days with priority processing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! Your music stays live even if you cancel. You just lose access to premium features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do I need to pay for each song individually?
                </h3>
                <p className="text-gray-600">
                  With pay-per-song, yes. With yearly premium, upload unlimited songs at no extra cost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Share Your Music with the World?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of artists who trust us with their music distribution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? "/dashboard/subscription" : "/register"}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {user ? "Upgrade Now" : "Start Your Journey"}
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
