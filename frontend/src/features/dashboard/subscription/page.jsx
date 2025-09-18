import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import DashboardLayout from "../../../components/DashboardLayout";
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
  ArrowRightIcon,
  TrophyIcon,
  HeartIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  CheckIcon as CheckSolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid';

const plans = [
  {
    name: "Bronze",
    icon: RocketLaunchIcon,
    color: "white",
    gradient: "from-orange-500 to-amber-500",
    yearly: 60000,
    monthly: 5000,
    originalYearly: 72000,
    descriptionYearly: "Perfect for new artists getting started with music distribution",
    descriptionMonthly: "Essential tools for independent artists, billed monthly",
    featuresYearly: [
      "Unlimited releases to 100+ platforms for a year",
      "75% Revenue Pay-out",
      "Monthly Analytics Dashboard",
      "Monthly Royalty Payments",
      "Fast, direct-to-bank royalty payouts",
      "Upload lyrics to music platforms",
      "Chat, Email and WhatsApp Support",
      "Basic content protection"
    ],
    featuresMonthly: [
      "Unlimited releases (1 month)",
      "75% Revenue Pay-out",
      "Basic Analytics",
      "Monthly Royalty Payments",
      "Chat and Email Support"
    ],
    limitations: [
      "Advanced analytics",
      "Priority support queue",
      "Auto-release to new platforms"
    ],
    popular: false,
    savings: "Save ₦12,000"
  },
  {
    name: "Gold",
    icon: StarIcon,
    color: "black",
    gradient: "from-yellow-500 to-orange-500",
    yearly: 80000,
    monthly: 7000,
    originalYearly: 96000,
    descriptionYearly: "Most popular for serious artists looking to scale their career",
    descriptionMonthly: "Advanced distribution and higher royalty split for growing artists",
    featuresYearly: [
      "Everything in Bronze Plan",
      "80% Revenue Pay-out",
      "Advanced Analytics & Insights",
      "Fast, direct-to-bank royalty payouts",
      "Chat, Email and WhatsApp Support", 
      "Priority 24/7 support",
      "Auto-release to new platforms for free",
      "Enhanced content protection",
      "Social media promotion tools"
    ],
    featuresMonthly: [
      "Everything in Bronze Monthly",
      "80% Revenue Pay-out",
      "Priority Email Support",
      "Early access to new tools",
      "Enhanced analytics"
    ],
    limitations: [
      "VIP support access"
    ],
    popular: true,
    savings: "Save ₦16,000"
  },
  {
    name: "Platinum",
    icon: TrophyIcon,
    color: "white",
    gradient: "from-purple-500 to-pink-500",
    yearly: 100000,
    monthly: 8500,
    originalYearly: 120000,
    descriptionYearly: "Ultimate plan for labels and high-volume professionals",
    descriptionMonthly: "Elite features for labels and serious music professionals",
    featuresYearly: [
      "Everything in Bronze & Gold Plans",
      "85% Revenue Pay-out",
      "Real-time Analytics & Reporting",
      "Upload lyrics to music platforms",
      "VIP 24/7 Priority Support",
      "Auto-release to new platforms for free",
      "Advanced AI-powered insights",
      "White-label reporting",
      "Custom playlist pitching",
      "Dedicated account manager"
    ],
    featuresMonthly: [
      "Everything in Gold Monthly",
      "85% Revenue Pay-out",
      "VIP Support Access",
      "AI-powered analytics",
      "Custom reporting"
    ],
    limitations: [],
    popular: false,
    savings: "Save ₦20,000"
  }
];

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("yearly");

  const handleGetStarted = (planName) => {
    if (!user) {
      navigate("/sign-in");
    } else {
      navigate(`/payment?plan=${planName}&cycle=${billingCycle}`);
    }
  };

  const getPrice = (plan) => {
    return billingCycle === "monthly" ? plan.monthly : plan.yearly;
  };

  const getOriginalPrice = (plan) => {
    return billingCycle === "monthly" ? plan.monthly * 12 : plan.originalYearly;
  };

  const getSavings = (plan) => {
    if (billingCycle === "yearly") {
      return plan.originalYearly - plan.yearly;
    }
    return 0;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-16">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Subscription Management</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Scale your music career with the right plan. From independent artists to record labels, 
              we have the perfect solution for your distribution needs.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 mb-12">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "monthly" 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "yearly" 
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
                fill="rgb(249 250 251)"
              />
            </svg>
          </div>
        </div>

        {/* Pricing Cards Section */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Current Plan Status (if applicable) */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-6 py-3">
                <CheckSolidIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Current Plan: Gold (Yearly)</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
              {plans.map((plan, index) => (
                <div key={index} className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
                  
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`bg-gradient-to-r ${plan.gradient} text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2`}>
                        <StarSolidIcon className="w-4 h-4" />
                        <span>Most Popular</span>
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
                        <p className="text-gray-600 mb-6">
                          {billingCycle === "yearly" ? plan.descriptionYearly : plan.descriptionMonthly}
                        </p>
                        
                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-baseline justify-center mb-2">
                            <span className="text-sm text-gray-500 mr-1">₦</span>
                            <span className="text-5xl font-bold text-gray-900">
                              {getPrice(plan) ? getPrice(plan).toLocaleString() : "Coming Soon"}
                            </span>
                            <span className="text-gray-500 ml-2">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </div>
                          
                          {billingCycle === "yearly" && getSavings(plan) > 0 && (
                            <div className="text-sm">
                              <span className="line-through text-gray-400">₦{plan.originalYearly?.toLocaleString()}</span>
                              <span className="text-green-600 font-medium ml-2">{plan.savings}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={() => handleGetStarted(plan.name)}
                          disabled={!getPrice(plan)}
                          className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            !getPrice(plan)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : plan.popular
                              ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {getPrice(plan) ? 'Get Started' : 'Coming Soon'}
                          {getPrice(plan) && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                        </button>
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          What's included:
                        </h4>
                        
                        {/* Included Features */}
                        <ul className="space-y-3">
                          {(billingCycle === "yearly" ? plan.featuresYearly : plan.featuresMonthly).map((feature, featureIndex) => (
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
        </div>

        {/* Features Comparison Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of artists who trust us with their music distribution and career growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: GlobeAltIcon, title: "Global Reach", description: "Distribute to 100+ platforms worldwide", color: "from-blue-500 to-cyan-500" },
                { icon: ChartBarIcon, title: "Real-Time Analytics", description: "Track your performance with detailed insights", color: "from-purple-500 to-pink-500" },
                { icon: CurrencyDollarIcon, title: "Fast Payouts", description: "Get paid quickly with direct bank transfers", color: "from-green-500 to-emerald-500" },
                { icon: ShieldCheckIcon, title: "Content Protection", description: "Advanced copyright management and protection", color: "from-orange-500 to-red-500" }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 bg-gray-50">
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
                  question: "Can I upgrade or downgrade my plan anytime?",
                  answer: "Yes! You can change your subscription plan at any time. Upgrades take effect immediately, and we'll prorate any billing differences."
                },
                {
                  question: "What happens if I cancel my subscription?",
                  answer: "Your music will remain live on all platforms until your current billing period ends. You can reactivate anytime to continue using our services."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied, contact our support team for a full refund."
                },
                {
                  question: "How long does it take to distribute my music?",
                  answer: "Most releases go live within 24-48 hours, though some platforms may take up to 7 days. We'll notify you once your music is live everywhere."
                }
              ].map((faq, index) => (
                <details key={index} className="bg-white rounded-xl border border-gray-200">
                  <summary className="p-6 cursor-pointer font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {faq.question}
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPlans;
