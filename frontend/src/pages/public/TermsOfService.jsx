import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Terms of <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please read these terms carefully before using our music distribution platform.
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to Music Distribution! These Terms of Service ("Terms") govern your use of our music distribution platform and services operated by Music Distribution Inc. ("we," "our," or "us").
                </p>
                <p className="text-gray-600">
                  By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our services.
                </p>
              </div>

              {/* Acceptance */}
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>You are at least 18 years old or have parental consent</li>
                  <li>You have the legal capacity to enter into this agreement</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>You own or have rights to the music you distribute through our platform</li>
                </ul>
              </div>

              {/* Services Description */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Services</h2>
                <p className="text-gray-600 mb-4">
                  Music Distribution provides digital music distribution services that allow artists to:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Upload and distribute music to digital streaming platforms</li>
                  <li>Access analytics and performance data</li>
                  <li>Manage artist profiles and metadata</li>
                  <li>Receive royalty payments from music sales and streams</li>
                  <li>Access promotional tools and marketing resources</li>
                </ul>
              </div>

              {/* User Accounts */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
                <p className="text-gray-600 mb-4">
                  When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Maintaining the confidentiality of your account and password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Keeping your account information up to date</li>
                </ul>
              </div>

              {/* Content Rights */}
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <Scale className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Content and Intellectual Property</h2>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Content</h3>
                <p className="text-gray-600 mb-4">
                  You retain ownership of your music, artwork, and other content. By using our services, you grant us a limited license to:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Distribute your music to digital platforms and stores</li>
                  <li>Store and process your content for service delivery</li>
                  <li>Display your content for promotional purposes</li>
                  <li>Create analytical reports based on your content performance</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Requirements</h3>
                <p className="text-gray-600 mb-4">You represent and warrant that your content:</p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Is original or you have all necessary rights and permissions</li>
                  <li>Does not infringe on any third-party rights</li>
                  <li>Complies with all applicable laws and regulations</li>
                  <li>Does not contain harmful, offensive, or illegal material</li>
                </ul>
              </div>

              {/* Prohibited Uses */}
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Prohibited Uses</h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  You may not use our services for any unlawful purpose or to violate any laws. Prohibited activities include:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Uploading content you do not own or have rights to distribute</li>
                  <li>Engaging in copyright infringement or piracy</li>
                  <li>Attempting to manipulate streaming numbers or analytics</li>
                  <li>Using bots, scripts, or automated tools without permission</li>
                  <li>Uploading malicious software or harmful code</li>
                  <li>Harassing, threatening, or impersonating others</li>
                  <li>Violating any platform's terms of service</li>
                </ul>
              </div>

              {/* Payments and Fees */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Fees</h3>
                <p className="text-gray-600 mb-4">
                  Our current pricing structure is available on our pricing page. We reserve the right to change our fees with 30 days notice.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Royalty Payments</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We collect royalties from digital platforms on your behalf</li>
                  <li>Payments are processed monthly with a minimum threshold</li>
                  <li>Payment methods include bank transfer and PayPal</li>
                  <li>We provide detailed royalty statements and analytics</li>
                </ul>
              </div>

              {/* Termination */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by You</h3>
                <p className="text-gray-600 mb-4">
                  You may terminate your account at any time by contacting our support team. Upon termination:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Your music will be removed from distribution within 30 days</li>
                  <li>You will receive any outstanding royalty payments</li>
                  <li>Your account data will be retained for legal and accounting purposes</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination by Us</h3>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account if you:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Upload infringing or unauthorized content</li>
                  <li>Fail to pay required fees</li>
                </ul>
              </div>

              {/* Disclaimers */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitations</h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h3>
                <p className="text-gray-600 mb-4">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. We are not liable for:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Temporary service outages or maintenance</li>
                  <li>Third-party platform policies or changes</li>
                  <li>External factors affecting music distribution</li>
                  <li>Internet connectivity issues</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                <p className="text-gray-600">
                  Our total liability to you for any claim arising from these Terms or our services shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>

              {/* Governing Law */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600">
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of California.
                </p>
              </div>

              {/* Changes to Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or through our platform. Continued use of our services after changes constitutes acceptance of the new Terms.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li><strong>Email:</strong> legal@musicdistribution.com</li>
                  <li><strong>Address:</strong> 123 Music Street, Sound City, SC 12345</li>
                  <li><strong>Phone:</strong> +1 (555) 123-MUSIC</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
