import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Wallet from './pages/Wallet'
import Achievements from './pages/Achievements'
import Portfolio from './pages/Portfolio'
import Profile from './pages/Profile'
// import PrivacyPolicy from './pages/PrivacyPolicy'
// import TermsOfService from './pages/TermsOfService'
import './App.css'

// Inline component for testing
const PrivacyPolicy = () => (
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

const TermsOfService = () => (
  <div style={{
    minHeight: '100vh',
    background: 'blue',
    color: 'white',
    padding: '2rem',
    fontSize: '2rem',
    textAlign: 'center'
  }}>
    <h1>TERMS OF SERVICE TEST</h1>
    <p>If you can see this BLUE page with white text, the component is working!</p>
    <p>Current URL: {window.location.href}</p>
    <p>Time: {new Date().toLocaleString()}</p>
  </div>
);

function App() {
  console.log('App component rendering, routes should be available');
  
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Protected Routes - with Navbar */}
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <Dashboard />
            </>
          } />
          <Route path="/trading" element={
            <>
              <Navbar />
              <Trading />
            </>
          } />
          <Route path="/wallet" element={
            <>
              <Navbar />
              <Wallet />
            </>
          } />
          <Route path="/achievements" element={
            <>
              <Navbar />
              <Achievements />
            </>
          } />
          <Route path="/portfolio" element={
            <>
              <Navbar />
              <Portfolio />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navbar />
              <Profile />
            </>
          } />
          
          {/* Catch-all route for debugging */}
          <Route path="*" element={
            <div style={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
              color: 'white',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h1>404 - Page Not Found</h1>
              <p>Current URL: {window.location.href}</p>
              <p>This route is not defined in the application.</p>
              <p>Available routes: /, /login, /register, /privacy, /terms, /dashboard, /trading, /wallet, /achievements, /portfolio, /profile</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
