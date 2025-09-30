import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MusicalNoteIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ModernFooter = () => {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  
  const footerLinks = {
    product: [
      { name: 'Music Distribution', href: '/pricing' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Features', href: '/#features' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/help#faq' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'DMCA', href: '/dmca' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: '𝕏' },
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'YouTube', href: '#', icon: '🎥' }
  ];

  return (
    <footer className={`bg-gray-900 text-white relative z-20 ${isDashboardPage ? 'lg:pl-64' : ''}`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MusicalNoteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MusicDist
              </span>
            </Link>
            
            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Empowering independent artists to reach global audiences through seamless music distribution to 150+ streaming platforms worldwide.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400 text-sm sm:text-base">
                <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">support@musicdist.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400 text-sm sm:text-base">
                <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400 text-sm sm:text-base">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Los Angeles, CA</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 sm:col-span-2 lg:col-span-3">
            
            {/* Product */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6">Product</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.href} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Stay updated with industry news</h3>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Get the latest updates on music distribution, industry trends, and platform changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-xs sm:text-sm order-2 sm:order-1">
              © 2024 MusicDist. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 sm:space-x-6 order-1 sm:order-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-lg sm:text-xl"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Platform Stats */}
            <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-400 order-3">
              <div>150+ Platforms</div>
              <div>•</div>
              <div className="hidden sm:inline">10K+ Artists</div>
              <div className="hidden sm:inline">•</div>
              <div className="hidden sm:inline">50M+ Streams</div>
              <div className="sm:hidden">10K+ Artists</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
