import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { 
  CheckIcon, 
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  RocketLaunchIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MusicalNoteIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PricingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('yearly');

  const plans = [
    {
      name: "Starter",
      icon: RocketLaunchIcon,
      description: "Perfect for new artists getting started",
      monthlyPrice: 19,
      yearlyPrice: 190,
      originalYearlyPrice: 228,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "Distribute to 50+ platforms",
        "Keep 85% of royalties",
        "Basic analytics dashboard",
        "Email support",
        "5 releases per month",
        "Basic content protection",
        "Monthly royalty payments"
      ],
      limitations: [
        "Advanced analytics",
        "Priority support",
        "Unlimited releases"
      ],
      cta: "Start Free Trial",
      popular: false,
      savings: "Save $38/year"
    },
    {
      name: "Professional",
      icon: SparklesIcon,
      description: "Most popular for serious artists",
      monthlyPrice: 39,
      yearlyPrice: 390,
      originalYearlyPrice: 468,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Distribute to 100+ platforms",
        "Keep 95% of royalties",
        "Advanced analytics & insights",
        "Priority email & chat support",
        "Unlimited releases",
        "Advanced content protection",
        "Social media automation",
        "Playlist pitching tools",
        "Weekly royalty payments"
      ],
      limitations: [
        "White-label reports"
      ],
      cta: "Start Professional",
      popular: true,
      savings: "Save $78/year"
    },
    {
      name: "Enterprise",
      icon: StarIcon,
      description: "For labels and high-volume artists",
      monthlyPrice: 99,
      yearlyPrice: 990,
      originalYearlyPrice: 1188,
      color: "gold",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "Distribute to 150+ platforms",
        "Keep 100% of royalties",
        "Real-time analytics & reporting",
        "24/7 priority support + phone",
        "Unlimited everything",
        "Enterprise content protection",
        "Advanced social automation",
        "Dedicated playlist contacts",
        "White-label reporting",
        "API access",
        "Custom integrations",
        "Daily royalty payments"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      savings: "Save $198/year"
    }
  ];

  const features = [
    {
      icon: GlobeAltIcon,
      title: "Global Distribution",
      description: "Reach 150+ streaming platforms worldwide"
    },
    {
      icon: ChartBarIcon,
      title: "Real-Time Analytics",
      description: "Track performance with detailed insights"
    },
    {
      icon: CurrencyDollarIcon,
      title: "Keep Your Royalties",
      description: "No hidden fees or revenue sharing"
    },
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description: "Music live in under 24 hours"
    },
    {
      icon: ShieldCheckIcon,
      title: "Content Protection",
      description: "Advanced copyright management"
    },
    {
      icon: MusicalNoteIcon,
      title: "Unlimited Releases",
      description: "No limits on your creativity"
    }
  ];

  const getPrice = (plan) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    return plan.originalYearlyPrice - plan.yearlyPrice;
  };

  const handleGetStarted = (planName) => {
    if (!user) {
      navigate("/sign-in");
    } else {
      navigate(`/payment?plan=${planName}&cycle=${billingPeriod}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8">
            <SparklesIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core distribution features 
            with no hidden fees or setup costs.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 mb-12">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                billingPeriod === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-white hover:text-gray-200'
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-400 text-green-900 text-xs px-2 py-1 rounded-full">
                Save up to 20%
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div className={`relative bg-white rounded-3xl border-2 ${
                  plan.popular 
                    ? 'border-transparent shadow-2xl' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                } p-8 transition-all duration-300 ${plan.popular ? 'bg-gradient-to-b from-purple-50 to-pink-50' : ''}`}>
                  
                  {/* Gradient Border for Popular Plan */}
                  {plan.popular && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-3xl opacity-20`}></div>
                      <div className="absolute inset-[2px] bg-white rounded-3xl"></div>
                    </>
                  )}

                  <div className="relative z-10">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl mb-6`}>
                        <plan.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      
                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-5xl font-bold text-gray-900">${getPrice(plan)}</span>
                          <span className="text-gray-500 ml-2">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        
                        {billingPeriod === 'yearly' && (
                          <div className="text-sm">
                            <span className="line-through text-gray-400">${plan.originalYearlyPrice}</span>
                            <span className="text-green-600 font-medium ml-2">{plan.savings}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleGetStarted(plan.name)}
                        className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          plan.popular
                            ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {plan.cta}
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </button>
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All plans include our powerful core features designed to help you distribute, 
              track, and monetize your music effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Can I change my plan at any time?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied, contact our support team for a full refund."
              },
              {
                question: "How quickly will my music be distributed?",
                answer: "Most releases go live within 24-48 hours, though some platforms may take up to 7 days. We'll notify you once your music is live everywhere."
              },
              {
                question: "Do I keep the rights to my music?",
                answer: "Absolutely! You retain 100% ownership and rights to your music. We're just the distributor - you're always the owner."
              },
              {
                question: "Can I distribute cover songs?",
                answer: "Yes, but you'll need to obtain mechanical licenses. We can help guide you through this process for major territories."
              }
            ].map((faq, index) => (
              <details key={index} className="bg-gray-50 rounded-xl border border-gray-200">
                <summary className="p-6 cursor-pointer font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {faq.question}
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Still have questions? Our team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
