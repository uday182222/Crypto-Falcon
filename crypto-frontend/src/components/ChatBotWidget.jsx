import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I\'m your Trading Assistant. How can I help you with your crypto trading today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response (you can replace this with actual API call)
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText.trim());
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Trading-related responses
    if (input.includes('bitcoin') || input.includes('btc')) {
      return 'Bitcoin is currently the most popular cryptocurrency. Would you like to know about its current price or trading strategies?';
    }
    
    if (input.includes('price') || input.includes('cost')) {
      return 'I can help you check current cryptocurrency prices. Which coin are you interested in? You can also check the live market data on your dashboard.';
    }
    
    if (input.includes('buy') || input.includes('sell')) {
      return 'For buying or selling cryptocurrencies, you can use the Trading page. Remember to always do your own research before making any trades!';
    }
    
    if (input.includes('portfolio') || input.includes('balance')) {
      return 'You can view your portfolio and balance on the Portfolio and Dashboard pages. These show your current holdings and performance.';
    }
    
    if (input.includes('help') || input.includes('how')) {
      return 'I can help you with:\n• Checking cryptocurrency prices\n• Understanding trading basics\n• Navigating the platform\n• Portfolio management\n\nWhat would you like to know more about?';
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return 'Hello! Welcome to BitcoinPro.in! I\'m here to help you with your crypto trading journey. What can I assist you with today?';
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s an interesting question! I\'m here to help with crypto trading topics. Could you be more specific?',
      'I\'d be happy to help! Could you tell me more about what you\'re looking for?',
      'Great question! For detailed information, you might want to check the relevant sections of the platform.',
      'I understand you\'re asking about that. Let me know if you need help with trading, prices, or portfolio management!'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)',
            boxShadow: '0 4px 15px rgba(149, 104, 255, 0.3)'
          }}
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <MessageCircle size={24} />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
             }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between"
               style={{
                 background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)'
               }}>
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <h3 className="font-semibold">Trading Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                  style={
                    message.sender === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)',
                          boxShadow: '0 2px 8px rgba(149, 104, 255, 0.2)'
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(5px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }
                  }
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User size={16} className="text-white mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 rounded-2xl flex items-center space-x-2"
                     style={{
                       background: 'rgba(255, 255, 255, 0.9)',
                       backdropFilter: 'blur(5px)',
                       boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                     }}>
                  <Bot size={16} className="text-purple-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about trading..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(5px)'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #9568FF 0%, #7135ff 100%)',
                  boxShadow: '0 2px 8px rgba(149, 104, 255, 0.3)'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
