import { FaFacebookF, FaTwitter, FaInstagram, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#0f0f23] to-black text-white px-6 md:px-16 py-16 font-sans overflow-hidden">
      {/* Scroll to Top Fancy Button */}
      <button
        onClick={scrollToTop}
        className="absolute top-6 right-6 md:top-8 md:right-10 bg-white text-black p-3 rounded-full shadow-xl border-2 border-transparent hover:border-purple-500 hover:bg-gray-100 hover:text-purple-700 transition-all duration-300 animate-bounce z-50"
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>

      {/* Grid Columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm mt-8">
        {/* Column 1 */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Get Started</h4>
          <ul className="space-y-3">
            <li>
              <a href="/register" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Sign Up
              </a>
            </li>
            <li>
              <a href="/login" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Login
              </a>
            </li>
            <li>
              <a href="/pricing" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Pricing
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Services</h4>
          <ul className="space-y-3">
            <li>
              <a href="/pricing" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Music Submission
              </a>
            </li>
            <li>
              <a href="/pricing" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Vevo Channel
              </a>
            </li>
            <li>
              <a href="/pricing" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Music Promotion
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Support</h4>
          <ul className="space-y-3">
            <li>
              <a href="/help#faq" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                FAQ
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:underline underline-offset-4 hover:text-gray-300 transition">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-10" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} All Rights Reserved</p>
        <div className="flex space-x-6 text-lg">
          <a href="#" className="hover:text-gray-300 transition"><FaFacebookF /></a>
          <a href="#" className="hover:text-gray-300 transition"><FaTwitter /></a>
          <a href="#" className="hover:text-gray-300 transition"><FaInstagram /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
