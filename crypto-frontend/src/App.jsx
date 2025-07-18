import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import BuyCoins from './pages/BuyCoins';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/trading" element={<Trading />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/buy-coins" element={<BuyCoins />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
