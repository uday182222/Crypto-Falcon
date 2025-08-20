import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Terms of Service
          </h1>
          <div className="text-gray-300 space-y-2">
            <p><strong>Effective Date:</strong> January 1, 2025</p>
            <p><strong>Last Updated:</strong> January 1, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* Section 1: Acceptance and Scope */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Acceptance and Scope of Terms</h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                By accessing, downloading, or using Motion Falcon's crypto trading simulation platform
                ("Service," "Platform," "Game," or "App"), you acknowledge that you have read, understood, and
                agree to be legally bound by these Terms of Service / Conditions ("Terms"). If you do not agree
                to these Terms in their entirety, you must immediately discontinue use of the Service.
              </p>
              <p>
                These Terms constitute a binding legal agreement between you ("User," "you," or "your") and
                Motion Falcon ("Company," "we," "our," or "us").
              </p>
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. Service Description and Educational Purpose</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">2.1 Core Functionality</h3>
            <div className="text-gray-300 space-y-3">
              <p>Motion Falcon provides an educational cryptocurrency trading simulation platform where users can:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Practice cryptocurrency trading strategies using virtual currency with real-time data</li>
                <li>Purchase virtual "Mock Cash" with real money for enhanced gameplay</li>
                <li>Access educational content about cryptocurrency markets and trading principles</li>
                <li>Participate in simulated market activities and competitions</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-purple-300 mb-3 mt-6">2.2 Critical Disclaimers</h3>
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="font-semibold text-red-300 mb-2">IMPORTANT:</p>
              <p className="text-gray-300">
                This is a simulation game designed exclusively for educational and entertainment purposes. Key limitations include:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-gray-300">
                <li><strong>No Real Trading:</strong> No actual cryptocurrencies, securities, or financial instruments are traded, purchased, or exchanged</li>
                <li><strong>Virtual Assets Only:</strong> All trading activities occur with virtual assets that have no real-world monetary value</li>
                <li><strong>Educational Tool:</strong> The Platform serves as a learning environment and should not be considered a substitute for professional financial education</li>
                <li><strong>Simulated Markets:</strong> Market data and price movements may not reflect real-world conditions</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. Eligibility and Account Requirements</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">3.1 Age Requirements</h3>
            <div className="text-gray-300 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Primary Users:</strong> Must be at least 18 years old (or age of majority in your jurisdiction)</li>
                <li><strong>Minor Users:</strong> Ages 13-17 may use the Service only with explicit parental consent and ongoing supervision</li>
                <li><strong>Prohibited:</strong> Users under 13 are strictly prohibited from using the Service</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-purple-300 mb-3 mt-6">3.2 Account Registration</h3>
            <div className="text-gray-300 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Accurate Information:</strong> You must provide truthful, complete, and current registration information</li>
                <li><strong>Single Account Policy:</strong> One account per person; multiple accounts are strictly prohibited</li>
                <li><strong>Security Responsibility:</strong> You are solely responsible for maintaining account confidentiality and security</li>
                <li><strong>Notification Duty:</strong> You must immediately report any unauthorized account access</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Virtual Currency */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Virtual Currency and Payment Terms</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">4.1 Mock Cash System</h3>
            <div className="text-gray-300 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Nature:</strong> "Mock Cash" is virtual currency used exclusively within the Platform</li>
                <li><strong>No Real Value:</strong> Mock Cash has zero real-world value and cannot be exchanged, redeemed, or converted to real money</li>
                <li><strong>Non-Transferable:</strong> Mock Cash cannot be transferred between accounts or sold to third parties</li>
                <li><strong>Expiration:</strong> All Mock Cash expires upon account termination or suspension</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-purple-300 mb-3 mt-6">4.2 Purchase Terms</h3>
            <div className="text-gray-300 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Final Sales:</strong> All Mock Cash purchases are final and non-refundable, except where required by applicable law</li>
                <li><strong>Payment Authorization:</strong> You authorize charges to your selected payment method for all purchases</li>
                <li><strong>Third-Party Processing:</strong> Payments are processed through secure third-party processors</li>
                <li><strong>Price Changes:</strong> Prices may change without prior notice</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Prohibited Activities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">5. Prohibited Activities and Conduct</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">5.1 Strictly Prohibited Activities</h3>
            <div className="text-gray-300 space-y-3">
              <p>Users shall not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any unlawful purposes or activities</li>
                <li>Create multiple accounts to circumvent Platform limitations</li>
                <li>Manipulate, exploit, or abuse game mechanics or systems</li>
                <li>Use bots, scripts, automation tools, or other unauthorized software</li>
                <li>Attempt to hack, compromise, disrupt, or gain unauthorized access to the Service</li>
                <li>Engage in harassment, abuse, threats, or inappropriate behavior toward other users</li>
                <li>Misrepresent the Service as actual cryptocurrency trading or investment</li>
                <li>Sell, transfer, or attempt to monetize accounts or virtual assets</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
              <p className="font-semibold text-yellow-300">Consequences of Violations:</p>
              <p className="text-gray-300">
                Violations may result in immediate account suspension or termination without notice, 
                forfeiture of all virtual assets, and potential legal action.
              </p>
            </div>
          </section>

          {/* Section 6: Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">6. Educational and Financial Disclaimers</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">6.1 Not Financial Advice</h3>
            <div className="text-gray-300 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Service provides entertainment and general educational content only</li>
                <li>Nothing constitutes financial, investment, legal, or tax advice</li>
                <li>Company representatives are not licensed financial advisors</li>
                <li>Users should consult qualified professionals before making real-world investment decisions</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-purple-300 mb-3 mt-6">6.2 Risk Acknowledgment</h3>
            <div className="bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="font-semibold text-orange-300">Users acknowledge that real cryptocurrency and financial market activities involve:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-gray-300">
                <li>Significant financial risk and potential total loss of capital</li>
                <li>Extreme price volatility and market unpredictability</li>
                <li>Regulatory uncertainty and potential legal restrictions</li>
                <li>Technical risks including system failures and security breaches</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">7. Limitation of Liability and Disclaimers</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">7.1 Comprehensive Liability Limitation</h3>
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="font-semibold text-red-300 mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              <p className="text-gray-300 mb-2">Motion Falcon SHALL NOT BE LIABLE FOR:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                <li>Any indirect, incidental, special, consequential, punitive, or exemplary damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Service interruptions, system failures, or data loss</li>
                <li>Damages arising from third-party actions or content</li>
                <li>Any damages exceeding the total amount paid by you to the Company within 30 days preceding the claim</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">8. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">8.1 Governing Law</h3>
            <div className="text-gray-300 space-y-3">
              <p>
                These Terms are governed by and construed in accordance with the laws of Maharashtra,
                Pune, India, without regard to conflict of law principles.
              </p>
            </div>

            <h3 className="text-xl font-medium text-purple-300 mb-3 mt-6">8.2 Mandatory Arbitration</h3>
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="font-semibold text-blue-300">BINDING ARBITRATION CLAUSE:</p>
              <p className="text-gray-300">
                Any dispute, claim, or controversy arising out of or relating to these Terms or the Service 
                shall be resolved exclusively through binding arbitration administered by Motion Falcon in Pune, Maharashtra.
              </p>
            </div>
          </section>

          {/* Section 9: Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">9. Contact Information</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-purple-300 mb-4">For questions, concerns, or legal notices regarding these Terms:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Motion Falcon</strong></p>
                    <p>Email: legal@motionfalcon.com</p>
                    <p>Phone: [PHONE_NUMBER]</p>
                  </div>
                  <div>
                    <p><strong>Address</strong></p>
                    <p>[COMPANY_ADDRESS]</p>
                    <p>Pune, Maharashtra, India</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-600 text-center text-gray-400">
            <p className="text-sm mb-4">
              By creating an account or using Motion Falcon's crypto trading simulation platform, you
              acknowledge that you have carefully read, fully understood, and agree to be legally
              bound by these Terms of Service in their entirety.
            </p>
            <p className="text-sm">
              This document was last updated on January 1, 2025 and becomes effective immediately upon posting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
