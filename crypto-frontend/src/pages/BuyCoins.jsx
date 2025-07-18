import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { purchaseAPI } from '../services/api';
import { Coins, Shield, Zap, Star, Check, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';

const BuyCoins = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchBalance = async () => {
    try {
      // Get balance from portfolio API
      const response = await fetch('http://127.0.0.1:8000/trade/portfolio', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.demo_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await purchaseAPI.getPackages();
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setToastMessage('Failed to load packages. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handlePurchase = async (packageId) => {
    try {
      setPurchasing(packageId);
      
      // Create order
      const orderResponse = await purchaseAPI.createOrder({ package_id: packageId });
      
      if (!orderResponse.data) {
        throw new Error('Failed to create order');
      }

      const { order_id, amount, currency, package_name } = orderResponse.data;
      const selectedPackage = packages.find(p => p.id === packageId);

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_rjWYPFN2F7k22B', // Replace with your Razorpay key
        amount: amount,
        currency: currency,
        name: 'MotionFalcon',
        description: `${package_name} - Demo Coins`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await purchaseAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setToastMessage(`Payment successful! ${verifyResponse.data.coins_received.toLocaleString()} coins added to your account.`);
              setToastType('success');
              setShowToast(true);
              
              // Update balance
              setBalance(verifyResponse.data.new_balance);
            } else {
              setToastMessage('Payment verification failed. Please contact support.');
              setToastType('error');
              setShowToast(true);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setToastMessage('Payment verification failed. Please contact support.');
            setToastType('error');
            setShowToast(true);
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setPurchasing(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Purchase error:', error);
      setToastMessage('Failed to initiate payment. Please try again.');
      setToastType('error');
      setShowToast(true);
      setPurchasing(null);
    }
  };

  const handleDirectTopup = async (amountInr) => {
    try {
      setPurchasing('direct');
      
      // Create direct top-up order using API service
      const orderResponse = await purchaseAPI.createDirectTopupOrder({ amount_inr: amountInr });
      
      if (!orderResponse.data) {
        throw new Error('Failed to create order');
      }

      const orderData = orderResponse.data;
      const { order_id, amount, currency, coins_to_add, description } = orderData;

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_rjWYPFN2F7k22B',
        amount: amount,
        currency: currency,
        name: 'MotionFalcon',
        description: description,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await purchaseAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setToastMessage(`Top-up successful! ${verifyResponse.data.coins_received.toLocaleString()} coins added to your account.`);
              setToastType('success');
              setShowToast(true);
              
              // Update balance
              setBalance(verifyResponse.data.new_balance);
            } else {
              setToastMessage('Payment verification failed. Please contact support.');
              setToastType('error');
              setShowToast(true);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setToastMessage('Payment verification failed. Please contact support.');
            setToastType('error');
            setShowToast(true);
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || ''
        },
        theme: {
          color: '#22c55e'
        },
        modal: {
          ondismiss: function() {
            setPurchasing(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Direct top-up error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to initiate top-up. Please try again.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      setPurchasing(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchPackages()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem'
          }} className="text-gradient">
            Buy Demo Coins
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.125rem'
          }}>
            Purchase demo coins to enhance your trading experience
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '1rem 2rem',
          borderRadius: '50px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }} className="glass glow-effect">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coins style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />
            <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Balance</span>
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#22c55e'
          }}>
            {balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Direct Top-up Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1rem'
        }}>
          Quick Top-up
        </h2>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '1rem',
          marginBottom: '1.5rem'
        }}>
          Add coins directly to your wallet with flexible amounts
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[50, 100, 200, 500, 1000].map((amount) => {
            const coins = amount * 50; // ₹1 = 50 coins
            return (
              <Card key={amount} variant="glass-dark" className="glow-effect">
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Coins style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                  </div>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: '#f8fafc',
                    marginBottom: '0.5rem'
                  }}>
                    ₹{amount}
                  </div>
                  
                  <div style={{ 
                    fontSize: '1rem', 
                    color: '#22c55e',
                    marginBottom: '1rem',
                    fontWeight: '600'
                  }}>
                    {coins.toLocaleString()} Coins
                  </div>
                  
                  <Button
                    onClick={() => handleDirectTopup(amount)}
                    disabled={purchasing === 'direct'}
                    variant="primary"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {purchasing === 'direct' ? 'Processing...' : 'Top-up Now'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap style={{ width: '1rem', height: '1rem', color: '#22c55e' }} />
            <span style={{ color: '#22c55e', fontWeight: '600' }}>Simple Rate: ₹1 = 50 Demo Coins</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            No packages, no bonuses - just straightforward coin purchase
          </p>
        </div>
      </div>

      {/* Packages */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '1rem'
        }}>
          Value Packages
        </h2>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '1rem',
          marginBottom: '1.5rem'
        }}>
          Get bonus coins with our curated packages
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem', 
        marginBottom: '3rem'
      }}>
        {packages.map((pkg) => {
          const baseCoins = pkg.coins_per_inr * pkg.price;
          const bonusCoins = baseCoins * (pkg.bonus_percentage / 100);
          const totalCoins = baseCoins + bonusCoins;
          const isPopular = pkg.name === 'Pro Pack';
          
          const gradients = {
            'Starter Pack': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            'Pro Pack': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            'Premium Pack': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'Ultimate Pack': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          };

          const icons = {
            'Starter Pack': <Coins style={{ width: '2rem', height: '2rem', color: 'white' }} />,
            'Pro Pack': <Star style={{ width: '2rem', height: '2rem', color: 'white' }} />,
            'Premium Pack': <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />,
            'Ultimate Pack': <Zap style={{ width: '2rem', height: '2rem', color: 'white' }} />
          };

          return (
            <Card key={pkg.id} variant="glass-dark" className="glow-effect">
              <div style={{ position: 'relative', padding: '2rem' }}>
                {isPopular && (
                  <div style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.3)'
                  }}>
                    ⭐ Most Popular
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: gradients[pkg.name] || gradients['Starter Pack'],
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    {icons[pkg.name] || icons['Starter Pack']}
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: '#f8fafc',
                    marginBottom: '0.5rem'
                  }}>
                    {pkg.name}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '700', 
                    color: '#f8fafc',
                    marginBottom: '0.25rem'
                  }}>
                    ₹{pkg.price}
                  </div>
                  
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#94a3b8'
                  }}>
                    {totalCoins.toLocaleString()} Demo Coins
                  </p>
                  
                  {pkg.bonus_percentage > 0 && (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <span style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: '600' }}>
                        +{pkg.bonus_percentage}% Bonus Coins
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      {baseCoins.toLocaleString()} Base Coins
                    </span>
                  </div>
                  
                  {pkg.bonus_percentage > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Star style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        {bonusCoins.toLocaleString()} Bonus Coins
                      </span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Secure Payment via Razorpay
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Zap style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Instant Delivery
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  variant="primary"
                  style={{
                    width: '100%',
                    background: gradients[pkg.name] || gradients['Starter Pack'],
                    padding: '0.75rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {purchasing === pkg.id ? (
                    <RefreshCw style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <CreditCard style={{ width: '1rem', height: '1rem' }} />
                  )}
                  {purchasing === pkg.id ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Features Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Why Choose Our Demo Coins?
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem'
        }}>
          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Shield style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#f8fafc',
                marginBottom: '0.5rem'
              }}>
                Safe & Secure
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                All transactions are encrypted and secure. Your data is protected with industry-standard security.
              </p>
            </div>
          </Card>

          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Zap style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#f8fafc',
                marginBottom: '0.5rem'
              }}>
                Instant Delivery
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Coins are added to your account instantly after purchase. Start trading immediately.
              </p>
            </div>
          </Card>

          <Card variant="glass-dark" className="glow-effect">
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Star style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#f8fafc',
                marginBottom: '0.5rem'
              }}>
                Best Value
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Get the most coins for your money. Our packages offer the best value in the market.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{ 
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '1rem',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <Coins style={{ 
          width: '3rem', 
          height: '3rem', 
          color: '#3b82f6',
          margin: '0 auto 1rem'
        }} />
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#f8fafc',
          marginBottom: '0.5rem'
        }}>
          Ready to Start Trading?
        </h3>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          Purchase demo coins now and start your crypto trading journey with confidence
        </p>
        <Button 
          variant="primary"
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '0.75rem 2rem'
          }}
        >
          Explore Packages
        </Button>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default BuyCoins; 