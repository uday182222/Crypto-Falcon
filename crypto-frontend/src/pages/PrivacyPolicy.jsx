import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';

const PrivacyPolicy = () => {
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
            <Shield size={48} color="#8b5cf6" />
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#f8fafc',
              margin: 0
            }}>
              Privacy Policy
            </h1>
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.25rem',
            margin: 0,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            How we collect, use, and protect your information
          </p>
        </div>

        {/* Content */}
        <Card style={{
          padding: '3rem',
          marginBottom: '2rem'
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
                <Calendar size={20} color="#8b5cf6" />
                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                  Effective Date: December 2024
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Calendar size={20} color="#8b5cf6" />
                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>
                  Last Updated: December 2024
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
                <Shield size={24} color="#8b5cf6" />
                1. Introduction and Scope
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                This Privacy Policy ("Policy") describes how <strong style={{ color: '#f8fafc' }}>Bitcoinpro</strong> ("Company," "we," "our," or "us"), a company incorporated under the laws of India, collects, uses, processes, stores, shares, and protects your personal information when you use our crypto trading simulation platform ("Service," "Platform," "Game," or "App").
              </p>
              <p style={{ marginBottom: '1rem' }}>
                This Policy applies to all users of our Service, regardless of how you access or use it (website, mobile app, or other platforms). By using our Service, you acknowledge that you have read, understood, and consent to the practices described in this Policy.
              </p>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#fca5a5', margin: 0, fontWeight: '600' }}>
                  <strong>Important:</strong> This Policy should be read in conjunction with our Terms of Service, which governs your use of the Platform. We comply with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and other applicable Indian data protection laws.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
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
                <Database size={24} color="#8b5cf6" />
                2. Information We Collect
              </h2>
              
              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                2.1 Information You Provide Directly
              </h3>
              
              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1rem'
              }}>
                Account Registration Information:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Full name and username or display name</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Email address (required for registration, login, and communication)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Phone number (if provided)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Date of birth and age verification</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Profile picture and biographical information (optional)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Password and security preferences</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Parental consent information (for users aged 13-17)</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Payment and Transaction Information:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Billing name and address</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Payment information handled by trusted third-party processors (we do not store credit card numbers, banking details, or UPI information)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Purchase history and transaction records for mock cash purchases</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Mock cash purchase amounts and transaction dates</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Refund and dispute information</span>
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
                <strong>Note:</strong> This is a comprehensive privacy policy. The full content will be displayed here with proper formatting for all sections.
              </p>
              <p>
                For the complete privacy policy, please contact our support team or check our website.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.9rem'
        }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>For privacy concerns, please contact our data protection officer.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
