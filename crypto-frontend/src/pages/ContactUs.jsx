import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, User, Building, Globe, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help with your account, trading questions, or technical issues",
      contact: "support@bitcoinpro.in",
      response: "Response within 24 hours",
      color: "blue"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time during business hours",
      contact: "Coming Soon",
      response: "Coming Soon",
      color: "green"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our customer support representatives",
      contact: "Coming Soon",
      response: "Coming Soon",
      color: "purple"
    }
  ];



  const faqs = [
    {
      question: "How do I get started with crypto trading simulation?",
      answer: "Simply create an account, complete the verification process, and start practicing with virtual currency. Our platform provides real-time market data for an authentic trading experience."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We use industry-standard encryption and security measures to protect your data. Your privacy and security are our top priorities."
    },
    {
      question: "Can I use real money for trading?",
      answer: "No, our platform is designed for educational purposes only. We use virtual currency (Mock Cash) that has no real-world value. This allows you to learn without financial risk."
    },
    {
      question: "What if I encounter technical issues?",
      answer: "Our technical support team is available 24/7. You can reach us through email, live chat, or phone support (coming soon) for immediate assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-500/20 rounded-full border border-purple-400/30">
              <MessageCircle className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Have questions about our crypto trading simulation platform? We're here to help! Reach out to our team through any of the methods below.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Support Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Communication</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Expert Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16 max-w-6xl">
        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-${method.color}-500/50 transition-all duration-300 hover:shadow-2xl hover:scale-105`}
              >
                <div className={`flex items-center gap-3 mb-4`}>
                  <div className={`p-3 bg-${method.color}-500/20 rounded-lg`}>
                    <method.icon className={`w-6 h-6 text-${method.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{method.title}</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{method.description}</p>
                <div className="space-y-2">
                  <p className="text-white font-semibold">{method.contact}</p>
                  <p className="text-gray-400 text-sm">{method.response}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Contact Information */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Contact Information by Service Type</h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* TOS Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-300 mb-4 text-center">TOS</h3>
              <div className="space-y-3">
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <p className="font-semibold text-blue-200 text-sm">Legal Email</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                  <p className="font-semibold text-gray-200 text-sm">Phone Number</p>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
            
            {/* Privacy Policy Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-300 mb-4 text-center">Privacy Policy</h3>
              <div className="space-y-3">
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <p className="font-semibold text-blue-200 text-sm">Privacy Email</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-200 text-sm">Grievance Email</p>
                  <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                  <p className="font-semibold text-gray-200 text-sm">Data Protection Officer</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-200 text-sm">Legal Email</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
              </div>
            </div>
            
            {/* CNFP Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-300 mb-4 text-center">CNFP</h3>
              <div className="space-y-3">
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <p className="font-semibold text-blue-200 text-sm">General Email</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-200 text-sm">Refunds & Cancellation</p>
                  <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <p className="font-semibold text-blue-200 text-sm">Billing</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-200 text-sm">Tech Support</p>
                  <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <p className="font-semibold text-blue-200 text-sm">Legal Compliance</p>
                  <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-semibold text-green-200 text-sm">Grievance</p>
                  <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Full Width */}
        <div className="mb-16">
          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-blue-400" />
              Send us a Message
            </h3>
            
            {formStatus === 'success' && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Message sent successfully!</span>
                </div>
                <p className="text-green-200 text-sm mt-1">We'll get back to you within 24 hours.</p>
              </div>
            )}

            {formStatus === 'error' && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">Something went wrong!</span>
                </div>
                <p className="text-red-200 text-sm mt-1">Please try again or contact us directly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                  placeholder="What is this about?"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our support team is dedicated to helping you succeed with crypto trading simulation. 
              Don't hesitate to reach out through any of our contact methods.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@bitcoinpro.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Online Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
