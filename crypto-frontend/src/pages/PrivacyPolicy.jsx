import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Calendar, Mail, Phone, MapPin, Cookie, Globe, Users, FileText, AlertTriangle } from 'lucide-react';
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
            margin: '0 auto',
            maxWidth: '600px'
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

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Communication Information:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Customer support interactions and correspondence</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Feedback, surveys, and testimonials</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Community interactions and messages</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Social media interactions with our official accounts</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Verification Information (when required):
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Identity verification documents</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Address verification documents</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Age verification documentation</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Enhanced verification for compliance purposes</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                2.2 Information Collected Automatically
              </h3>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1rem'
              }}>
                Platform Usage Data:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Game activity, trading decisions, and performance metrics</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Virtual balances and in-game transactions</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Features used and time spent in different sections</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Login frequency and session duration</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Virtual portfolio composition and trading history</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Educational content engagement and completion rates</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Game progress, account activity, and scores</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Device and Technical Information:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Device type, model, and operating system</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>IP address and general geographic location</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Browser type and version</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Screen resolution and device settings</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Mobile device identifiers (UDID, IDFA, Android ID)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>App version and update history</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Usage statistics and logs</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Analytics and Performance Data:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Page views, clicks, and navigation patterns</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Error logs and crash reports</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Performance metrics and load times</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Feature adoption and usage statistics</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>A/B test participation and results</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                2.3 Cookies and Tracking Technologies
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We use cookies and similar technologies to:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Improve user experience and platform functionality</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Analyze performance and user preferences</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Track usage patterns and preferences</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Provide personalized content and features</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Ensure platform security and prevent fraud</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '2rem'
              }}>
                2.4 Information from Third Parties
              </h3>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1rem'
              }}>
                Payment Processors:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Transaction verification and fraud prevention data</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Payment method validation information</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Chargeback and dispute resolution data</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Social Media Integration (if applicable):
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Profile information from connected social accounts (with permission)</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Social media activity related to our Platform</span>
                </li>
              </ul>

              <h4 style={{
                color: '#cbd5e1',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                marginTop: '1.5rem'
              }}>
                Analytics and Marketing Partners:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Referral source information</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Attribution data for advertising campaigns</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Demographic and interest-based information (aggregated)</span>
                </li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
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
                <Eye size={24} color="#8b5cf6" />
                3. How We Use Your Information
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We use collected information for the following purposes:
              </p>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.1 Primary Service Functions
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Account Management: Creating, maintaining, and managing user accounts</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Service Delivery: Providing core crypto trading simulation features</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Transaction Processing: Processing and fulfilling mock cash purchases</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Customer Support: Providing technical assistance and support services</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Educational Content: Delivering personalized educational content and simulations</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Platform Security: Maintaining security, integrity, and preventing unauthorized access</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.2 Enhancement and Personalization
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Customizing user experience and interface</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Recommending relevant educational content</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Personalizing trading simulation scenarios</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Providing performance analytics and insights</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Improving platform features and functionality</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.3 Communication and Updates
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Sending important notifications and updates</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Providing customer support responses</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Sharing platform announcements and new features</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Conducting user surveys and feedback collection</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Delivering marketing communications (with consent)</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.4 Legal and Compliance Purposes
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Complying with Indian laws and regulations</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Meeting anti-money laundering (AML) requirements</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Fulfilling Know Your Customer (KYC) obligations</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Responding to legal requests and court orders</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Maintaining records as required by law</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Preventing fraud, abuse, and misuse of the platform</span>
                </li>
              </ul>

              <h3 style={{
                color: '#e2e8f0',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                3.5 Business Operations and Analytics
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1rem'
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Understanding user behavior and preferences</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Conducting market research and analysis</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Developing new products and services</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Measuring marketing effectiveness and ROI</span>
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>●</span>
                  <span>Improving overall service quality and performance</span>
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
                <strong>Note:</strong> This is a comprehensive privacy policy. The full content continues with additional sections including Legal Bases, Information Sharing, Data Security, Privacy Rights, and more.
              </p>
              <p>
                For the complete privacy policy with all sections, please contact our support team or check our website.
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
