import React, { useState, useEffect } from 'react';
import { 
  StarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MusicalNoteIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/solid';
import { PlayIcon } from '@heroicons/react/24/outline';

const ModernTestimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Independent Artist",
      genre: "Pop/R&B",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "This platform completely changed my music career. Within 3 months, my streams went from zero to over 100K across all platforms. The analytics are incredible!",
      rating: 5,
      streams: "2.5M",
      revenue: "$8,400",
      platforms: 45
    },
    {
      id: 2,
      name: "Marcus Chen",
      role: "Hip-Hop Producer",
      genre: "Hip-Hop/Trap",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "The fastest distribution I've ever experienced. My beats are live on Spotify in hours, not weeks. Plus, keeping 100% of my royalties is a game-changer.",
      rating: 5,
      streams: "5.2M",
      revenue: "$15,600",
      platforms: 52
    },
    {
      id: 3,
      name: "Luna Rodriguez",
      role: "Singer-Songwriter",
      genre: "Indie/Folk",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "As an independent artist, having detailed analytics and direct payouts has been amazing. I can finally focus on creating music instead of worrying about distribution.",
      rating: 5,
      streams: "1.8M",
      revenue: "$5,200",
      platforms: 38
    },
    {
      id: 4,
      name: "DJ Velocity",
      role: "Electronic Music Producer",
      genre: "EDM/House",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "The platform's reach is incredible. My tracks are now playing in clubs worldwide thanks to their extensive distribution network. Customer support is top-notch too!",
      rating: 5,
      streams: "3.7M",
      revenue: "$12,100",
      platforms: 48
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-blue-700">Artist Success Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real artists,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              real results
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how independent artists are building successful careers with our platform.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              
              {/* Left Side - Testimonial */}
              <div className="p-8 lg:p-12">
                <div className="mb-8">
                  <ChatBubbleLeftIcon className="w-12 h-12 text-blue-500 mb-6" />
                  <blockquote className="text-xl lg:text-2xl text-gray-800 leading-relaxed mb-8">
                    "{current.content}"
                  </blockquote>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={current.image}
                      alt={current.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{current.name}</h4>
                      <p className="text-blue-600 font-medium">{current.role}</p>
                      <p className="text-sm text-gray-500">{current.genre}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12 text-white">
                <h3 className="text-2xl font-bold mb-8">Artist Performance</h3>
                
                <div className="space-y-8">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100">Total Streams</span>
                      <MusicalNoteIcon className="w-5 h-5 text-blue-200" />
                    </div>
                    <div className="text-3xl font-bold">{current.streams}</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100">Revenue Generated</span>
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold">{current.revenue}</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100">Platforms Reached</span>
                      <span className="text-2xl">🌍</span>
                    </div>
                    <div className="text-3xl font-bold">{current.platforms}</div>
                  </div>
                </div>

                {/* Sample Track */}
                <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                    </button>
                    <div>
                      <div className="text-sm font-medium">Latest Release</div>
                      <div className="text-xs text-blue-100">Preview Track</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Artists</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">50M+</div>
            <div className="text-gray-600">Total Streams</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">$2M+</div>
            <div className="text-gray-600">Paid to Artists</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">150+</div>
            <div className="text-gray-600">Platforms</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernTestimonials;
