import React from 'react';
import { FileText, AlertTriangle, Shield, Users, Coins, Lock, Globe, Scale, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle, Info, Gavel, Eye, UserCheck, CreditCard, Ban, BookOpen, AlertCircle, Building, ArrowRight } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-500/20 rounded-full border border-purple-400/30">
              <FileText className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Please read these terms carefully. They govern your use of our platform and outline your rights and responsibilities.
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
          
          {/* Section 1: Acceptance and Scope */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-blue-400">1. Acceptance and Scope of Terms</h2>
            </div>
            <div className="text-gray-300 space-y-4 leading-relaxed text-lg">
              <p>
                By accessing, downloading, or using BitcoinPro's crypto trading simulation platform
                ("Service," "Platform," "Game," or "App"), you acknowledge that you have read, understood, and
                agree to be legally bound by these Terms of Service / Conditions ("Terms"). If you do not agree
                to these Terms in their entirety, you must immediately discontinue use of the Service.
              </p>
              <p>
                These Terms constitute a binding legal agreement between you ("User," "you," or "your") and
                BitcoinPro ("Company," "we," "our," or "us").
              </p>
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-purple-400">2. Service Description and Educational Purpose</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-purple-300 mb-6 flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              2.1 Core Functionality
            </h3>
            <div className="text-gray-300 space-y-4">
              <p className="text-lg">BitcoinPro provides an educational cryptocurrency trading simulation platform where users can:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Practice cryptocurrency trading strategies using virtual currency with real-time data',
                  'Purchase virtual "Mock Cash" with real money for enhanced gameplay',
                  'Access educational content about cryptocurrency markets and trading principles',
                  'Participate in simulated market activities and competitions'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-purple-300 mb-6 mt-8 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              2.2 Critical Disclaimers
            </h3>
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-l-4 border-red-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-300 text-lg mb-3">IMPORTANT NOTICE</p>
                  <p className="text-gray-200 mb-4">
                    This is a simulation game designed exclusively for educational and entertainment purposes. Key limitations include:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: 'No Real Trading', desc: 'No actual cryptocurrencies, securities, or financial instruments are traded, purchased, or exchanged' },
                      { title: 'Virtual Assets Only', desc: 'All trading activities occur with virtual assets that have no real-world monetary value' },
                      { title: 'Educational Tool', desc: 'The Platform serves as a learning environment and should not be considered a substitute for professional financial education' },
                      { title: 'Simulated Markets', desc: 'Market data and price movements may not reflect real-world conditions' }
                    ].map((item, index) => (
                      <div key={index} className="bg-red-800/20 p-4 rounded-lg border border-red-500/30">
                        <h4 className="font-semibold text-red-200 mb-2">{item.title}</h4>
                        <p className="text-gray-300 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Eligibility */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-green-400">3. Eligibility and Account Requirements</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-green-300 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5" />
              3.1 Age Requirements
            </h3>
            <div className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Primary Users', desc: 'Must be at least 18 years old (or age of majority in your jurisdiction)', icon: UserCheck, color: 'green' },
                  { title: 'Minor Users', desc: 'Ages 13-17 may use the Service only with explicit parental consent and ongoing supervision', icon: Users, color: 'blue' },
                  { title: 'Prohibited', desc: 'Users under 13 are strictly prohibited from using the Service', icon: Ban, color: 'red' }
                ].map((item, index) => (
                  <div key={index} className={`bg-slate-700/30 p-5 rounded-xl border border-slate-600/50`}>
                    <div className="flex items-center gap-3 mb-3">
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

            <h3 className="text-2xl font-semibold text-green-300 mb-6 mt-8 flex items-center gap-3">
              <Shield className="w-5 h-5" />
              3.2 Account Registration
            </h3>
            <div className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Accurate Information: You must provide truthful, complete, and current registration information',
                  'Single Account Policy: One account per person; multiple accounts are strictly prohibited',
                  'Security Responsibility: You are solely responsible for maintaining account confidentiality and security',
                  'Notification Duty: You must immediately report any unauthorized account access'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Virtual Currency */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-400">4. Virtual Currency and Payment Terms</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-yellow-300 mb-6 flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              4.1 Mock Cash System
            </h3>
            <div className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Nature: "Mock Cash" is virtual currency used exclusively within the Platform',
                  'No Real Value: Mock Cash has zero real-world value and cannot be exchanged, redeemed, or converted to real money',
                  'Non-Transferable: Mock Cash cannot be transferred between accounts or sold to third parties',
                  'Expiration: All Mock Cash expires upon account termination or suspension'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <Info className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-yellow-300 mb-6 mt-8 flex items-center gap-3">
              <Lock className="w-5 h-5" />
              4.2 Purchase Terms
            </h3>
            <div className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Final Sales: All Mock Cash purchases are final and non-refundable, except where required by applicable law',
                  'Payment Authorization: You authorize charges to your selected payment method for all purchases',
                  'Third-Party Processing: Payments are processed through secure third-party processors',
                  'Price Changes: Prices may change without prior notice'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Prohibited Activities */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Ban className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-400">5. Prohibited Activities and Conduct</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-red-300 mb-6">5.1 Strictly Prohibited Activities</h3>
            <div className="text-gray-300 space-y-4">
              <p className="text-lg">Users shall not:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Use the Service for any unlawful purposes or activities',
                  'Create multiple accounts to circumvent Platform limitations',
                  'Manipulate, exploit, or abuse game mechanics or systems',
                  'Use bots, scripts, automation tools, or other unauthorized software',
                  'Attempt to hack, compromise, disrupt, or gain unauthorized access to the Service',
                  'Engage in harassment, abuse, threats, or inappropriate behavior toward other users',
                  'Misrepresent the Service as actual cryptocurrency trading or investment',
                  'Sell, transfer, or attempt to monetize accounts or virtual assets'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-l-4 border-yellow-500 p-6 rounded-r-xl mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-300 text-lg mb-2">Consequences of Violations</p>
                  <p className="text-gray-200">
                    Violations may result in immediate account suspension or termination without notice, 
                    forfeiture of all virtual assets, and potential legal action.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Disclaimers */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-orange-400">6. Educational and Financial Disclaimers</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-orange-300 mb-6 flex items-center gap-3">
              <Info className="w-5 h-5" />
              6.1 Not Financial Advice
            </h3>
            <div className="text-gray-300 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'The Service provides entertainment and general educational content only',
                  'Nothing constitutes financial, investment, legal, or tax advice',
                  'Company representatives are not licensed financial advisors',
                  'Users should consult qualified professionals before making real-world investment decisions'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-orange-300 mb-6 mt-8 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              6.2 Risk Acknowledgment
            </h3>
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-l-4 border-orange-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-300 text-lg mb-3">Users acknowledge that real cryptocurrency and financial market activities involve:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Significant financial risk and potential total loss of capital',
                      'Extreme price volatility and market unpredictability',
                      'Regulatory uncertainty and potential legal restrictions',
                      'Technical risks including system failures and security breaches'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-orange-800/20 p-3 rounded-lg border border-orange-500/30">
                        <XCircle className="w-4 h-4 text-orange-300 mt-1 flex-shrink-0" />
                        <span className="text-gray-200 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-400">7. Limitation of Liability and Disclaimers</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-red-300 mb-6">7.1 Comprehensive Liability Limitation</h3>
            <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border-l-4 border-red-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-300 text-lg mb-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                  <p className="text-gray-200 mb-4">BitcoinPro SHALL NOT BE LIABLE FOR:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Any indirect, incidental, special, consequential, punitive, or exemplary damages',
                      'Loss of profits, revenue, data, or business opportunities',
                      'Service interruptions, system failures, or data loss',
                      'Damages arising from third-party actions or content',
                      'Any damages exceeding the total amount paid by you to the Company within 30 days preceding the claim'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-red-800/20 p-3 rounded-lg border border-red-500/30">
                        <XCircle className="w-4 h-4 text-red-300 mt-1 flex-shrink-0" />
                        <span className="text-gray-200 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Governing Law */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Gavel className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-indigo-400">8. Governing Law and Dispute Resolution</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-indigo-300 mb-6">8.1 Governing Law</h3>
            <div className="text-gray-300 space-y-4">
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                <p className="text-lg">
                  These Terms are governed by and construed in accordance with the laws of Maharashtra,
                  Pune, India, without regard to conflict of law principles.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-indigo-300 mb-6 mt-8">8.2 Mandatory Arbitration</h3>
            <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border-l-4 border-indigo-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <Scale className="w-6 h-6 text-indigo-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-indigo-300 text-lg mb-2">BINDING ARBITRATION CLAUSE</p>
                  <p className="text-gray-200">
                    Any dispute, claim, or controversy arising out of or relating to these Terms or the Service 
                    shall be resolved exclusively through binding arbitration administered by BitcoinPro in Pune, Maharashtra.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Contact Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-blue-400">9. Contact Information</h2>
            </div>
            <div className="text-gray-300 space-y-6">
              <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-8 rounded-xl border border-blue-500/30">
                <h3 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-3">
                  <Building className="w-6 h-6" />
                  Contact Information for Different Services
                </h3>
                
                {/* TOS Column */}
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-blue-300 mb-4 text-center">TOS</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-blue-200 text-sm">Legal Email</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
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
                    <h4 className="text-xl font-semibold text-green-300 mb-4 text-center">Privacy Policy</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-blue-200 text-sm">Privacy Email</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-green-200 text-sm">Grievance Email</p>
                        <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                      </div>
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                        <p className="font-semibold text-gray-200 text-sm">Data Protection Officer</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-green-200 text-sm">Legal Email</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CNFP Column */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-purple-300 mb-4 text-center">CNFP</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-blue-200 text-sm">General Email</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-green-200 text-sm">Refunds & Cancellation</p>
                        <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-blue-200 text-sm">Billing</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-green-200 text-sm">Tech Support</p>
                        <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-blue-200 text-sm">Legal Compliance</p>
                        <p className="text-gray-300 text-sm">info@bitcoinpro.in</p>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-green-200 text-sm">Grievance</p>
                        <p className="text-gray-300 text-sm">support@bitcoinpro.in</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Company Details */}
                <div className="pt-6 border-t border-blue-500/30">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">BitcoinPro</p>
                        <p className="text-gray-300">Email: info@bitcoinpro.in</p>
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
            <div className="bg-slate-700/30 p-8 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-purple-300">Legal Agreement</h3>
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                By creating an account or using BitcoinPro's crypto trading simulation platform, you
                acknowledge that you have carefully read, fully understood, and agree to be legally
                bound by these Terms of Service in their entirety.
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>This document was last updated on 20 August, 2025 and becomes effective immediately upon posting.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
