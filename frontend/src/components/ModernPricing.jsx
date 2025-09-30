import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckIcon, 
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  RocketLaunchIcon,
  MusicalNoteIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ModernPricing = () => {
  const { isSignedIn } = useAuth();
  const [billingCycle, setBillingCycle] = useState('yearly');

  const plans = [
    {
      id: 'pay_per_song',
      name: 'Pay Per Song',
      icon: MusicalNoteIcon,
      price: '₦5,000',
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
      color: 'gray',
      gradient: "from-gray-500 to-slate-500"
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      icon: SparklesIcon,
      price: '₦39,900',
      originalPrice: '₦50,400',
      period: 'per year',
      savings: 'Save ₦10,500',
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
      color: 'purple',
      gradient: "from-purple-500 to-pink-500"
    }
  ];



  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-50 rounded-full px-4 py-2 mb-6">
            <SparklesIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Simple Pricing</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose your
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core distribution features 
            with no hidden fees or setup costs.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors duration-200"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Save 28%</span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={plan.id} className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
              
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`bg-gradient-to-r ${plan.gradient} text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg`}>
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`relative bg-white rounded-2xl border-2 ${
                plan.popular 
                  ? 'border-transparent bg-gradient-to-b from-purple-50 to-pink-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } p-8 transition-all duration-300 hover:shadow-xl ${plan.popular ? 'shadow-xl' : ''}`}>
                
                {/* Gradient Border for Popular Plan */}
                {plan.popular && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-2xl opacity-20`}></div>
                    <div className="absolute inset-[2px] bg-white rounded-2xl"></div>
                  </>
                )}

                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-xl mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-400 line-through mr-2">{plan.originalPrice}</span>
                        )}
                        <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 ml-2">{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          {plan.savings}
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={isSignedIn ? '/dashboard/subscription' : '/'}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isSignedIn ? (plan.id === 'yearly' ? 'Upgrade Plan' : 'Buy Credits') : plan.cta}
                    </Link>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      What's included:
                    </h4>
                    
                    {/* Included Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations (if any) */}
                    {plan.limitations.length > 0 && (
                      <ul className="space-y-3 pt-4 border-t border-gray-200">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start space-x-3">
                            <XMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Questions about pricing?
          </h3>
          <p className="text-gray-600 mb-8">
            Our team is here to help you choose the right plan for your music career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Contact Sales
            </Link>
            <Link
              to="/help#faq"
              className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border border-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernPricing;
