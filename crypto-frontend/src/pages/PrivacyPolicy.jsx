import React from 'react';
import { Shield, Eye, Lock, Users, FileText, Mail, Phone, MapPin, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/20 rounded-full border border-blue-400/30">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your privacy and data security are our top priorities. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Effective Date:</strong> 20 August, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Last Updated:</strong> 20 August, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16 max-w-5xl">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* Section 1: Introduction */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-blue-400">1. Introduction and Scope</h2>
            </div>
            <div className="text-gray-300 space-y-4 leading-relaxed text-lg">
              <p>
                  This Privacy Policy ("Policy") describes how BitcoinPro ("Company," "we," "our," or "us"), 
                a company incorporated under the laws of India, collects, uses, processes, stores, shares, 
                and protects your personal information when you use our BitcoinPro crypto trading simulation 
                platform ("Service," "Platform," "Game," or "App").
              </p>
              <p>
                This Policy applies to all users of our Service, regardless of how you access or use it 
                (website, mobile app, or other platforms). By using our Service, you acknowledge that you 
                have read, understood, and consent to the practices described in this Policy.
              </p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-l-4 border-blue-500 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-300 text-lg mb-2">Important Notice</p>
                    <p className="text-gray-200">
                      This Policy should be read in conjunction with our Terms of Service, which governs your use 
                      of the Platform. We comply with the Information Technology Act, 2000, the Information 
                      Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or 
                      Information) Rules, 2011, and other applicable Indian data protection laws.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-purple-400">2. Information We Collect</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-purple-300 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5" />
              2.1 Information You Provide Directly
            </h3>
            <div className="text-gray-300 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Account Registration Information
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Full name and username or display name',
                      'Email address (required for registration, login, and communication)',
                      'Phone number (if provided)',
                      'Date of birth and age verification',
                      'Profile picture and biographical information (optional)',
                      'Password and security preferences',
                      'Parental consent information (for users aged 13-17)'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-400" />
                    Payment and Transaction Information
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Billing name and address',
                      'Payment information handled by trusted third-party processors',
                      'Purchase history and transaction records for mock cash purchases',
                      'Mock cash purchase amounts and transaction dates',
                      'Refund and dispute information'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-green-400">3. How We Use Your Information</h2>
            </div>
            <div className="text-gray-300 space-y-6">
              <p className="text-lg">We use collected information for the following purposes:</p>
              
              <h3 className="text-2xl font-semibold text-green-300 mb-6">3.1 Primary Service Functions</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Account Management', desc: 'Creating, maintaining, and managing user accounts', icon: Users, color: 'blue' },
                  { title: 'Service Delivery', desc: 'Providing core crypto trading simulation features', icon: Shield, color: 'green' },
                  { title: 'Transaction Processing', desc: 'Processing and fulfilling mock cash purchases', icon: Lock, color: 'purple' },
                  { title: 'Customer Support', desc: 'Providing technical assistance and support services', icon: Users, color: 'blue' },
                  { title: 'Educational Content', desc: 'Delivering personalized educational content and simulations', icon: FileText, color: 'green' },
                  { title: 'Platform Security', desc: 'Maintaining security, integrity, and preventing unauthorized access', icon: Shield, color: 'red' }
                ].map((item, index) => (
                  <div key={index} className={`bg-slate-700/30 p-5 rounded-xl border border-slate-600/50 hover:border-${item.color}-500/50 transition-all duration-300 hover:bg-slate-700/50`}>
                    <div className={`flex items-center gap-3 mb-3`}>
                      <div className={`p-2 bg-${item.color}-500/20 rounded-lg`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                      </div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-400">4. Data Security and Protection</h2>
            </div>
            <div className="text-gray-300 space-y-6">
              <h3 className="text-2xl font-semibold text-red-300 mb-6">4.1 Security Measures</h3>
              <p className="text-lg">We implement comprehensive security measures to protect your information:</p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 p-6 rounded-xl border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-green-300 text-lg">Technical Safeguards</h4>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Industry-standard encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Secure servers with access controls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Regular security audits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Multi-factor authentication
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-6 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-300 text-lg">Administrative Safeguards</h4>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Employee training
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Background verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Incident response procedures
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      Regular policy reviews
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-6 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-purple-300 text-lg">Physical Safeguards</h4>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Secure data centers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Controlled access facilities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Backup procedures
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      Disaster recovery
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Your Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-400">5. Your Privacy Rights and Choices</h2>
            </div>
            <div className="text-gray-300 space-y-6">
              <h3 className="text-2xl font-semibold text-yellow-300 mb-6">5.1 General Rights</h3>
              <p className="text-lg">You have the following rights regarding your personal information:</p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 p-6 rounded-xl border border-yellow-500/30">
                  <h4 className="font-semibold text-yellow-300 mb-4 text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access and Control
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {[
                      'Access and review your account information',
                      'Update, correct, or modify your profile',
                      'Download your personal data',
                      'Request deletion of your account'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-6 rounded-xl border border-blue-500/30">
                  <h4 className="font-semibold text-blue-300 mb-4 text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Communication Preferences
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {[
                      'Opt out of marketing communications',
                      'Manage notification settings',
                      'Unsubscribe from promotional emails',
                      'Control cookie settings'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Contact Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-indigo-400">6. Contact Information and Support</h2>
            </div>
            <div className="text-gray-300 space-y-6">
              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-8 rounded-xl border border-indigo-500/30">
                <h3 className="text-2xl font-semibold text-indigo-300 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  General Privacy Inquiries
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">BitcoinPro Privacy Team</p>
                        <p className="text-gray-300">Email: info@bitcoinpro.in</p>
                        <p className="text-gray-300">Address: [Company Address]</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Grievance Officer (India)</p>
                        <p className="text-gray-300">Email: support@bitcoinpro.in</p>
                        <p className="text-gray-300 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          Phone: Coming Soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-600 text-center">
            <div className="bg-slate-700/30 p-6 rounded-xl">

              <p className="text-gray-400 mb-4">
                For questions about this Privacy Policy or our data practices, please don't hesitate to
                contact us using the information provided above.
              </p>
              <p className="text-gray-300 text-lg font-semibold">
                ©️ 2025 BitcoinPro is owned by MotionFalcon. All rights reserved. Trade smart, Trade safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
