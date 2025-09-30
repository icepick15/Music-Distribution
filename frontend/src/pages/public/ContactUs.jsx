import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

// API service for contact messages
const contactAPI = {
  async submitMessage(messageData) {
    const response = await fetch('/api/support/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit message');
    }
    
    return response.json();
  }
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const [formState, setFormState] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null,
    fieldErrors: {}
  });

  // Exact categories from our backend model
  const categories = [
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'distribution', label: 'Music Distribution' },
    { value: 'royalties', label: 'Royalties & Analytics' },
    { value: 'account', label: 'Account Issues' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' }
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : null;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
      case 'subject':
        return value.length < 5 ? 'Subject must be at least 5 characters' : null;
      case 'category':
        return !value ? 'Please select a category' : null;
      case 'message':
        return value.length < 10 ? 'Message must be at least 10 characters' : null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field error when user starts typing
    if (formState.fieldErrors[name]) {
      setFormState(prev => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [name]: null
        }
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setFormState(prev => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [name]: error
        }
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const fieldErrors = validateForm();
    if (Object.keys(fieldErrors).length > 0) {
      setFormState(prev => ({
        ...prev,
        fieldErrors
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      await contactAPI.submitMessage(formData);
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true,
        error: null
      }));

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message
      }));
    }
  };

  const resetForm = () => {
    setFormState({
      isSubmitting: false,
      isSubmitted: false,
      error: null,
      fieldErrors: {}
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@musicdistribution.com",
      available: "24/7"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our support team",
      contact: "+1 (555) 123-MUSIC",
      available: "Mon-Fri, 9AM-6PM PST"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available on our website",
      available: "Mon-Fri, 9AM-6PM PST"
    }
  ];

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Music Street, Suite 100",
      details: "San Francisco, CA 94102",
      type: "Headquarters"
    },
    {
      city: "New York",
      address: "456 Sound Avenue, Floor 15",
      details: "New York, NY 10001",
      type: "East Coast Office"
    },
    {
      city: "Los Angeles",
      address: "789 Artist Boulevard",
      details: "Los Angeles, CA 90210",
      type: "Artist Relations Hub"
    }
  ];

  // Success state component
  if (formState.isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We've received your message and will get back to you within 24 hours.
          </p>
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium"
            >
              Send Another Message
            </button>
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Contact <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="font-medium text-gray-900 mb-1">{method.contact}</p>
                <p className="text-sm text-gray-500">{method.available}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
              
              {/* Error Alert */}
              {formState.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Failed to send message</p>
                    <p className="text-red-600 text-sm mt-1">{formState.error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                        formState.fieldErrors.name 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      }`}
                      placeholder="Your full name"
                    />
                    {formState.fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                        formState.fieldErrors.email 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      }`}
                      placeholder="your@email.com"
                    />
                    {formState.fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                      formState.fieldErrors.category 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {formState.fieldErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                      formState.fieldErrors.subject 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    }`}
                    placeholder="Brief description of your inquiry"
                  />
                  {formState.fieldErrors.subject && (
                    <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none ${
                      formState.fieldErrors.message 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    }`}
                    placeholder="Please provide as much detail as possible..."
                  />
                  {formState.fieldErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{formState.fieldErrors.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.message.length}/500 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className={`w-full inline-flex items-center justify-center px-8 py-4 rounded-xl transition-all duration-300 font-medium text-lg ${
                    formState.isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {formState.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're an artist looking to distribute your music or have questions about our services, our team is here to help you succeed.
              </p>

              {/* Office Locations */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Offices</h3>
                {officeLocations.map((office, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{office.city}</h4>
                      <p className="text-sm text-purple-600 mb-1">{office.type}</p>
                      <p className="text-gray-600 text-sm">{office.address}</p>
                      <p className="text-gray-600 text-sm">{office.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <div className="flex items-center mb-3">
                  <Clock className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM PST</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM PST</p>
                  <p><strong>Sunday:</strong> Closed</p>
                  <p className="text-sm text-purple-600 mt-3">
                    <strong>Emergency Support:</strong> Available 24/7 for urgent issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">How long does distribution take?</h3>
              <p className="text-gray-600 text-sm">Most platforms receive your music within 1-3 business days, though some may take up to 7 days.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">When do I receive royalties?</h3>
              <p className="text-gray-600 text-sm">Royalties are paid monthly with a minimum threshold of $25. Payments are processed within the first week of each month.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Can I update my music after release?</h3>
              <p className="text-gray-600 text-sm">You can update metadata and artwork, but audio files require a new release due to platform policies.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/help" 
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;