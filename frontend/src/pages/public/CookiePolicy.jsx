import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Cookie className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Cookie <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Learn about how we use cookies and similar technologies to enhance your experience.
          </p>
          <p className="text-sm text-gray-500">Last updated: August 28, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our platform, and personalizing content.
                </p>
                <p className="text-gray-600">
                  This Cookie Policy explains what cookies we use, why we use them, and how you can manage your cookie preferences.
                </p>
              </div>

              {/* Types of Cookies */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Settings className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
                </div>
                
                {/* Essential Cookies */}
                <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-3">
                    These cookies are necessary for our website to function properly. They enable basic features like page navigation, access to secure areas, and user authentication.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Login session management</li>
                    <li>Security and fraud prevention</li>
                    <li>Shopping cart functionality</li>
                    <li>Load balancing</li>
                  </ul>
                  <p className="text-sm text-blue-700 mt-3 font-medium">These cannot be disabled as they are essential for the website to work.</p>
                </div>

                {/* Analytics Cookies */}
                <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-600 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Page views and user behavior</li>
                    <li>Traffic sources and referrals</li>
                    <li>Performance optimization</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                  <p className="text-sm text-green-700 mt-3 font-medium">Used to improve our website performance and user experience.</p>
                </div>

                {/* Functional Cookies */}
                <div className="mb-8 p-6 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Functional Cookies</h3>
                    <ToggleRight className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-gray-600 mb-3">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Form data and progress saving</li>
                    <li>Personalized content recommendations</li>
                  </ul>
                  <p className="text-sm text-purple-700 mt-3 font-medium">Make your experience more convenient and personalized.</p>
                </div>

                {/* Marketing Cookies */}
                <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                    <ToggleLeft className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-gray-600 mb-3">
                    These cookies are used to deliver relevant advertisements and track marketing campaign effectiveness.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Targeted advertising</li>
                    <li>Campaign performance tracking</li>
                    <li>Social media integration</li>
                    <li>Retargeting and remarketing</li>
                  </ul>
                  <p className="text-sm text-orange-700 mt-3 font-medium">Requires your consent and can be disabled at any time.</p>
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                <p className="text-gray-600 mb-4">
                  We work with trusted third-party services that may also set cookies on your device:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
                    <p className="text-sm text-gray-600">Website analytics and performance tracking</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Stripe</h3>
                    <p className="text-sm text-gray-600">Payment processing and fraud prevention</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Intercom</h3>
                    <p className="text-sm text-gray-600">Customer support and live chat</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Cloudflare</h3>
                    <p className="text-sm text-gray-600">Content delivery and security</p>
                  </div>
                </div>
              </div>

              {/* Cookie Duration */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Session Cookies</h3>
                      <p className="text-sm text-gray-600">Deleted when you close your browser</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">Temporary</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Persistent Cookies</h3>
                      <p className="text-sm text-gray-600">Remain until expiration or manual deletion</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">30 days - 2 years</span>
                  </div>
                </div>
              </div>

              {/* Managing Cookies */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Settings</h3>
                <p className="text-gray-600 mb-4">
                  You can manage your cookie preferences through our cookie consent banner or by visiting our cookie settings page. You can:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Accept or reject non-essential cookies</li>
                  <li>Change your preferences at any time</li>
                  <li>View detailed information about each cookie type</li>
                  <li>Access links to third-party privacy policies</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-600 mb-4">
                  You can also control cookies through your browser settings:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Block all cookies or specific types</li>
                  <li>Delete existing cookies</li>
                  <li>Set notifications for new cookies</li>
                  <li>Browse in incognito/private mode</li>
                </ul>

                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Disabling essential cookies may affect website functionality and prevent you from using certain features.
                  </p>
                </div>
              </div>

              {/* Updates */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                <p className="text-gray-600">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by updating the "Last updated" date at the top of this policy.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li><strong>Email:</strong> privacy@musicdistribution.com</li>
                  <li><strong>Address:</strong> 123 Music Street, Sound City, SC 12345</li>
                  <li><strong>Cookie Settings:</strong> <Link to="/cookie-settings" className="text-purple-600 hover:text-purple-800">Manage Preferences</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
