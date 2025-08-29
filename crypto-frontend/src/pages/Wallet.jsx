import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, TrendingDown, Plus, Minus, History, Package, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingAnimation from '../components/ui/LoadingAnimation';
import { dashboardAPI } from '../services/api';
import { invoiceAPI } from '../services/invoiceAPI';

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTopUpPackages, setShowTopUpPackages] = useState(false);
  const [showTopUpSubpage, setShowTopUpSubpage] = useState(false);
  const [processingTopUp, setProcessingTopUp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceButton, setShowInvoiceButton] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('User authenticated, proceeding with wallet data fetch');
    fetchWalletData();
    loadRazorpay();
  }, [navigate]);

  // Add CSS for spinner animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes slideInRight {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.9); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadRazorpay = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.head.appendChild(script);
  };

  const fetchWalletData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshingTransactions(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Check authentication first
      if (!isAuthenticated()) {
        console.log('User not authenticated in fetchWalletData, redirecting to login');
        navigate('/login');
        return;
      }

      // Fetch wallet balance
      const walletResponse = await dashboardAPI.getWalletSummary();
      if (walletResponse.success) {
        setBalance(parseFloat(walletResponse.balance || 0));
        console.log('Wallet balance updated:', walletResponse.balance);
      }

      // Fetch only wallet transactions (top-ups, package purchases)
      const walletTransactionsResponse = await fetchWalletTransactions();

      let walletTransactions = [];

      // Process wallet transactions (top-ups, package purchases, etc.)
      console.log('Processing wallet transactions:', walletTransactionsResponse);
      if (walletTransactionsResponse.success && walletTransactionsResponse.data) {
        console.log('Raw transaction data:', walletTransactionsResponse.data);
        walletTransactions = walletTransactionsResponse.data.map(tx => ({
          id: `wallet_${tx.id}`,
          type: tx.type || 'topup',
          coin: 'USD',
          amount: parseFloat(tx.amount || tx.amount_changed),
          price: 1,
          total: parseFloat(tx.amount || tx.amount_changed),
          date: tx.timestamp || tx.created_at,
          status: 'completed',
          category: 'wallet'
        }));
        console.log('Processed transactions:', walletTransactions);
      }

      // Sort by date (newest first)
      walletTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (walletTransactions.length > 0) {
        setTransactions(walletTransactions);
      } else {
        // No transactions found - show empty state
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setTransactions([]);
    } finally {
      if (isRefresh) {
        setRefreshingTransactions(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      const token = localStorage.getItem('bitcoinpro_token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return { success: false, data: [] };
      }

      console.log('Fetching wallet transactions with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/wallet/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Wallet transactions response status:', response.status);
      console.log('Wallet transactions response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Wallet transactions response data:', data);
        return { success: true, data: data.data || [] }; // Extract the actual transactions array
      } else if (response.status === 401) {
        console.log('Unauthorized access, token might be invalid');
        localStorage.removeItem('bitcoinpro_token');
        localStorage.removeItem('bitcoinpro_user');
        navigate('/login');
        return { success: false, data: [] };
      } else {
        console.log('Wallet transactions endpoint error, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        return { success: false, data: [], error: errorText };
      }
    } catch (error) {
      console.error('Wallet transactions fetch error:', error);
      return { success: false, data: [], error: error.message };
    }
  };



  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    const amount = parseFloat(topUpAmount);
    if (amount > 1000) {
      alert('Amount cannot exceed $1000 for test mode. Please try $100 or less.');
      return;
    }
    
    if (amount < 1) {
      addNotification('warning', 'Invalid Amount', 'Amount must be at least $1');
      return;
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('bitcoinpro_token');
    if (!token) {
      addNotification('warning', 'Authentication Required', 'Please login first to top up your wallet');
      return;
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    console.log('Amount to top up:', topUpAmount);
    
    setProcessingTopUp(true);
    try {
      console.log('Creating Razorpay order for amount:', topUpAmount);
      console.log('API URL:', '/wallet/create-topup-order');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });
      console.log('Request body:', { amount: amount });
      
      // Create Razorpay order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/wallet/create-topup-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          package_id: 'custom' // Send custom package ID for backend processing
        })
      });

      console.log('Order response status:', orderResponse.status);
      console.log('Order response status text:', orderResponse.statusText);
      console.log('Order response headers:', Object.fromEntries(orderResponse.headers.entries()));

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Order creation failed - Full response:', errorText);
        console.error('Response status:', orderResponse.status);
        console.error('Response headers:', Object.fromEntries(orderResponse.headers.entries()));
        throw new Error(`Failed to create order: ${orderResponse.status} ${orderResponse.statusText} - ${errorText}`);
      }

      const orderData = await orderResponse.json();
      console.log('Order created successfully:', orderData);
      
      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_rjWYPFN2F7k22B', // Use your test key
        amount: orderData.amount_inr * 100, // Convert to paise
        currency: 'INR',
        name: 'BitcoinPro',
        description: `Wallet Top-up - ₹${amount}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/wallet/verify-topup-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                package_id: 'custom' // Send package ID for verification
              })
            });

            if (verifyResponse.ok) {
              const result = await verifyResponse.json();
              // Update local state with the game USD amount from backend
              const gameUsdAmount = result.amount_added || amount;
              setBalance(prev => prev + gameUsdAmount);
              setShowTopUpModal(false);
              setTopUpAmount('');
              
              // Add to transactions
              const newTransaction = {
                id: Date.now(),
                type: 'topup',
                coin: 'USD',
                amount: gameUsdAmount,
                price: 1,
                total: gameUsdAmount,
                date: new Date().toISOString(),
                status: 'completed'
              };
              setTransactions(prev => [newTransaction, ...prev]);
              
              // Show success notification with invoice download
              addNotification('success', 
                'Top-up Successful!', 
                `Added $${gameUsdAmount.toLocaleString()} USD to your wallet`,
                [
                  { icon: '💰', text: `Added $${gameUsdAmount.toLocaleString()} USD` },
                  { icon: '📄', text: 'Invoice ready for download' }
                ]
              );
              
              // Show invoice download button
              if (result.invoice_ready && result.order_id && result.payment_id) {
                showInvoiceDownloadButton(result.payment_id, result.order_id, gameUsdAmount);
              }
              
              // Refresh wallet data
              fetchWalletData();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@bitcoinpro.in'
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: function() {
            setProcessingTopUp(false);
          }
        }
      };

      console.log('Razorpay options:', options);
      console.log('Razorpay loaded:', !!window.Razorpay);
      
      const razorpay = new window.Razorpay(options);
      console.log('Razorpay instance created:', razorpay);
      
      razorpay.open();
      console.log('Razorpay modal opened');
      
    } catch (error) {
      console.error('Top-up error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        razorpayLoaded: razorpayLoaded,
        windowRazorpay: !!window.Razorpay
      });
      addNotification('error', 'Payment Failed', `Failed to initiate payment: ${error.message}. Please try again.`);
    } finally {
      setProcessingTopUp(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showInvoiceDownloadButton = (paymentId, orderId, amount, packageName = null) => {
    setInvoiceData({
      paymentId,
      orderId,
      amount,
      packageName
    });
    setShowInvoiceButton(true);
  };

  const handleInvoiceDownload = async () => {
    if (!invoiceData) return;
    
    setIsGeneratingInvoice(true);
    try {
      await invoiceAPI.generateAndDownloadInvoice(invoiceData.paymentId, invoiceData.orderId);
      
      addNotification('success', 
        'Invoice Downloaded!', 
        'Your invoice has been generated and downloaded successfully',
        [
          { icon: '📄', text: 'Invoice saved to your device' }
        ]
      );
      
      // Hide the invoice button after successful download
      setShowInvoiceButton(false);
      setInvoiceData(null);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      addNotification('error', 
        'Invoice Generation Failed', 
        'Failed to generate invoice. Please try again or contact support.',
        [
          { icon: '❌', text: 'Invoice generation failed' }
        ]
      );
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const fetchInvoiceHistory = async () => {
    try {
      const response = await invoiceAPI.listInvoices();
      if (response.success) {
        setInvoiceHistory(response.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoice history:', error);
    }
  };

  const handleShowInvoiceHistory = () => {
    setShowInvoiceHistory(!showInvoiceHistory);
    if (!showInvoiceHistory) {
      fetchInvoiceHistory();
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'buy':
        return <TrendingUp size={16} color="#10b981" />;
      case 'sell':
        return <TrendingDown size={16} color="#ef4444" />;
      case 'topup':
        return <Plus size={16} color="#14b8a6" />;
      case 'premium':
        return <Trophy size={16} color="#f59e0b" />;
      case 'package':
        return <Package size={16} color="#8b5cf6" />;
      case 'withdrawal':
        return <ArrowDownRight size={16} color="#f59e0b" />;
      case 'unknown':
      default:
        return <Coins size={16} color="#94a3b8" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'buy':
        return '#10b981';
      case 'sell':
        return '#ef4444';
      case 'topup':
        return '#14b8a6';
      case 'premium':
        return '#f59e0b';
      case 'package':
        return '#8b5cf6';
      case 'withdrawal':
        return '#f59e0b';
      case 'unknown':
      default:
        return '#94a3b8';
    }
  };

  const getTransactionDisplayName = (type) => {
    switch (type) {
      case 'buy':
        return 'Buy';
      case 'sell':
        return 'Sell';
      case 'topup':
        return 'Top-up';
      case 'premium':
        return 'Premium';
      case 'package':
        return 'Package';
      case 'withdrawal':
        return 'Withdrawal';
      case 'unknown':
      default:
        return 'Unknown';
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    // Apply category filter (only wallet transactions now)
    if (transactionFilter === 'wallet') {
      filtered = filtered.filter(tx => tx.category === 'wallet');
    }
    // 'all' shows all wallet transactions
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.coin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount?.toString().includes(searchTerm) ||
        tx.id?.toString().includes(searchTerm)
      );
    }
    
    return filtered;
  };

  // Top-up packages configuration
  const topUpPackages = [
    {
      id: 'crypto-crumbs',
      name: 'Crypto Crumbs',
      usdAmount: 100000, // 100,000 USD for ₹10
      demoCoins: 100000,
      bonus: 0,
      popular: false,
      color: 'from-green-500 to-emerald-500',
      inrPrice: 10,
      checkoutPrice: 12
    },
    {
      id: 'rookie-pack',
      name: 'Rookie Pack',
      usdAmount: 200000, // 200,000 USD for ₹20
      demoCoins: 200000,
      bonus: 0,
      popular: false,
      color: 'from-blue-500 to-cyan-500',
      inrPrice: 20,
      checkoutPrice: 23
    },
    {
      id: 'lambo-baron',
      name: 'Lambo Baron',
      usdAmount: 500000, // 500,000 USD for ₹50
      demoCoins: 500000,
      bonus: 0,
      popular: false,
      color: 'from-yellow-500 to-orange-500',
      inrPrice: 50,
      checkoutPrice: 55
    },
    {
      id: 'ramen-bubble',
      name: 'Ramen Bubble',
      usdAmount: 1000000, // 1,000,000 USD for ₹100
      demoCoins: 1000000,
      bonus: 0,
      popular: true,
      color: 'from-purple-500 to-pink-500',
      inrPrice: 100,
      checkoutPrice: 110
    },
    {
      id: 'digi-dynasty',
      name: 'Digi Dynasty',
      usdAmount: 2500000, // 2,500,000 USD for ₹250
      demoCoins: 2500000,
      bonus: 0,
      popular: false,
      color: 'from-indigo-500 to-purple-500',
      inrPrice: 250,
      checkoutPrice: 265
    },
    {
      id: 'block-mogul',
      name: 'Block Mogul',
      usdAmount: 5000000, // 5,000,000 USD for ₹500
      demoCoins: 5000000,
      bonus: 0,
      popular: false,
      color: 'from-red-500 to-pink-500',
      inrPrice: 500,
      checkoutPrice: 525
    },
    {
      id: 'satoshi-vault',
      name: 'Satoshi\'s Vault',
      usdAmount: 100000000, // 100,000,000 USD for ₹1000
      demoCoins: 100000000,
      bonus: 0,
      popular: false,
      color: 'from-yellow-400 to-orange-500',
      inrPrice: 1000,
      checkoutPrice: 1050
    }
  ];



  const handlePackageTopUp = async (packageData) => {
    if (!razorpayLoaded) {
      addNotification('warning', 'Payment Gateway Loading', 'Please wait a moment for the payment system to initialize');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('bitcoinpro_token');
    if (!token) {
      addNotification('warning', 'Authentication Required', 'Please login first to top up your wallet');
      return;
    }

    setProcessingTopUp(true);
    try {
      // Create Razorpay order for the package
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/wallet/create-topup-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: packageData.checkoutPrice, // Send actual checkout amount
          package_id: packageData.id // Send package ID for backend processing
        })
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Failed to create order: ${orderResponse.status} ${orderResponse.statusText} - ${errorText}`);
      }

      const orderData = await orderResponse.json();
      
      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_rjWYPFN2F7k22B',
        amount: orderData.amount_inr * 100, // Convert to paise
        currency: 'INR',
        name: 'BitcoinPro',
        description: `${packageData.name} - $${packageData.usdAmount} USD`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/wallet/verify-topup-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: packageData.checkoutPrice, // Send checkout price in INR
                package_id: packageData.id // Send package ID for verification
              })
            });

            if (verifyResponse.ok) {
              const result = await verifyResponse.json();
              
              // Update local state with USD amount from backend
              const totalAmount = result.amount_added || packageData.usdAmount;
              setBalance(prev => prev + totalAmount);
              setShowTopUpSubpage(false);
              
              // Add to transactions
              const newTransaction = {
                id: Date.now(),
                type: 'topup',
                coin: 'USD',
                amount: totalAmount,
                price: 1,
                total: totalAmount,
                date: new Date().toISOString(),
                status: 'completed',
                category: 'wallet'
              };
              setTransactions(prev => [newTransaction, ...prev]);
              
              // Show success notification with invoice download
              addNotification('success', 
                `Successfully purchased ${packageData.name}!`, 
                'Your USD has been added to your wallet',
                [
                  { icon: '💰', text: `Added $${totalAmount.toLocaleString()} USD` },
                  { icon: '📄', text: 'Invoice ready for download' }
                ]
              );
              
              // Show invoice download button
              if (result.invoice_ready && result.order_id && result.payment_id) {
                showInvoiceDownloadButton(result.payment_id, result.order_id, packageData.checkoutPrice, packageData.name);
              }
              
              // Refresh wallet data
              fetchWalletData();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@bitcoinpro.in'
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: function() {
            setProcessingTopUp(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Package top-up error:', error);
      addNotification('error', 'Payment Failed', 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessingTopUp(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('bitcoinpro_token');
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }
    
    try {
      // Basic token validation (check if it's a valid JWT format)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format');
        localStorage.removeItem('bitcoinpro_token');
        localStorage.removeItem('bitcoinpro_user');
        return false;
      }
      
      console.log('Token format is valid, length:', token.length);
      return true;
    } catch (error) {
      console.log('Token validation error:', error);
      localStorage.removeItem('bitcoinpro_token');
      localStorage.removeItem('bitcoinpro_user');
      return false;
    }
  };

  // Debug function to check authentication state
  const debugAuth = () => {
    console.log('=== Authentication Debug ===');
    console.log('bitcoinpro_token:', localStorage.getItem('bitcoinpro_token') ? 'EXISTS' : 'NOT FOUND');
    console.log('bitcoinpro_user:', localStorage.getItem('bitcoinpro_user') ? 'EXISTS' : 'NOT FOUND');
    console.log('Token length:', localStorage.getItem('bitcoinpro_token')?.length || 0);
    console.log('Is authenticated:', isAuthenticated());
    console.log('===========================');
  };

  const addNotification = (type, title, message, details = []) => {
    const id = Date.now();
    const notification = {
      id,
      type,
      title,
      message,
      details,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };






  if (loading) {
    return <LoadingAnimation message="Loading Wallet..." size="large" />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#f8fafc',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <WalletIcon size={32} />
            Wallet
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem',
            margin: 0
          }}>
            Manage your funds and view transaction history
          </p>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Debug Button - Remove this in production */}
          <button
            onClick={debugAuth}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #14b8a6 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              color: 'white',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Debug Auth
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm('')}
              style={{
                color: '#94a3b8',
                background: 'rgba(51, 65, 85, 0.3)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              Clear Search
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleShowInvoiceHistory}
            style={{
              color: '#94a3b8',
              background: 'rgba(51, 65, 85, 0.3)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              fontSize: '0.875rem',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            📄 Invoice History
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowTopUpSubpage(true)}
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              fontSize: '0.875rem',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Top Up
          </Button>
        </div>

        {/* Invoice Download Button */}
        {showInvoiceButton && invoiceData && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#22c55e',
                margin: '0 0 1rem 0'
              }}>
                📄 Invoice Ready for Download
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '1rem',
                margin: '0 0 1.5rem 0'
              }}>
                {invoiceData.packageName 
                  ? `Package: ${invoiceData.packageName} - ₹${invoiceData.amount}`
                  : `Amount: ₹${invoiceData.amount}`
                }
              </p>
              <Button
                variant="primary"
                onClick={handleInvoiceDownload}
                disabled={isGeneratingInvoice}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isGeneratingInvoice ? (
                  <>
                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating Invoice...
                  </>
                ) : (
                  <>
                    📥 Download Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '400px'
        }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid',
                borderColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.6)' : 
                           notification.type === 'error' ? 'rgba(239, 68, 68, 0.6)' : 
                           notification.type === 'warning' ? 'rgba(245, 158, 11, 0.6)' : 
                           'rgba(59, 130, 246, 0.6)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                animation: 'slideInRight 0.5s ease-out',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Progress Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '3px',
                background: notification.type === 'success' ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                           notification.type === 'error' ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                           notification.type === 'warning' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                           'linear-gradient(90deg, #3b82f6, #2563eb)',
                width: '100%',
                animation: 'fadeIn 0.3s ease-out'
              }} />
              
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.2)' :
                               notification.type === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                               notification.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
                               'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.4)' :
                                 notification.type === 'error' ? 'rgba(239, 68, 68, 0.4)' :
                                 notification.type === 'warning' ? 'rgba(245, 158, 11, 0.4)' :
                                 'rgba(59, 130, 246, 0.4)'
                  }}>
                    {notification.type === 'success' ? '✅' : 
                     notification.type === 'error' ? '❌' : 
                     notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#f8fafc',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {notification.title}
                    </h4>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {notification.message}
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => removeNotification(notification.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f8fafc';
                    e.target.style.background = 'rgba(51, 65, 85, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#94a3b8';
                    e.target.style.background = 'transparent';
                  }}
                >
                  ✕
                </button>
              </div>
              
              {/* Details */}
              {notification.details.length > 0 && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1rem'
                }}>
                  {notification.details.map((detail, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: index < notification.details.length - 1 ? '0.5rem' : 0
                    }}>
                      <span style={{
                        color: notification.type === 'success' ? '#22c55e' : 
                               notification.type === 'error' ? '#ef4444' : 
                               notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
                        fontSize: '1rem'
                      }}>
                        {detail.icon || '•'}
                      </span>
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '0.875rem'
                      }}>
                        {detail.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Timestamp */}
              <div style={{
                marginTop: '1rem',
                textAlign: 'right'
              }}>
                <span style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontStyle: 'italic'
                }}>
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Balance Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Available Balance Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '0.75rem',
                color: '#14b8a6'
              }}>
                <Coins size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Available Balance
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              ${(balance || 0).toLocaleString()} USD
            </p>
          </div>

          {/* Total Transactions Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0.75rem',
                color: '#3b82f6'
              }}>
                <History size={24} />
              </div>
            </div>
            <h3 style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Total Transactions
            </h3>
            <p style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f8fafc',
              margin: 0
            }}>
              {transactions.length}
            </p>
          </div>
        </div>

        {/* Transaction Summary */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#f8fafc',
              margin: 0
            }}>
              Transaction Summary
            </h3>
            <Button
              variant="ghost"
              onClick={() => fetchWalletData(true)}
              disabled={refreshingTransactions}
              style={{
                color: '#14b8a6',
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                padding: '0.5rem',
                minWidth: 'auto',
                opacity: refreshingTransactions ? 0.6 : 1
              }}
              title="Refresh transaction data"
            >
              <RefreshCw size={16} style={{
                animation: refreshingTransactions ? 'spin 1s linear infinite' : 'none'
              }} />
            </Button>
          </div>
                      <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '0.75rem',
                padding: '1rem',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }} onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
              }} onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>
                Total Trades
              </p>
              <p style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {transactions.filter(tx => tx.category === 'trade').length}
              </p>
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>
                Wallet Transactions
              </p>
              <p style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                {transactions.filter(tx => tx.category === 'wallet').length}
              </p>
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>
                Total Volume
              </p>
              <p style={{
                color: '#f8fafc',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>
                ${transactions.reduce((sum, tx) => sum + (tx.total || 0), 0).toLocaleString()}
              </p>
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                margin: '0 0 0.5rem 0',
                fontWeight: '500'
              }}>
                Last Transaction
              </p>
              <p style={{
                color: '#f8fafc',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0
              }}>
                                {transactions.length > 0 ? formatDate(transactions[0].date) : 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              flex: 1
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#f8fafc',
                margin: 0
              }}>
                Transaction History
              </h3>
              
              {/* Search Input */}
              <div style={{
                position: 'relative',
                maxWidth: '300px'
              }}>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '0.5rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#14b8a6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                    e.target.style.background = 'rgba(15, 23, 42, 0.9)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(15, 23, 42, 0.8)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Button
                  variant="ghost"
                  onClick={() => setTransactionFilter('all')}
                  style={{
                    color: transactionFilter === 'all' ? '#14b8a6' : '#94a3b8',
                    background: transactionFilter === 'all' ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: transactionFilter === 'all' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(51, 65, 85, 0.5)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  All
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setTransactionFilter('wallet')}
                  style={{
                    color: transactionFilter === 'wallet' ? '#14b8a6' : '#94a3b8',
                    background: transactionFilter === 'wallet' ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: transactionFilter === 'wallet' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(51, 65, 85, 0.5)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  Wallet
                </Button>
              </div>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease'
              }} onMouseEnter={(e) => {
                e.target.style.background = 'rgba(20, 184, 166, 0.15)';
                e.target.style.transform = 'scale(1.02)';
              }} onMouseLeave={(e) => {
                e.target.style.background = 'rgba(20, 184, 166, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}>
                {getFilteredTransactions().length} wallet transactions
              </span>
            </div>
          </div>

          {getFilteredTransactions() && getFilteredTransactions().length > 0 ? (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '1rem',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%)',
                    borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
                  }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f8fafc', fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Currency</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTransactions().map((transaction, index) => (
                    <tr key={transaction.id || index} style={{
                      borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                      transition: 'all 0.2s ease'
                    }} onMouseEnter={(e) => {
                      e.target.closest('tr').style.background = 'rgba(51, 65, 85, 0.2)';
                    }} onMouseLeave={(e) => {
                      e.target.closest('tr').style.background = 'transparent';
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: getTransactionColor(transaction.type || 'unknown')
                          }}>
                            {getTransactionIcon(transaction.type || 'unknown')}
                            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                              {getTransactionDisplayName(transaction.type || 'unknown')}
                            </span>
                          </div>
                          {transaction.category && (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: transaction.category === 'trade' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                              color: transaction.category === 'trade' ? '#14b8a6' : '#8b5cf6',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              border: '1px solid',
                              borderColor: transaction.category === 'trade' ? 'rgba(20, 184, 166, 0.3)' : 'rgba(139, 92, 246, 0.3)'
                            }}>
                              {transaction.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '1rem', color: '#f8fafc' }}>
                        {transaction.coin || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '1rem', color: '#f8fafc' }}>
                        {transaction.amount ? transaction.amount.toLocaleString() : 0}
                      </td>
                      <td style={{ textAlign: 'center', padding: '1rem', color: '#f8fafc', fontWeight: '600' }}>
                        ${(transaction.total || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {transaction.date ? formatDate(transaction.date) : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'capitalize',
                          border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              color: '#94a3b8'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Coins size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {searchTerm ? 'No transactions found' : 'No transactions yet'}
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {searchTerm 
                    ? `No transactions match "${searchTerm}". Try adjusting your search or filters.`
                    : 'Top up your wallet or purchase packages to see your transaction history'
                  }
                </p>
                {!searchTerm && (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="primary"
                      onClick={() => setShowTopUpModal(true)}
                      style={{
                        background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Top Up Wallet
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/trading'}
                      style={{
                        color: '#14b8a6',
                        background: 'rgba(20, 184, 166, 0.1)',
                        border: '1px solid rgba(20, 184, 166, 0.3)'
                      }}
                    >
                      Start Trading
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Invoice History Section */}
        {showInvoiceHistory && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#f8fafc',
                margin: 0
              }}>
                📄 Invoice History
              </h3>
              <Button
                variant="ghost"
                onClick={handleShowInvoiceHistory}
                style={{
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  padding: '0.5rem',
                  minWidth: 'auto'
                }}
              >
                ✕
              </Button>
            </div>

            {invoiceHistory.length > 0 ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '1rem',
                overflow: 'hidden'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%)',
                      borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
                    }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#f8fafc', fontWeight: '600' }}>Invoice #</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Package</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#f8fafc', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceHistory.map((invoice, index) => (
                      <tr key={index} style={{
                        borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                        transition: 'all 0.2s ease'
                      }} onMouseEnter={(e) => {
                        e.target.closest('tr').style.background = 'rgba(51, 65, 85, 0.2)';
                      }} onMouseLeave={(e) => {
                        e.target.closest('tr').style.background = 'transparent';
                      }}>
                        <td style={{ padding: '1rem', color: '#f8fafc', fontWeight: '600' }}>
                          {invoice.invoice_number}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                          {invoice.date}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem', color: '#f8fafc', fontWeight: '600' }}>
                          ₹{invoice.amount.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                          {invoice.package_name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '1rem' }}>
                          <Button
                            variant="ghost"
                            onClick={() => invoiceAPI.generateAndDownloadInvoice(invoice.payment_id, invoice.order_id)}
                            style={{
                              color: '#14b8a6',
                              background: 'rgba(20, 184, 166, 0.1)',
                              border: '1px solid rgba(20, 184, 166, 0.3)',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            📥 Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#94a3b8'
              }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  No invoices found
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  Complete a transaction to generate your first invoice
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Top Up Wallet
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Add funds to your wallet for trading
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Amount (USD)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                Amount will be converted to INR for payment processing
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <Button
                variant="ghost"
                onClick={() => setShowTopUpModal(false)}
                style={{
                  flex: 1,
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid rgba(51, 65, 85, 0.5)'
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleTopUp}
                disabled={!topUpAmount || parseFloat(topUpAmount) <= 0 || processingTopUp || !razorpayLoaded}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {!razorpayLoaded ? 'Loading...' : processingTopUp ? 'Processing...' : 'Pay with Razorpay'}
              </Button>
            </div>
            
            {!razorpayLoaded && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Loading payment gateway...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Up Subpage Modal */}
      {showTopUpSubpage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#f8fafc',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  💰 Top Up Your Wallet
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Choose from our selection of packages to add USD to your wallet for trading
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTopUpSubpage(false)}
                style={{
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  padding: '0.5rem',
                  minWidth: 'auto'
                }}
              >
                ✕
              </Button>
            </div>

            {/* Packages Section */}
            <div>
              <h4 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#f8fafc',
                margin: '0 0 1.5rem 0',
                textAlign: 'center'
              }}>
                🎮 Trading Packages
              </h4>
              <p style={{
                color: '#94a3b8',
                fontSize: '1rem',
                margin: '0 0 2rem 0',
                textAlign: 'center'
              }}>
                Select a package to add USD to your wallet for trading and learning
              </p>
              
              {/* Packages Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem',
                maxWidth: '1200px',
                margin: '0 auto 2rem auto'
              }}>
                {topUpPackages.map((pkg) => (
                  <div key={pkg.id} style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid',
                    borderColor: pkg.popular ? 'rgba(139, 92, 246, 0.6)' : 'rgba(51, 65, 85, 0.6)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }} onMouseEnter={(e) => {
                    e.target.closest('div').style.transform = 'translateY(-8px)';
                    e.target.closest('div').style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                    e.target.closest('div').style.borderColor = pkg.popular ? 'rgba(139, 92, 246, 0.8)' : 'rgba(51, 65, 85, 0.8)';
                  }} onMouseLeave={(e) => {
                    e.target.closest('div').style.transform = 'translateY(0)';
                    e.target.closest('div').style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                    e.target.closest('div').style.borderColor = pkg.popular ? 'rgba(139, 92, 246, 0.6)' : 'rgba(51, 65, 85, 0.6)';
                  }}>
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: '2px solid rgba(15, 23, 42, 0.95)'
                      }}>
                        ⭐ Most Popular
                      </div>
                    )}

                    {/* Package Header */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h5 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#f8fafc',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {pkg.name}
                      </h5>
                      <div style={{
                        background: `linear-gradient(135deg, ${pkg.color})`,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        display: 'inline-block'
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          ${pkg.usdAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* USD Amount */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#f8fafc',
                        marginBottom: '0.5rem'
                      }}>
                        ${pkg.usdAmount.toLocaleString()}
                      </div>
                      <p style={{
                        color: '#94a3b8',
                        fontSize: '1rem',
                        margin: 0
                      }}>
                        MOCK USD
                      </p>
                    </div>

                    {/* Price Information */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#22c55e',
                        marginBottom: '0.25rem'
                      }}>
                        ₹{pkg.checkoutPrice} Checkout
                      </div>
                      <p style={{
                        color: '#16a34a',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {pkg.inrPrice === 0 ? 'Free Registration' : `Base Price: ₹${pkg.inrPrice}`}
                      </p>
                    </div>

                    {/* Purchase Button */}
                    <Button
                      variant="primary"
                      onClick={() => handlePackageTopUp(pkg)}
                      disabled={processingTopUp || !razorpayLoaded}
                      style={{
                        width: '100%',
                        background: pkg.popular 
                          ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                          : 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        borderRadius: '0.75rem'
                      }}
                    >
                      {processingTopUp ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          Processing...
                        </div>
                      ) : (
                        pkg.inrPrice === 0 ? 'Free Registration' : `Buy ${pkg.name} - ₹${pkg.checkoutPrice}`
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Packages Modal */}
      {showTopUpPackages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#f8fafc',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  🎮 Game USD Packages
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  Choose your perfect package and get Game USD for trading
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTopUpPackages(false)}
                style={{
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  padding: '0.5rem',
                  minWidth: 'auto'
                }}
              >
                ✕
              </Button>
            </div>

            {/* Package Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {topUpPackages.map((pkg) => (
                <div key={pkg.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid',
                  borderColor: pkg.popular ? 'rgba(139, 92, 246, 0.5)' : 'rgba(51, 65, 85, 0.5)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => {
                  e.target.closest('div').style.transform = 'translateY(-4px)';
                  e.target.closest('div').style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }} onMouseLeave={(e) => {
                  e.target.closest('div').style.transform = 'translateY(0)';
                  e.target.closest('div').style.boxShadow = 'none';
                }}>
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: '2px solid rgba(15, 23, 42, 0.95)'
                    }}>
                      ⭐ Most Popular
                    </div>
                  )}

                  {/* Package Header */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#f8fafc',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {pkg.name}
                    </h4>
                    <div style={{
                      background: `linear-gradient(135deg, ${pkg.color})`,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      display: 'inline-block'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        ${pkg.usdAmount}
                      </span>
                    </div>
                  </div>

                  {/* INR Price and Game USD Amount */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    {/* INR Price - Primary Display */}
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#f8fafc',
                      marginBottom: '0.5rem'
                    }}>
                      ₹{pkg.inrPrice}
                    </div>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '1rem',
                      margin: 0,
                      marginBottom: '1rem'
                    }}>
                      Get {pkg.usdPrice.toLocaleString()} USD in Game
                    </p>
                    
                    {/* Game USD Amount - Secondary Display */}
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#14b8a6',
                      marginBottom: '0.5rem'
                    }}>
                      ${pkg.usdPrice.toLocaleString()}
                    </div>
                    <p style={{
                      color: '#14b8a6',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Game USD
                    </p>
                  </div>

                  {/* Bonus */}
                  {pkg.bonus > 0 && (
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '0.75rem'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#22c55e',
                        marginBottom: '0.25rem'
                      }}>
                        +{pkg.bonus.toLocaleString()} Bonus
                      </div>
                      <p style={{
                        color: '#16a34a',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        🎁 Extra coins for free!
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#14b8a6',
                      marginBottom: '0.25rem'
                    }}>
                      Total Value
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#f8fafc'
                    }}>
                      ${pkg.usdPrice}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    variant="primary"
                    onClick={() => handlePackageTopUp(pkg)}
                    disabled={processingTopUp || !razorpayLoaded}
                    style={{
                      width: '100%',
                      background: pkg.popular 
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                        : 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      borderRadius: '0.75rem'
                    }}
                  >
                    {processingTopUp ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing...
                      </div>
                    ) : (
                      `Buy ${pkg.name} - ₹${pkg.inrPrice}`
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Info Section */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#f8fafc',
                margin: '0 0 1rem 0'
              }}>
                ℹ️ Important Information
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#14b8a6'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Demo coins are for practice trading only
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#14b8a6'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Payment processed securely via Razorpay
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#14b8a6'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Coins added instantly after payment
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#14b8a6'
                  }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    No real money trading - 100% safe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
