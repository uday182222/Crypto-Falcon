import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ChatBotWidget from './components/ChatBotWidget'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Wallet from './pages/Wallet'
import Achievements from './pages/Achievements'
import Portfolio from './pages/Portfolio'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Blog from './pages/Blog'
import ContactUs from './pages/ContactUs'
import CancellationsAndRefunds from './pages/CancellationsAndRefunds'
import './App.css'



// Route handler component
const RouteHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's an intended route from 404.html
    const intendedRoute = sessionStorage.getItem('intendedRoute');
    if (intendedRoute) {
      console.log('Redirecting to intended route:', intendedRoute);
      sessionStorage.removeItem('intendedRoute');
      navigate(intendedRoute);
    }

    // Additional debugging for deployed app
    console.log('RouteHandler mounted');
    console.log('Current pathname:', window.location.pathname);
    console.log('Current href:', window.location.href);
    
    // Force route refresh if needed
    const currentPath = window.location.pathname;
    const validRoutes = [
      '/', '/login', '/register', '/dashboard', '/trading', '/wallet', 
      '/achievements', '/portfolio', '/profile', '/privacy', '/terms',
      '/blog', '/contact-us', '/cancellations-and-refunds'
    ];
    
    if (currentPath !== '/' && !validRoutes.includes(currentPath)) {
      console.log('Invalid route detected, redirecting to home');
      navigate('/');
    }
  }, [navigate]);
  
  return null;
};





function App() {
  console.log('App component rendering, routes should be available');
  
  return (
    <Router>
      <div className="App">
        <RouteHandler />
        <ChatBotWidget />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/cancellations-and-refunds" element={<CancellationsAndRefunds />} />
          
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
              <p>Available routes: /, /login, /register, /privacy, /terms, /blog, /contact-us, /cancellations-and-refunds, /dashboard, /trading, /wallet, /achievements, /portfolio, /profile</p>
              <p>Current pathname: {window.location.pathname}</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
