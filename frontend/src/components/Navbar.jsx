import React, { useState, useEffect } from "react";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  MusicalNoteIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowUpTrayIcon,
  HomeIcon,
  LifebuoyIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const dashboardLinks = [
    { name: "Overview", href: "/dashboard", icon: HomeIcon },
    { name: "Music Library", href: "/dashboard/music", icon: MusicalNoteIcon },
    { name: "Analytics", href: "/dashboard/sales", icon: ChartBarIcon },
    { name: "Artist Profile", href: "/dashboard/artist", icon: UserIcon },
    { name: "Support", href: "/dashboard/tickets", icon: LifebuoyIcon },
  ];

  const publicLinks = [
    { name: "Music Distribution", href: "#" },
    { name: "Pricing", href: "/pricing" },
    { name: "Features", href: "#" },
    { name: "Support", href: "#" },
    { name: "Blog", href: "#" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" 
          : "bg-white shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                    <MusicalNoteIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MusicDist
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {user ? (
                <>
                  {/* Dashboard Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('dashboard')}
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      <span>Dashboard</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === 'dashboard' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {activeDropdown === 'dashboard' && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                        {dashboardLinks.map((link, index) => (
                          <Link
                            key={index}
                            to={link.href}
                            onClick={closeDropdown}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          >
                            <link.icon className="w-4 h-4" />
                            <span>{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link 
                    to="/dashboard/music" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Music
                  </Link>
                  <Link 
                    to="/dashboard/sales" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Analytics
                  </Link>
                  <Link 
                    to="/dashboard/tickets" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Support
                  </Link>
                </>
              ) : (
                <>
                  {publicLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Upload Button */}
                  <Link
                    to="/dashboard/music/release"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <span className="font-medium">Upload</span>
                  </Link>

                  {/* User Button */}
                  <div className="flex items-center">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9 ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-200"
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/sign-up"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                {isOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? "max-h-screen opacity-100" 
            : "max-h-0 opacity-0 overflow-hidden"
        }`}>
          <div className="px-4 pt-2 pb-6 bg-white border-t border-gray-200 shadow-lg">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-4 py-4 border-b border-gray-100 mb-4">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                    <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>

                {/* Dashboard links */}
                <div className="space-y-2 mb-6">
                  {dashboardLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Upload button */}
                <Link
                  to="/dashboard/music/release"
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <span>Upload Music</span>
                </Link>
              </>
            ) : (
              <>
                {/* Public navigation */}
                <div className="space-y-2 mb-6">
                  {publicLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Auth buttons */}
                <div className="space-y-3">
                  <Link
                    to="/sign-in"
                    className="block w-full text-center px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/sign-up"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>

      {/* Backdrop overlay for dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          onClick={closeDropdown}
        />
      )}
    </>
  );
};

export default Navbar;
