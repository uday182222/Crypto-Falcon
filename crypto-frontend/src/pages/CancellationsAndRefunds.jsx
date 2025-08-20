import React from 'react';
import { 
  RotateCcw, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle, 
  Building, 
  Globe, 
  FileText, 
  Users, 
  Lock, 
  Scale, 
  Info,
  Coins,
  CreditCard,
  UserCheck,
  Ban,
  BookOpen,
  Calendar,
  MapPin
} from 'lucide-react';

const CancellationsAndRefunds = () => {
  const mockCashPackages = [
    { name: "Crypto Crumbs", price: "₹10", units: "100,000 Mock Cash Units" },
    { name: "Rookie Pack", price: "₹20", units: "200,000 Mock Cash Units" },
    { name: "Lambo Baron", price: "₹50", units: "500,000 Mock Cash Units" },
    { name: "Ramen Bubble", price: "₹100", units: "1,000,000 Mock Cash Units" },
    { name: "Digi Dynasty", price: "₹250", units: "2,500,000 Mock Cash Units" },
    { name: "Block Mogul", price: "₹500", units: "5,000,000 Mock Cash Units" },
    { name: "Satoshi's Vault", price: "₹1000", units: "100,000,000 Mock Cash Units" }
  ];

  const paymentMethods = [
    { name: "Credit/Debit Cards", methods: ["Visa", "Mastercard", "RuPay"] },
    { name: "Digital Wallets", methods: ["Paytm", "PhonePe", "Google Pay", "Amazon Pay"] },
    { name: "UPI", methods: ["All UPI-enabled applications"] },
    { name: "Net Banking", methods: ["Major Indian banks"] },
    { name: "App Store Purchases", methods: ["Apple App Store", "Google Play Store"] }
  ];

  const refundEligibility = [
    { 
      title: "Technical Issues", 
      description: "Platform failure caused by us that prevents purchased virtual currency from being credited to your account",
      eligible: true,
      icon: CheckCircle,
      color: "green"
    },
    { 
      title: "Billing Errors", 
      description: "Incorrect charges or duplicate transactions confirmed by our investigation",
      eligible: true,
      icon: CheckCircle,
      color: "green"
    },
    { 
      title: "Unauthorized Transactions", 
      description: "Fraudulent charges (subject to thorough investigation)",
      eligible: true,
      icon: CheckCircle,
      color: "green"
    },
    { 
      title: "Service Unavailability", 
      description: "Extended service outages exceeding 48 hours that prevent service usage",
      eligible: true,
      icon: CheckCircle,
      color: "green"
    },
    { 
      title: "Change of Mind", 
      description: "Buyer's remorse or accidental purchases",
      eligible: false,
      icon: XCircle,
      color: "red"
    },
    { 
      title: "User Error", 
      description: "Inability to use virtual currency effectively",
      eligible: false,
      icon: XCircle,
      color: "red"
    },
    { 
      title: "Dissatisfaction", 
      description: "Dissatisfaction with educational content quality",
      eligible: false,
      icon: XCircle,
      color: "red"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-500/20 rounded-full border border-orange-400/30">
              <RotateCcw className="w-12 h-12 text-orange-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 mb-6">
            Cancellation and Refund Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Clear and transparent policies for cancellations and refunds on our crypto trading simulation platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Effective Date:</strong> January 15, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Last Updated:</strong> January 15, 2025</span>
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
                This Cancellation and Refund Policy ("Policy") explains the terms under which BitcoinPro
                ("Company," "we," "our," or "us") accepts cancellations and offers refunds for purchases made
                within our BitcoinPro crypto trading simulation platform ("Service," "Platform," "Game," or "App").
              </p>
              <p>
                This Policy applies to all users and should be read in conjunction with our Terms of Service and
                Privacy Policy. By making any purchase or using our Service, you acknowledge that you have
                read, understood, and agree to be bound by this Policy.
              </p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-l-4 border-blue-500 p-6 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-300 text-lg mb-2">Important Notice</p>
                    <p className="text-gray-200">
                      This Policy complies with the Consumer Protection Act, 2019, and other applicable
                      Indian consumer protection laws, while ensuring fair treatment for all users globally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: General Policy Overview */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-purple-400">2. General Policy Overview</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-purple-300 mb-6 flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              2.1 Nature of Our Service
            </h3>
            <div className="text-gray-300 space-y-4 mb-8">
              <p className="text-lg">Our Service provides:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Educational Content: Cryptocurrency trading tutorials and learning materials',
                  'Simulation Environment: Virtual trading platform for practice and learning',
                  'Virtual Currency: "Mock Cash" for use exclusively within the simulation',
                  'Premium Features: Enhanced functionality and advanced tools (if applicable)'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-purple-300 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              2.2 Virtual Product Characteristics
            </h3>
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-l-4 border-red-500 p-6 rounded-r-xl mb-6">
              <p className="font-semibold text-red-300 text-lg mb-4">Critical Understanding - Please Read Carefully:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'No Real Value: All virtual products have no real-world monetary value',
                  'Educational Purpose: Products are designed for learning and entertainment only',
                  'Instant Delivery: Virtual goods are delivered instantaneously within the app',
                  'Non-Transferable: Virtual assets cannot be transferred, sold, or exchanged',
                  'Platform-Dependent: All purchases are tied to your account and our Platform',
                  'No Investment: Purchases do not constitute investments or securities'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border-l-4 border-orange-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-300 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-300 text-lg mb-2">2.3 Final Sale Policy</p>
                  <p className="text-gray-200">
                    All purchases made within the Service are final and non-refundable, except as explicitly
                    described in this Policy or required by applicable law.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Purchasable Products and Services */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Coins className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-green-400">3. Purchasable Products and Services</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-green-300 mb-6 flex items-center gap-3">
              <Coins className="w-5 h-5" />
              3.1 Virtual Currency (Mock Cash) Packages
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {mockCashPackages.map((pkg, index) => (
                <div key={index} className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50 hover:border-green-500/50 transition-all duration-300">
                  <h4 className="font-semibold text-white mb-2">{pkg.name}</h4>
                  <p className="text-green-400 font-bold text-lg mb-1">{pkg.price}</p>
                  <p className="text-gray-300 text-sm">{pkg.units}</p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-semibold text-green-300 mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5" />
              3.2 Premium Features and Subscriptions
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                'Advanced Analytics: Enhanced performance tracking and insights',
                'Priority Support: Faster customer service response times',
                'Exclusive Content: Access to premium educational materials',
                'Custom Scenarios: Personalized trading simulation environments'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Payment Methods and Processing */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-blue-400">4. Payment Methods and Processing</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              4.1 Accepted Payment Methods
            </h3>
            <p className="text-gray-300 mb-4">We accept payments through the following secure Razorpay:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                  <h4 className="font-semibold text-white mb-2">{method.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {method.methods.map((subMethod, subIndex) => (
                      <span key={subIndex} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 border border-blue-500/30">
                        {subMethod}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-3">
              <Lock className="w-5 h-5" />
              4.2 Payment Processing
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'All payments are processed through certified third-party payment gateways',
                'Transactions are secured with industry-standard encryption',
                'We do not store your payment information on our servers',
                'Payment confirmation is required before service activation',
                'GST and applicable taxes are included in displayed prices'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Cancellation Policy */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <RotateCcw className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-400">5. Cancellation Policy</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-yellow-300 mb-6 flex items-center gap-3">
              <RotateCcw className="w-5 h-5" />
              5.1 Purchase Cancellations
            </h3>
            <div className="space-y-4 mb-8">
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                <h4 className="font-semibold text-white mb-4">Virtual Currency Purchases:</h4>
                <div className="space-y-3 text-gray-300">
                  <p>• Since purchases are for virtual goods and instantaneously delivered within the app, we generally do not allow cancellation once a purchase is completed</p>
                  <p>• If a purchase is still pending or has not been processed by the payment provider, you may attempt to cancel through the respective payment platform</p>
                </div>
              </div>
              
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                <h4 className="font-semibold text-white mb-4">Subscription Cancellations:</h4>
                <div className="space-y-3 text-gray-300">
                  <p>• Monthly subscriptions can be cancelled anytime before the next billing cycle</p>
                  <p>• Annual subscriptions can be cancelled with pro-rated refunds (see Section 6)</p>
                  <p>• Premium feature subscriptions follow the same cancellation rules</p>
                  <p>• Cancellation takes effect at the end of the current billing period</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Refund Policy */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-red-400">6. Refund Policy</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-red-300 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              6.1 General Refund Principles
            </h3>
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-l-4 border-red-500 p-6 rounded-r-xl">
                <h4 className="font-semibold text-red-300 text-lg mb-3">Virtual Currency (Mock Cash) - NO REFUNDS:</h4>
                <div className="space-y-2 text-gray-200">
                  <p>• All Mock Cash purchases are final and non-refundable</p>
                  <p>• Mock Cash has no real-world value and cannot be converted to money</p>
                  <p>• Unused Mock Cash cannot be refunded upon account closure</p>
                  <p>• This policy is clearly disclosed before every purchase</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-red-300 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              6.2 Limited Refund Eligibility
            </h3>
            <p className="text-gray-300 mb-6">Refunds may be granted ONLY in the following circumstances:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {refundEligibility.map((item, index) => (
                <div key={index} className={`bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-${item.color}-500/50 transition-all duration-300`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 bg-${item.color}-500/20 rounded-lg`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    </div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                  <div className={`mt-3 px-2 py-1 bg-${item.color}-500/20 rounded text-xs text-${item.color}-300 border border-${item.color}-500/30 inline-block`}>
                    {item.eligible ? 'Eligible for Refund' : 'Not Eligible for Refund'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Consumer Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Scale className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-indigo-400">7. Consumer Rights (Indian Users)</h2>
            </div>
            
            <h3 className="text-2xl font-semibold text-indigo-300 mb-6 flex items-center gap-3">
              <Scale className="w-5 h-5" />
              7.1 Consumer Protection Act, 2019 Compliance
            </h3>
            <div className="text-gray-300 space-y-4">
              <p className="text-lg">As per Indian consumer protection laws, you have the right to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Receive clear information about products and services before purchase',
                  'Seek remedy for defective goods or deficient services',
                  'File complaints with consumer forums for unresolved disputes',
                  'Fair treatment and protection against unfair trade practices'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 8: Contact Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-green-400">8. Contact Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  Company Details
                </h4>
                <div className="space-y-2 text-gray-300">
                  <p><strong>BitcoinPro</strong></p>
                  <p>Email: support@bitcoinpro.in</p>
                  <p>Website: bitcoinpro.in</p>
                </div>
              </div>
              
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Department Contacts
                </h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p><strong>Refunds:</strong> support@bitcoinpro.in</p>
                  <p><strong>Billing:</strong> info@bitcoinpro.in</p>
                  <p><strong>Technical Support:</strong> support@bitcoinpro.in</p>
                  <p><strong>Legal:</strong> info@bitcoinpro.in</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Declaration */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-l-4 border-orange-500 p-6 rounded-r-xl">
              <h3 className="text-2xl font-bold text-orange-300 mb-4">Final Declaration</h3>
              <p className="text-gray-200 mb-4">
                This Cancellation and Refund Policy is effective as of January 15, 2025 and was last
                updated on January 15, 2025.
              </p>
              <p className="text-gray-200 mb-4">By using our Service and making any purchases, you acknowledge that you have:</p>
              <div className="space-y-2 text-gray-200">
                <p>• Read and understood this entire Policy</p>
                <p>• Understood the virtual nature of all products</p>
                <p>• Agreed to the "no refund" policy for virtual currency</p>
                <p>• Accepted the limited circumstances for refunds</p>
                <p>• Agreed to be bound by this Policy and our Terms of Service</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-600 text-center">
            <div className="bg-slate-700/30 p-6 rounded-xl">
              <p className="text-gray-300 mb-4 text-lg">
                We are committed to providing excellent customer service while maintaining fair and clear
                policies.
              </p>
              <p className="text-gray-400">
                For the most current version of this Policy, please visit our website or contact our customer support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationsAndRefunds;
