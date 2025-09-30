import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import NotificationDropdown from "./notifications/NotificationDropdown";
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
  LifebuoyIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, isSignedIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { canUpload } = useSubscription();

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
    { name: "Subscription", href: "/dashboard/subscription", icon: CurrencyDollarIcon },
    { name: "Support", href: "/dashboard/tickets", icon: LifebuoyIcon },
  ];

  const publicLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Help", href: "/help" },
    { name: "Contact", href: "/contact" },
  ];

  const userDisplayName = user?.fullName || user?.firstName || 'User';
  const userFirstName = user?.firstName || user?.fullName?.split(' ')[0] || 'User';
  const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || '';
  const userAvatar = user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=3b82f6&color=fff`;

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
              {isSignedIn ? (
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
                    to="/dashboard/subscription" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Subscription
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
              {isSignedIn ? (
                <>
                  {/* Upload Button */}
                  <Link
                    to={canUpload() ? "/upload" : "/dashboard/subscription"}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md font-medium ${
                      canUpload() 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-300 text-gray-600 cursor-pointer hover:bg-gray-400'
                    }`}
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <span>{canUpload() ? 'Upload' : 'Get Plan'}</span>
                  </Link>

                  {/* Notification Dropdown */}
                  <NotificationDropdown />

                  {/* Custom User Button */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <img
                        src={userAvatar}
                        alt={userDisplayName}
                        className="w-8 h-8 rounded-full ring-2 ring-blue-100"
                      />
                      <span className="text-gray-700 font-medium">{userFirstName}</span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        activeDropdown === 'user' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {activeDropdown === 'user' && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                          <p className="text-xs text-gray-500">{userEmail}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Settings
                        </Link>
                        <Link
                          to="/dashboard/subscription"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Subscription
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setActiveDropdown(null);
                            navigate('/');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
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
            {isSignedIn ? (
              <>
                {/* User info */}
                <div className="flex items-center space-x-3 px-4 py-4 border-b border-gray-100 mb-4">
                  <img
                    src={userAvatar}
                    alt={userDisplayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
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
                  
                  {/* Mobile Notifications Link */}
                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-150"
                  >
                    <BellIcon className="w-5 h-5" />
                    <span>Notifications</span>
                  </Link>
                </div>

                {/* Upload button */}
                {canUpload() ? (
                  <Link
                    to="/upload"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Upload Music</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/subscription"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium bg-gray-300 text-gray-600 hover:bg-gray-400"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Get Plan to Upload</span>
                  </Link>
                )}
                
                {/* Sign out button */}
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-center px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 mt-4"
                >
                  Sign Out
                </button>
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
                    to="/login"
                    className="block w-full text-center px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
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
