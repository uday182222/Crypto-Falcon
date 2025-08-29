import React from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '2px solid rgba(51, 65, 85, 0.6)',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
      backdropFilter: 'blur(12px)',
      padding: '2rem 1.5rem',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Logo and Company Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
            border: '2px solid rgba(20, 184, 166, 0.3)'
          }}>
            <Coins size={18} style={{ color: 'white' }} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            BitcoinPro
          </span>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/privacy" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s ease',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#8b5cf6';
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#94a3b8';
            e.target.style.borderColor = 'transparent';
          }}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s ease',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#8b5cf6';
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#94a3b8';
            e.target.style.borderColor = 'transparent';
          }}>
            Terms of Service
          </Link>
          <Link to="/contact-us" style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s ease',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#8b5cf6';
            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#94a3b8';
            e.target.style.borderColor = 'transparent';
          }}>
            Contact Us
          </Link>
        </div>

        {/* Copyright */}
        <p style={{ 
          color: '#cbd5e1',
          fontSize: '0.875rem',
          margin: 0
        }}>
          © 2025 BitcoinPro is owned by MotionFalcon. All rights reserved. Trade smart, trade safe.
        </p>
        
        {/* Ownership */}
        <p style={{ 
          color: '#94a3b8',
          fontSize: '0.75rem',
          margin: '0.5rem 0 0 0',
          fontStyle: 'italic'
        }}>
         
        </p>
      </div>
    </footer>
  );
};

export default Footer;
