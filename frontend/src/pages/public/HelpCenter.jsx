import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, ChevronDown, ChevronUp, Book, MessageCircle, Mail } from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    {
      title: "Getting Started",
      icon: "🚀",
      articles: 12,
      description: "Learn the basics of music distribution"
    },
    {
      title: "Music Distribution",
      icon: "🎵",
      articles: 18,
      description: "Upload and distribute your music worldwide"
    },
    {
      title: "Royalties & Analytics",
      icon: "📊",
      articles: 8,
      description: "Track earnings and performance metrics"
    },
    {
      title: "Account Management",
      icon: "👤",
      articles: 10,
      description: "Manage your profile and settings"
    },
    {
      title: "Billing & Payments",
      icon: "💳",
      articles: 6,
      description: "Payment methods and billing questions"
    },
    {
      title: "Technical Support",
      icon: "🔧",
      articles: 15,
      description: "Troubleshooting and technical issues"
    }
  ];

  const popularArticles = [
    {
      title: "How to Upload Your First Release",
      category: "Getting Started",
      readTime: "5 min read",
      views: "15.2k views"
    },
    {
      title: "Understanding Royalty Payments",
      category: "Royalties & Analytics",
      readTime: "8 min read",
      views: "12.8k views"
    },
    {
      title: "Supported Audio Formats and Quality Requirements",
      category: "Music Distribution",
      readTime: "3 min read",
      views: "11.5k views"
    },
    {
      title: "How to Update Your Artist Profile",
      category: "Account Management",
      readTime: "4 min read",
      views: "9.3k views"
    },
    {
      title: "Troubleshooting Upload Issues",
      category: "Technical Support",
      readTime: "6 min read",
      views: "8.7k views"
    }
  ];

  const faqs = [
    {
      question: "How long does it take for my music to appear on streaming platforms?",
      answer: "Most streaming platforms receive your music within 1-3 business days. However, some platforms may take up to 7 days to make your music live. Spotify typically takes 2-5 business days, Apple Music takes 1-7 days, and smaller platforms may vary."
    },
    {
      question: "When and how do I receive royalty payments?",
      answer: "Royalties are paid monthly with a minimum threshold of $25. Payments are processed within the first week of each month for the previous month's earnings. We support bank transfers and PayPal payments. You can view detailed royalty statements in your dashboard."
    },
    {
      question: "Can I distribute cover songs?",
      answer: "Yes, you can distribute cover songs, but you'll need to obtain a mechanical license first. We partner with services like Easy Song Licensing to help you secure the necessary licenses. You cannot use our service to distribute covers without proper licensing."
    },
    {
      question: "What audio formats do you support?",
      answer: "We accept WAV, FLAC, and high-quality MP3 files (320kbps minimum). For best results, we recommend uploading WAV files at 16-bit/44.1kHz or higher. Files must be under 50MB each and should not contain any silence at the beginning or end."
    },
    {
      question: "Can I update my music after it's been distributed?",
      answer: "You can update metadata (song titles, artist name, genre) and artwork after distribution. However, you cannot change the audio files themselves due to platform policies. If you need to update the audio, you'll need to create a new release."
    },
    {
      question: "How do I remove my music from streaming platforms?",
      answer: "You can request removal of your music through your dashboard. The process typically takes 1-2 weeks, though some platforms may take longer. Note that removal is permanent and you'll need to re-upload if you want to distribute the music again later."
    },
    {
      question: "What percentage of royalties do you take?",
      answer: "Our pricing varies by plan. Our Basic plan takes 15% of royalties, Pro plan takes 10%, and Premium plan takes 0% (flat monthly fee). You keep the majority of your earnings, and we provide transparent reporting on all deductions."
    },
    {
      question: "Do you distribute to TikTok and Instagram?",
      answer: "Yes! We distribute to TikTok, Instagram, Facebook, and other social media platforms through our partnerships. Your music will be available for use in stories, reels, and posts, helping you reach new audiences and potentially go viral."
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Help <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Center</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions and learn how to make the most of our platform.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find the help you need quickly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <p className="text-sm text-purple-600 font-medium">{category.articles} articles</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Articles</h2>
            <p className="text-lg text-gray-600">Most viewed help articles</p>
          </div>

          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span>{article.readTime}</span>
                      <span>{article.views}</span>
                    </div>
                  </div>
                  <Book className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl opacity-90 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
              
              <button className="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/20">
                <MessageCircle className="h-5 w-5 mr-2" />
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
