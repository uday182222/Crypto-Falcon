from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

@router.post("/api/chatbot", response_model=ChatResponse)
async def chatbot_endpoint(message_data: ChatMessage):
    """
    Chatbot endpoint that provides trading assistance
    """
    try:
        user_message = message_data.message.lower().strip()
        
        # Trading-related responses
        if any(keyword in user_message for keyword in ['bitcoin', 'btc']):
            response = "Bitcoin is currently the most popular cryptocurrency. Would you like to know about its current price or trading strategies?"
        
        elif any(keyword in user_message for keyword in ['price', 'cost', 'value']):
            response = "I can help you check current cryptocurrency prices. Which coin are you interested in? You can also check the live market data on your dashboard."
        
        elif any(keyword in user_message for keyword in ['buy', 'sell', 'trade', 'trading']):
            response = "For buying or selling cryptocurrencies, you can use the Trading page. Remember to always do your own research before making any trades!"
        
        elif any(keyword in user_message for keyword in ['portfolio', 'balance', 'wallet']):
            response = "You can view your portfolio and balance on the Portfolio and Dashboard pages. These show your current holdings and performance."
        
        elif any(keyword in user_message for keyword in ['help', 'how', 'what', 'guide']):
            response = "I can help you with:\n• Checking cryptocurrency prices\n• Understanding trading basics\n• Navigating the platform\n• Portfolio management\n\nWhat would you like to know more about?"
        
        elif any(keyword in user_message for keyword in ['hello', 'hi', 'hey', 'greetings']):
            response = "Hello! Welcome to BitcoinPro.in! I'm here to help you with your crypto trading journey. What can I assist you with today?"
        
        elif any(keyword in user_message for keyword in ['ethereum', 'eth']):
            response = "Ethereum is the second-largest cryptocurrency by market cap. It's known for its smart contract functionality and DeFi ecosystem. Would you like to know more about its current price or use cases?"
        
        elif any(keyword in user_message for keyword in ['altcoin', 'altcoins', 'alternative']):
            response = "Altcoins are alternative cryptocurrencies to Bitcoin. Popular ones include Ethereum, Binance Coin, Cardano, and Solana. Each has unique features and use cases. Which altcoin interests you?"
        
        elif any(keyword in user_message for keyword in ['defi', 'decentralized']):
            response = "DeFi (Decentralized Finance) refers to financial services built on blockchain networks. It includes lending, borrowing, trading, and yield farming. Many DeFi tokens are available for trading on our platform."
        
        elif any(keyword in user_message for keyword in ['nft', 'nfts', 'non-fungible']):
            response = "NFTs (Non-Fungible Tokens) are unique digital assets. While we focus on cryptocurrency trading, NFTs represent a different asset class. Are you interested in learning about crypto trading instead?"
        
        elif any(keyword in user_message for keyword in ['profit', 'loss', 'gain', 'earn']):
            response = "Trading cryptocurrencies can be profitable but also risky. Always do your own research, never invest more than you can afford to lose, and consider your risk tolerance. Start with small amounts to learn."
        
        elif any(keyword in user_message for keyword in ['risk', 'safe', 'dangerous']):
            response = "Cryptocurrency trading involves significant risk. Prices can be very volatile. Only invest what you can afford to lose, diversify your portfolio, and never trade with money you need for essential expenses."
        
        elif any(keyword in user_message for keyword in ['strategy', 'strategies', 'tips']):
            response = "Some basic trading strategies include:\n• Dollar-cost averaging\n• Setting stop-losses\n• Diversifying your portfolio\n• Doing thorough research\n• Not letting emotions drive decisions"
        
        elif any(keyword in user_message for keyword in ['market', 'bull', 'bear']):
            response = "Crypto markets can be bullish (rising) or bearish (falling). Market conditions change frequently. It's important to stay informed and not make decisions based on short-term market movements."
        
        elif any(keyword in user_message for keyword in ['wallet', 'storage', 'security']):
            response = "For trading on our platform, your funds are stored securely. For long-term storage, consider hardware wallets or secure software wallets. Never share your private keys with anyone."
        
        elif any(keyword in user_message for keyword in ['fees', 'cost', 'commission']):
            response = "Our platform charges minimal fees for trading. Check the trading page for current fee structures. Always factor in fees when calculating potential profits or losses."
        
        elif any(keyword in user_message for keyword in ['support', 'contact', 'help']):
            response = "For technical support or account issues, you can contact our support team at support@bitcoinpro.in. I'm here for general trading questions and platform guidance."
        
        else:
            # Default responses for unrecognized queries
            default_responses = [
                "That's an interesting question! I'm here to help with crypto trading topics. Could you be more specific about what you'd like to know?",
                "I'd be happy to help! Could you tell me more about what you're looking for? I can assist with trading, prices, portfolio management, and platform navigation.",
                "Great question! For detailed information, you might want to check the relevant sections of the platform. What specific aspect of crypto trading interests you?",
                "I understand you're asking about that. Let me know if you need help with trading strategies, current prices, portfolio management, or navigating the platform!"
            ]
            import random
            response = random.choice(default_responses)
        
        logger.info(f"Chatbot response generated for message: {message_data.message}")
        
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/api/chatbot/health")
async def chatbot_health():
    """
    Health check endpoint for the chatbot service
    """
    return {"status": "healthy", "service": "chatbot"}
