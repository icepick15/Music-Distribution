import React from 'react';
import { 
  GlobeAltIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  MusicalNoteIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const ModernFeatures = () => {
  const features = [
    {
      icon: GlobeAltIcon,
      title: "Global Distribution",
      description: "Reach 150+ streaming platforms worldwide including Spotify, Apple Music, Amazon Music, and more.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: ChartBarIcon,
      title: "Real-Time Analytics",
      description: "Track your performance with detailed analytics, streaming data, and revenue insights in real-time.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: CurrencyDollarIcon,
      title: "Keep 100% Royalties",
      description: "You keep all your royalties. No hidden fees, no revenue sharing. What you earn is yours.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description: "Get your music live on all platforms in under 24 hours. The fastest distribution in the industry.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: ShieldCheckIcon,
      title: "Content Protection",
      description: "Advanced content ID protection and copyright management to secure your intellectual property.",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: MusicalNoteIcon,
      title: "Unlimited Releases",
      description: "Release as many singles, albums, and EPs as you want. No limits, no extra charges.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { number: "150+", label: "Streaming Platforms", icon: GlobeAltIcon },
    { number: "24hrs", label: "Average Release Time", icon: ClockIcon },
    { number: "100%", label: "Royalty Retention", icon: CurrencyDollarIcon },
    { number: "10K+", label: "Active Artists", icon: MusicalNoteIcon }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 mb-6">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Why Choose Us</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              succeed in music
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From distribution to analytics, we provide all the tools independent artists 
            need to build a successful music career.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
                <div className="absolute inset-[1px] bg-white rounded-2xl z-10"></div>
                
                {/* Content */}
                <div className="relative z-20">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to distribute your music?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of artists who trust us with their music distribution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
              </a>
              <a
                href="/pricing"
                className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold border border-gray-300 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernFeatures;
