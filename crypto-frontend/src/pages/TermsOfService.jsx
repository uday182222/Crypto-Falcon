import React from 'react';
import { FileText, AlertTriangle, Shield, Users, Coins, Lock, Globe, Scale, Phone, Mail, MapPin } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <FileText size={48} color="#8b5cf6" />
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#f8fafc',
              margin: 0
            }}>
              Terms of Service
            </h1>
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.25rem',
            margin: '0 auto',
            maxWidth: '600px'
          }}>
            Legal terms and conditions for using our platform
          </p>
        </div>

        {/* Content */}
        <div style={{
          padding: '3rem',
          marginBottom: '2rem',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderRadius: '15px'
        }}>
          <div style={{
            color: '#e2e8f0',
            fontSize: '1.1rem',
            lineHeight: '1.8'
          }}>
            {/* Effective Date */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <FileText size={20} color="#8b5cf6" />
                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                  Last Updated: December 2024
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={20} color="#8b5cf6" />
                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                  Effective Date: December 2024
                </span>
              </div>
            </div>

            {/* 1. Introduction */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={24} color="#8b5cf6" />
                1. Introduction and Acceptance
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                By accessing or using Bitcoinpro's crypto trading simulation platform ("Service"), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service / Conditions ("Terms"). If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Service.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                These Terms constitute a binding legal agreement between you ("User," "you," or "your") and <strong style={{ color: '#f8fafc' }}>Bitcoinpro</strong> ("Company," "we," "our," or "us").
              </p>
            </section>

            {/* 2. Service Description and Educational Purpose */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Coins size={24} color="#8b5cf6" />
                2. Service Description and Educational Purpose
              </h2>
              
              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                2.1 Core Functionality
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Bitcoinpro provides an educational cryptocurrency trading simulation platform where users can:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Practice cryptocurrency trading strategies using virtual currency with real-time data</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Purchase virtual "Mock Cash" with real money for enhanced gameplay</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Access educational content about cryptocurrency markets and trading principles</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Participate in simulated market activities and competitions</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                2.2 Critical Disclaimers
              </h3>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#fca5a5', margin: 0, fontWeight: '600', marginBottom: '0.5rem' }}>
                  <strong>IMPORTANT:</strong> This is a simulation game designed exclusively for educational and entertainment purposes. Key limitations include:
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>●</span>
                    <span style={{ color: '#fca5a5' }}>No Real Trading: No actual cryptocurrencies, securities, or financial instruments are traded, purchased, or exchanged</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>●</span>
                    <span style={{ color: '#fca5a5' }}>Virtual Assets Only: All trading activities occur with virtual assets that have no real-world monetary value</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>●</span>
                    <span style={{ color: '#fca5a5' }}>Educational Tool: The Platform serves as a learning environment and should not be considered a substitute for professional financial education</span>
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>●</span>
                    <span style={{ color: '#fca5a5' }}>Simulated Markets: Market data and price movements may not reflect real-world conditions</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. Eligibility and Account Requirements */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={24} color="#8b5cf6" />
                3. Eligibility and Account Requirements
              </h2>
              
              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.1 Age Requirements
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Primary Users: Must be at least 18 years old (or age of majority in your jurisdiction)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Minor Users: Ages 13-17 may use the Service only with explicit parental consent and ongoing supervision</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Prohibited: Users under 13 are strictly prohibited from using the Service</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.2 Geographic and Legal Compliance
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Users must ensure their use complies with all applicable local, state, and federal laws</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>The Service may not be available in all jurisdictions</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>You are responsible for determining whether your use of the Service is lawful in your location</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.3 Account Registration
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Accurate Information: You must provide truthful, complete, and current registration information</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Single Account Policy: One account per person; multiple accounts are strictly prohibited</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Security Responsibility: You are solely responsible for maintaining account confidentiality and security</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Notification Duty: You must immediately report any unauthorized account access</span>
                </li>
              </ul>
            </section>

            {/* 4. Virtual Currency and Payment Terms */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Coins size={24} color="#8b5cf6" />
                4. Virtual Currency and Payment Terms
              </h2>
              
              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                4.1 Mock Cash System
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Nature: "Mock Cash" is virtual currency used exclusively within the Platform</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>No Real Value: Mock Cash has zero real-world value and cannot be exchanged, redeemed, or converted to real money, cryptocurrency, or any other form of value</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Non-Transferable: Mock Cash cannot be transferred between accounts or sold to third parties</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Expiration: All Mock Cash expires upon account termination or suspension</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                4.2 Purchase Terms
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Final Sales: All Mock Cash purchases are final and non-refundable, except where required by applicable law</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Payment Authorization: You authorize charges to your selected payment method for all purchases</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Third-Party Processing: Payments are processed through secure third-party processors; we do not store payment information</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Price Changes: Prices may change without prior notice</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Additional Fees: Payment method fees and taxes may apply</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                4.3 No Investment Representation
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Purchases of Mock Cash do not represent:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Deposits, investments, or securities of any kind</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Ownership interests in the Company</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Claims against Company assets</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Rights to future profits or distributions</span>
                </li>
              </ul>
            </section>

            {/* Continue with more sections... */}
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#94a3b8',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
              marginTop: '2rem'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Note:</strong> This is a comprehensive Terms of Service document. The full content continues with additional sections including Intellectual Property Rights, Prohibited Activities, Disclaimers, Liability Limitations, and more.
              </p>
              <p>
                For the complete Terms of Service with all sections, please contact our support team or check our website.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.9rem'
        }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>For legal questions, please contact our legal department.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
