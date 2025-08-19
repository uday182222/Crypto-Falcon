import React from 'react';

const PrivacyPolicy = () => {
  console.log('PrivacyPolicy component rendering');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'red',
      color: 'white',
      padding: '2rem',
      fontSize: '2rem',
      textAlign: 'center'
    }}>
      <h1>PRIVACY POLICY TEST</h1>
      <p>If you can see this RED page with white text, the component is working!</p>
      <p>Current URL: {window.location.href}</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default PrivacyPolicy;
