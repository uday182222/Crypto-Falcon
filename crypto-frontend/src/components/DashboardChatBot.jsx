import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Brain } from 'lucide-react';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://motionfalcon-backend.onrender.com';

const DashboardChatBot = ({ isVisible, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I\'m your AI Trading Assistant. I can help you with market analysis, trading strategies, risk management, and portfolio insights. How can I assist you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Make API call to chatbot endpoint
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bitcoinpro_token') || 'test-token-123'}`
        },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || data.response || data.message || 'Sorry, I couldn\'t process your request.'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Connection issue, try again. I\'m having trouble connecting to the server right now.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '1rem',
      padding: '1.5rem',
      backdropFilter: 'blur(8px)',
      marginTop: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effect */}
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
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            padding: '0.75rem',
            background: 'rgba(20, 184, 166, 0.1)',
            borderRadius: '0.75rem',
            color: '#14b8a6'
          }}>
            <Brain size={24} />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#f8fafc',
              margin: '0 0 0.25rem 0'
            }}>
              AI Trading Assistant
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              margin: 0
            }}>
              Get personalized trading insights and market analysis
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            padding: '0.5rem',
            background: 'rgba(51, 65, 85, 0.3)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '0.5rem',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(51, 65, 85, 0.5)';
            e.target.style.color = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(51, 65, 85, 0.3)';
            e.target.style.color = '#94a3b8';
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        height: '400px',
        overflowY: 'auto',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.3)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(51, 65, 85, 0.3)',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                background: message.sender === 'user' 
                  ? 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)'
                  : 'rgba(15, 23, 42, 0.5)',
                border: message.sender === 'user' 
                  ? 'none'
                  : '1px solid rgba(51, 65, 85, 0.3)',
                color: message.sender === 'user' ? '#ffffff' : '#f8fafc',
                boxShadow: message.sender === 'user' 
                  ? '0 2px 8px rgba(20, 184, 166, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                {message.sender === 'bot' && (
                  <Bot size={16} style={{ 
                    color: '#14b8a6', 
                    marginTop: '0.125rem', 
                    flexShrink: 0 
                  }} />
                )}
                {message.sender === 'user' && (
                  <User size={16} style={{ 
                    color: '#ffffff', 
                    marginTop: '0.125rem', 
                    flexShrink: 0 
                  }} />
                )}
                <div style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.3)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Bot size={16} style={{ color: '#14b8a6' }} />
              <div style={{
                display: 'flex',
                gap: '0.25rem'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.16s'
                }}></div>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#94a3b8',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out',
                  animationDelay: '0.32s'
                }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about trading strategies, market analysis, or portfolio insights..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '0.75rem',
            color: '#f8fafc',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(20, 184, 166, 0.5)';
            e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          style={{
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: (!inputText.trim() || isLoading) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '48px',
            height: '48px'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.background = 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.background = 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {isLoading ? (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardChatBot;
