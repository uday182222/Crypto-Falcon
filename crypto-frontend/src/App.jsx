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
import PrivacyPolicy from './pages/PrivacyPolicy'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
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
        </Routes>
      </div>
    </Router>
  )
}

export default App
