import React from 'react';
import { Link } from 'react-router-dom';
import { Copyright, FileX, Shield, AlertTriangle, ExternalLink } from 'lucide-react';

const DMCA = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Copyright className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            DMCA <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Digital Millennium Copyright Act compliance and copyright infringement reporting procedures.
          </p>
          <p className="text-sm text-gray-500">Last updated: August 28, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              
              {/* Notice Banner */}
              <div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <h2 className="text-xl font-bold text-red-900">Important Notice</h2>
                </div>
                <p className="text-red-800">
                  Making false copyright claims is illegal and can result in legal consequences. Only submit DMCA notices if you have a good faith belief that the content infringes your copyright.
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">DMCA Compliance</h2>
                <p className="text-gray-600 mb-4">
                  Music Distribution respects the intellectual property rights of others and expects our users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond to valid copyright infringement notices.
                </p>
                <p className="text-gray-600">
                  This policy outlines our procedures for addressing copyright infringement claims and counter-notifications.
                </p>
              </div>

              {/* Copyright Infringement */}
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <FileX className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Reporting Copyright Infringement</h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  If you believe your copyrighted work has been used without permission on our platform, you may submit a DMCA takedown notice. Your notice must include:
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Information</h3>
                  <ul className="list-decimal list-inside text-gray-600 space-y-3">
                    <li>
                      <strong>Your contact information:</strong> Full name, address, phone number, and email address
                    </li>
                    <li>
                      <strong>Identification of copyrighted work:</strong> Description of the work you claim has been infringed
                    </li>
                    <li>
                      <strong>Location of infringing material:</strong> URL or specific location of the content on our platform
                    </li>
                    <li>
                      <strong>Good faith statement:</strong> A statement that you have a good faith belief that the use is not authorized
                    </li>
                    <li>
                      <strong>Accuracy statement:</strong> A statement under penalty of perjury that the information is accurate
                    </li>
                    <li>
                      <strong>Authorization:</strong> A statement that you are authorized to act on behalf of the copyright owner
                    </li>
                    <li>
                      <strong>Physical or electronic signature:</strong> Your signature (physical or electronic)
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Before Filing a Notice</h3>
                  <ul className="list-disc list-inside text-yellow-800 space-y-2">
                    <li>Ensure you own the copyright or are authorized to act on behalf of the owner</li>
                    <li>Consider whether the use might be fair use or otherwise legally permissible</li>
                    <li>Try contacting the user directly to resolve the issue</li>
                    <li>Be aware that false claims may result in legal liability</li>
                  </ul>
                </div>
              </div>

              {/* How to Submit */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Submit a DMCA Notice</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Email</h3>
                    <p className="text-blue-800 mb-2">Send your notice to:</p>
                    <p className="font-mono text-blue-700">dmca@musicdistribution.com</p>
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Mail</h3>
                    <p className="text-green-800 mb-2">Send written notice to:</p>
                    <address className="text-green-700 not-italic">
                      DMCA Agent<br />
                      Music Distribution Inc.<br />
                      123 Music Street<br />
                      Sound City, SC 12345
                    </address>
                  </div>
                </div>
              </div>

              {/* Our Response Process */}
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Our Response Process</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Review</h3>
                      <p className="text-gray-600">We review your notice for completeness and validity within 24-48 hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Action</h3>
                      <p className="text-gray-600">If valid, we remove or disable access to the allegedly infringing content.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Notification</h3>
                      <p className="text-gray-600">We notify the affected user and provide information about the counter-notification process.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counter-Notification */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Counter-Notification Process</h2>
                
                <p className="text-gray-600 mb-4">
                  If you believe your content was removed in error, you may submit a counter-notification that includes:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Your contact information</li>
                  <li>Identification of the removed material and its location</li>
                  <li>A statement under penalty of perjury that the material was removed by mistake</li>
                  <li>Consent to federal court jurisdiction</li>
                  <li>Your physical or electronic signature</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">After Counter-Notification</h3>
                  <p className="text-blue-800 mb-3">
                    We will forward your counter-notification to the original complainant. If they don't file a lawsuit within 10-14 business days, we may restore the content.
                  </p>
                </div>
              </div>

              {/* Repeat Infringers */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Repeat Infringer Policy</h2>
                
                <p className="text-gray-600 mb-4">
                  We maintain a policy of terminating accounts of users who are repeat copyright infringers. This includes:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Users who receive multiple valid DMCA notices</li>
                  <li>Users who repeatedly upload infringing content</li>
                  <li>Users who submit false counter-notifications</li>
                </ul>
              </div>

              {/* Safe Harbor */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe Harbor Provisions</h2>
                
                <p className="text-gray-600 mb-4">
                  Music Distribution qualifies for DMCA safe harbor protections as we:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Do not have actual knowledge of infringing activity</li>
                  <li>Do not receive financial benefit directly attributable to infringing activity</li>
                  <li>Respond expeditiously to remove infringing material when notified</li>
                  <li>Have designated an agent to receive infringement notices</li>
                  <li>Implement a repeat infringer policy</li>
                </ul>
              </div>

              {/* False Claims */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">False Claims and Misrepresentation</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-800 mb-4">
                    <strong>Warning:</strong> Under Section 512(f) of the DMCA, any person who knowingly makes a false claim may be liable for damages, including attorney fees.
                  </p>
                  
                  <p className="text-red-700">
                    This includes both false takedown notices and false counter-notifications. We may pursue legal action against individuals who abuse our DMCA process.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Designated DMCA Agent</h2>
                <p className="text-gray-600 mb-4">
                  Our designated agent for copyright infringement notifications:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Name:</strong> Legal Department</p>
                  <p><strong>Email:</strong> dmca@musicdistribution.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-DMCA</p>
                  <p><strong>Address:</strong></p>
                  <address className="ml-4 not-italic">
                    DMCA Agent<br />
                    Music Distribution Inc.<br />
                    123 Music Street<br />
                    Sound City, SC 12345
                  </address>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    For non-copyright related issues, please contact our 
                    <Link to="/contact" className="text-purple-600 hover:text-purple-800 ml-1">general support team</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DMCA;
