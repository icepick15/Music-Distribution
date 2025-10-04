import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaYoutube,
  FaSpotify,
  FaApple,
  FaArrowUp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  SparklesIcon, 
  UserGroupIcon,
  GiftIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-black text-white overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 px-6 md:px-16 py-16">
        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute top-6 right-6 md:top-8 md:right-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Back to top"
        >
          <FaArrowUp className="group-hover:animate-bounce" />
        </button>

        <div className="max-w-7xl mx-auto">
          {/* Top Section - Brand & Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MusicalNoteIcon className="h-8 w-8 text-purple-400" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Music Distribution
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Your music, everywhere. Distribute your tracks to all major streaming platforms 
                with ease. Professional music distribution made simple.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <ShieldCheckIcon className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-300">Secure Platform</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <BoltIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-gray-300">Fast Distribution</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-purple-400" />
                  <span>support@musicdist.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-purple-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Get Started</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Sign Up Free</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Pricing Plans</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Music Distribution</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Vevo Channel</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Music Promotion</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Analytics & Insights</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources & Referral */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/help#faq" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                  </Link>
                </li>
                <li className="pt-2 border-t border-gray-800">
                  <Link to="/join" className="text-purple-400 hover:text-pink-400 transition flex items-center space-x-1 group font-medium">
                    <GiftIcon className="h-4 w-4" />
                    <span className="group-hover:translate-x-1 transition-transform">Referral Program</span>
                    <SparklesIcon className="h-3 w-3 animate-pulse" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Streaming Platforms Section */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <p className="text-center text-sm text-gray-400 mb-4">Distribute to all major platforms:</p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500">
              <FaSpotify className="text-2xl hover:text-green-500 transition-colors cursor-pointer" title="Spotify" />
              <FaApple className="text-2xl hover:text-gray-300 transition-colors cursor-pointer" title="Apple Music" />
              <FaYoutube className="text-2xl hover:text-red-500 transition-colors cursor-pointer" title="YouTube Music" />
              <span className="text-sm font-semibold hover:text-purple-400 transition-colors cursor-pointer">Amazon Music</span>
              <span className="text-sm font-semibold hover:text-orange-400 transition-colors cursor-pointer">SoundCloud</span>
              <span className="text-sm font-semibold hover:text-blue-400 transition-colors cursor-pointer">Deezer</span>
              <span className="text-sm font-semibold hover:text-pink-400 transition-colors cursor-pointer">Tidal</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-gray-500">
                <p>&copy; {currentYear} Music Distribution. All Rights Reserved</p>
                <span className="hidden md:inline">•</span>
                <p>Made with ❤️ for artists</p>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-purple-600 p-2.5 rounded-full transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-sm" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-blue-500 p-2.5 rounded-full transition-all hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-sm" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-pink-600 p-2.5 rounded-full transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-sm" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-blue-700 p-2.5 rounded-full transition-all hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn className="text-sm" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-red-600 p-2.5 rounded-full transition-all hover:scale-110"
                  aria-label="YouTube"
                >
                  <FaYoutube className="text-sm" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
