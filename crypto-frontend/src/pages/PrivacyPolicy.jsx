import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Privacy Policy
          </h1>
          <div className="text-gray-300 space-y-2">
            <p><strong>Effective Date:</strong> January 1, 2025</p>
            <p><strong>Last Updated:</strong> January 1, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* Section 1: Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Introduction and Scope</h2>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                This Privacy Policy ("Policy") describes how Motion Falcon ("Company," "we," "our," or "us"), 
                a company incorporated under the laws of India, collects, uses, processes, stores, shares, 
                and protects your personal information when you use our MotionFalcon crypto trading simulation 
                platform ("Service," "Platform," "Game," or "App").
              </p>
              <p>
                This Policy applies to all users of our Service, regardless of how you access or use it 
                (website, mobile app, or other platforms). By using our Service, you acknowledge that you 
                have read, understood, and consent to the practices described in this Policy.
              </p>
              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="font-semibold text-blue-300">Important:</p>
                <p>
                  This Policy should be read in conjunction with our Terms of Service, which governs your use 
                  of the Platform. We comply with the Information Technology Act, 2000, the Information 
                  Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or 
                  Information) Rules, 2011, and other applicable Indian data protection laws.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-purple-300 mb-3">2.1 Information You Provide Directly</h3>
            <div className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Account Registration Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                  <li>Full name and username or display name</li>
                  <li>Email address (required for registration, login, and communication)</li>
                  <li>Phone number (if provided)</li>
                  <li>Date of birth and age verification</li>
                  <li>Profile picture and biographical information (optional)</li>
                  <li>Password and security preferences</li>
                  <li>Parental consent information (for users aged 13-17)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Payment and Transaction Information:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                  <li>Billing name and address</li>
                  <li>Payment information handled by trusted third-party processors</li>
                  <li>Purchase history and transaction records for mock cash purchases</li>
                  <li>Mock cash purchase amounts and transaction dates</li>
                  <li>Refund and dispute information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. How We Use Your Information</h2>
            <div className="text-gray-300 space-y-3">
              <p>We use collected information for the following purposes:</p>
              
              <h3 className="text-xl font-medium text-purple-300 mb-3">3.1 Primary Service Functions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Management:</strong> Creating, maintaining, and managing user accounts</li>
                <li><strong>Service Delivery:</strong> Providing core crypto trading simulation features</li>
                <li><strong>Transaction Processing:</strong> Processing and fulfilling mock cash purchases</li>
                <li><strong>Customer Support:</strong> Providing technical assistance and support services</li>
                <li><strong>Educational Content:</strong> Delivering personalized educational content and simulations</li>
                <li><strong>Platform Security:</strong> Maintaining security, integrity, and preventing unauthorized access</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Data Security and Protection</h2>
            <div className="text-gray-300 space-y-4">
              <h3 className="text-xl font-medium text-purple-300 mb-3">4.1 Security Measures</h3>
              <p>We implement comprehensive security measures to protect your information:</p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">Technical Safeguards</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Industry-standard encryption</li>
                    <li>• Secure servers with access controls</li>
                    <li>• Regular security audits</li>
                    <li>• Multi-factor authentication</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">Administrative Safeguards</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Employee training</li>
                    <li>• Background verification</li>
                    <li>• Incident response procedures</li>
                    <li>• Regular policy reviews</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">Physical Safeguards</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Secure data centers</li>
                    <li>• Controlled access facilities</li>
                    <li>• Backup procedures</li>
                    <li>• Disaster recovery</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">5. Your Privacy Rights and Choices</h2>
            <div className="text-gray-300 space-y-4">
              <h3 className="text-xl font-medium text-purple-300 mb-3">5.1 General Rights</h3>
              <p>You have the following rights regarding your personal information:</p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 mb-3">Access and Control</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Access and review your account information</li>
                    <li>• Update, correct, or modify your profile</li>
                    <li>• Download your personal data</li>
                    <li>• Request deletion of your account</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 mb-3">Communication Preferences</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Opt out of marketing communications</li>
                    <li>• Manage notification settings</li>
                    <li>• Unsubscribe from promotional emails</li>
                    <li>• Control cookie settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">6. Contact Information and Support</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h3 className="text-xl font-medium text-purple-300 mb-4">General Privacy Inquiries</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Motion Falcon Privacy Team</strong></p>
                    <p>Email: privacy@motionfalcon.com</p>
                    <p>Address: [Company Address]</p>
                  </div>
                  <div>
                    <p><strong>Grievance Officer (India)</strong></p>
                    <p>Email: grievance@motionfalcon.com</p>
                    <p>Phone: [Phone Number]</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-600 text-center text-gray-400">
            <p className="text-sm">
              This Privacy Policy is effective as of January 1, 2025 and was last updated on January 1, 2025.
            </p>
            <p className="text-sm mt-2">
              For questions about this Privacy Policy or our data practices, please contact us using the information provided above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
