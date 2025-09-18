import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckIcon, 
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const ModernPricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: "Starter",
      icon: RocketLaunchIcon,
      description: "Perfect for new artists getting started",
      monthlyPrice: 19,
      yearlyPrice: 190,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "Distribute to 50+ platforms",
        "Basic analytics dashboard",
        "Email support",
        "Keep 85% of royalties",
        "5 releases per month",
        "Basic content protection"
      ],
      limitations: [
        "Advanced analytics",
        "Priority support",
        "Custom branding"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      icon: SparklesIcon,
      description: "Most popular for serious artists",
      monthlyPrice: 39,
      yearlyPrice: 390,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Distribute to 100+ platforms",
        "Advanced analytics & insights",
        "Priority email & chat support",
        "Keep 95% of royalties",
        "Unlimited releases",
        "Advanced content protection",
        "Social media automation",
        "Playlist pitching tools"
      ],
      limitations: [
        "White-label reports"
      ],
      cta: "Start Professional",
      popular: true
    },
    {
      name: "Enterprise",
      icon: StarIcon,
      description: "For labels and high-volume artists",
      monthlyPrice: 99,
      yearlyPrice: 990,
      color: "gold",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "Distribute to 150+ platforms",
        "Real-time analytics & reporting",
        "24/7 priority support + phone",
        "Keep 100% of royalties",
        "Unlimited everything",
        "Enterprise content protection",
        "Advanced social automation",
        "Dedicated playlist contacts",
        "White-label reporting",
        "API access",
        "Custom integrations"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const getPrice = (plan) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

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
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <div key={index} className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
              
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
                        <span className="text-5xl font-bold text-gray-900">${getPrice(plan)}</span>
                        <span className="text-gray-500 ml-2">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Save ${getSavings(plan)} per year
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {plan.cta}
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
