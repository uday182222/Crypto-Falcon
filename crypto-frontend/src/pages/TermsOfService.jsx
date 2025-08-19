import React from 'react';
import { FileText, Shield, Scale, Clock, Users } from 'lucide-react';
import Card from '../components/ui/Card';

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
            <FileText size={48} color="#14b8a6" />
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
            margin: 0,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Please read these terms carefully before using our services
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
            {/* Placeholder content - will be replaced with actual content */}
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#94a3b8'
            }}>
              <Shield size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
                Terms of Service Content
              </h3>
              <p>
                Content will be provided and added here...
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
          <p>For questions about these terms, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
