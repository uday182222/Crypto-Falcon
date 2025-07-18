from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List
from datetime import datetime

from app.auth import get_current_user
from app.db import SessionLocal
from app.models.user import User
from app.models.trade import Trade
from app.models.trade import TradeType as ModelTradeType
from app.schemas.trade import (
    TradeRequest, 
    TradeResponse, 
    TradeConfirmation, 
    PriceResponse, 
    PortfolioResponse, 
    PortfolioHolding
)
from app.services.price_service import get_crypto_price, get_multiple_crypto_prices, get_supported_coins
from app.services.leaderboard_service import LeaderboardService
from app.services.achievement_service import AchievementService
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/trade", tags=["trading"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/supported-coins", response_model=List[str])
async def get_supported_coins_endpoint():
    """Get list of supported cryptocurrency symbols"""
    return get_supported_coins()

@router.get("/prices")
async def get_multiple_prices():
    """Get current prices for multiple cryptocurrencies with improved error handling"""
    try:
        # Get supported coins (limit to most popular ones to avoid rate limits)
        popular_coins = ["BTC", "ETH", "BNB", "ADA", "SOL", "DOT", "AVAX", "MATIC", "LINK", "UNI"]
        
        # Use the improved price service with caching and rate limiting
        from app.services.price_service import price_service
        price_responses = await price_service.get_multiple_prices(popular_coins)
        
        # Format response for frontend
        formatted_prices = []
        for coin_symbol, price_response in price_responses.items():
            price_float = float(price_response.price_usd)
            
            # Use real 24h change data if available, otherwise calculate from price
            if hasattr(price_response, 'price_change_24h') and price_response.price_change_24h is not None:
                change_24h = float(price_response.price_change_24h)
                change_24h_percent = float(price_response.price_change_percentage_24h) if hasattr(price_response, 'price_change_percentage_24h') else (change_24h / price_float * 100)
            else:
                # Fallback: use small random change for demo purposes
                import random
                change_percent = random.uniform(-5, 5)  # -5% to +5%
                change_24h = price_float * (change_percent / 100)
                change_24h_percent = change_percent
            
            formatted_prices.append({
                "id": len(formatted_prices) + 1,
                "symbol": coin_symbol,
                "name": get_coin_name(coin_symbol),
                "price": price_float,
                "change_24h": change_24h,
                "change_24h_percent": change_24h_percent,
                "last_updated": price_response.timestamp.isoformat()
            })
        
        return {"prices": formatted_prices, "status": "success"}
        
    except Exception as e:
        print(f"Error in get_multiple_prices endpoint: {e}")
        # Return fallback data from price service
        from app.services.price_service import CoinGeckoService
        price_service = CoinGeckoService()
        
        fallback_prices = []
        for i, coin_symbol in enumerate(get_supported_coins()[:10], 1):
            fallback_price = price_service.FALLBACK_PRICES.get(coin_symbol, 0)
            fallback_prices.append({
                "id": i,
                "symbol": coin_symbol,
                "name": get_coin_name(coin_symbol),
                "price": float(fallback_price),
                "change_24h": 0.0,  # Fallback doesn't have 24h change
                "change_24h_percent": 0.0,
                "last_updated": datetime.utcnow().isoformat()
            })
        
        return {"prices": fallback_prices, "status": "fallback"}

def get_coin_name(symbol):
    """Get full name for coin symbol"""
    coin_names = {
        "BTC": "Bitcoin",
        "ETH": "Ethereum",
        "BNB": "Binance Coin",
        "ADA": "Cardano",
        "SOL": "Solana",
        "DOT": "Polkadot",
        "AVAX": "Avalanche",
        "MATIC": "Polygon",
        "LINK": "Chainlink",
        "UNI": "Uniswap",
        "ATOM": "Cosmos",
        "LTC": "Litecoin",
        "XRP": "Ripple",
        "DOGE": "Dogecoin",
        "SHIB": "Shiba Inu",
        "TRX": "Tron",
        "ALGO": "Algorand",
        "VET": "VeChain",
        "FIL": "Filecoin",
        "ICP": "Internet Computer"
    }
    return coin_names.get(symbol, symbol)

@router.get("/price/{coin_symbol}", response_model=PriceResponse)
async def get_coin_price(coin_symbol: str):
    """Get current price for a cryptocurrency"""
    from app.services.price_service import price_service
    
    coin_symbol_upper = coin_symbol.upper()
    
    # Check if coin is supported
    if coin_symbol_upper not in get_supported_coins():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported coin symbol: {coin_symbol_upper}"
        )
    
    price_response = await price_service.get_price(coin_symbol_upper)
    if not price_response:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to fetch price for {coin_symbol_upper}"
        )
    
    return price_response

@router.post("/buy")
async def buy_crypto(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Buy cryptocurrency with DemoCoins"""
    
    # Validate coin symbol
    coin_symbol = trade_request.coin_symbol.upper()
    if coin_symbol not in get_supported_coins():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported coin symbol: {coin_symbol}"
        )
    
    # Get current price from CoinGecko
    current_price = await get_crypto_price(coin_symbol)
    if not current_price:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to fetch current price for {coin_symbol}"
        )
    
    # Calculate total cost
    total_cost = trade_request.quantity * current_price
    
    # Check wallet balance using new wallet system
    wallet_service = WalletService(db)
    wallet = wallet_service.get_or_create_wallet(current_user.id)
    
    if wallet.balance < total_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Required: {total_cost}, Available: {wallet.balance}"
        )
    
    # Deduct from wallet
    wallet_result = wallet_service.deduct_from_wallet(current_user.id, total_cost)
    
    # Create trade record
    trade = Trade(
        user_id=current_user.id,
        coin_symbol=coin_symbol,
        side="BUY",  # Use enum string directly
        quantity=trade_request.quantity,
        price_at_trade=current_price,
        total_cost=total_cost
    )
    
    # Save to database
    db.add(trade)
    db.commit()
    db.refresh(trade)
    
    # Update leaderboard entry for user
    try:
        leaderboard_service = LeaderboardService(db)
        await leaderboard_service.update_user_leaderboard_entry(current_user)
    except Exception as e:
        # Log error but don't fail the trade
        print(f"Error updating leaderboard: {e}")
    
    # Check and award achievements
    try:
        achievement_service = AchievementService(db)
        await achievement_service.check_and_award_achievements(current_user)
    except Exception as e:
        # Log error but don't fail the trade
        print(f"Error checking achievements: {e}")
    
    return {
        "success": True,
        "trade_id": trade.id,
        "coin_symbol": coin_symbol,
        "quantity": float(trade_request.quantity),
        "price": float(current_price),
        "total_cost": float(total_cost),
        "new_balance": float(wallet_result['new_balance']),
        "message": f"Successfully bought {trade_request.quantity} {coin_symbol} at ${current_price} each"
    }

@router.post("/sell", response_model=TradeConfirmation)
async def sell_crypto(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sell cryptocurrency for DemoCoins"""
    
    # Validate coin symbol
    coin_symbol = trade_request.coin_symbol.upper()
    if coin_symbol not in get_supported_coins():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported coin symbol: {coin_symbol}"
        )
    
    # Get current user from database to ensure it's attached to this session
    current_user = db.query(User).filter(User.id == current_user.id).first()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Calculate current holdings for this coin
    buys = db.query(Trade).filter(
        Trade.user_id == current_user.id,
        Trade.coin_symbol == coin_symbol,
        Trade.side == ModelTradeType.BUY
    ).all()
    
    sells = db.query(Trade).filter(
        Trade.user_id == current_user.id,
        Trade.coin_symbol == coin_symbol,
        Trade.side == ModelTradeType.SELL
    ).all()
    
    total_bought = sum(trade.quantity for trade in buys)
    total_sold = sum(trade.quantity for trade in sells)
    current_holdings = total_bought - total_sold
    
    # Check if user has enough coins to sell
    if current_holdings < trade_request.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient {coin_symbol} balance. Required: {trade_request.quantity}, Available: {current_holdings}"
        )
    
    # Get current price
    current_price = await get_crypto_price(coin_symbol)
    if not current_price:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to fetch current price for {coin_symbol}"
        )
    
    # Calculate total value
    total_value = trade_request.quantity * current_price
    
    # Add to wallet using new wallet system
    wallet_service = WalletService(db)
    wallet_result = wallet_service.top_up_wallet(current_user.id, total_value)
    
    # Create trade record
    trade = Trade(
        user_id=current_user.id,
        coin_symbol=coin_symbol,
        side=ModelTradeType.SELL,
        quantity=trade_request.quantity,
        price_at_trade=current_price,
        total_cost=total_value
    )
    
    # Save to database
    db.add(trade)
    db.commit()
    db.refresh(trade)
    
    # Update leaderboard entry for user
    try:
        leaderboard_service = LeaderboardService(db)
        await leaderboard_service.update_user_leaderboard_entry(current_user)
    except Exception as e:
        # Log error but don't fail the trade
        print(f"Error updating leaderboard: {e}")
    
    # Check and award achievements
    try:
        achievement_service = AchievementService(db)
        await achievement_service.check_and_award_achievements(current_user)
    except Exception as e:
        # Log error but don't fail the trade
        print(f"Error checking achievements: {e}")
    
    return TradeConfirmation(
        trade=trade,
        new_balance=wallet_result['new_balance'],
        message=f"Successfully sold {trade_request.quantity} {coin_symbol} at ${current_price} each"
    )

@router.get("/portfolio", response_model=PortfolioResponse)
async def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's portfolio with current holdings and P&L"""
    
    # Get all user trades
    trades = db.query(Trade).filter(Trade.user_id == current_user.id).all()
    
    # Calculate holdings by coin
    holdings_data = {}
    
    for trade in trades:
        coin = trade.coin_symbol
        if coin not in holdings_data:
            holdings_data[coin] = {
                'total_bought': Decimal('0'),
                'total_sold': Decimal('0'),
                'total_spent': Decimal('0'),
                'total_received': Decimal('0')
            }
        
        if trade.side == ModelTradeType.BUY:
            holdings_data[coin]['total_bought'] += trade.quantity
            holdings_data[coin]['total_spent'] += trade.total_cost
        else:  # SELL
            holdings_data[coin]['total_sold'] += trade.quantity
            holdings_data[coin]['total_received'] += trade.total_cost
    
    # Filter out coins with zero holdings
    current_holdings = {}
    for coin, data in holdings_data.items():
        net_quantity = data['total_bought'] - data['total_sold']
        if net_quantity > 0:
            current_holdings[coin] = {
                'quantity': net_quantity,
                'total_invested': data['total_spent'] - data['total_received'],
                'avg_buy_price': data['total_spent'] / data['total_bought'] if data['total_bought'] > 0 else Decimal('0')
            }
    
    # Get current prices for all holdings
    if current_holdings:
        current_prices = await get_multiple_crypto_prices(list(current_holdings.keys()))
    else:
        current_prices = {}
    
    # Calculate portfolio metrics
    portfolio_holdings = []
    total_current_value = Decimal('0')
    total_invested = Decimal('0')
    
    for coin, holding in current_holdings.items():
        current_price = current_prices.get(coin, Decimal('0'))
        current_value = holding['quantity'] * current_price
        profit_loss = current_value - holding['total_invested']
        profit_loss_percent = (profit_loss / holding['total_invested'] * 100) if holding['total_invested'] > 0 else Decimal('0')
        
        portfolio_holdings.append(PortfolioHolding(
            coin_symbol=coin,
            quantity=holding['quantity'],
            current_price=current_price,
            current_value=current_value,
            avg_buy_price=holding['avg_buy_price'],
            total_invested=holding['total_invested'],
            profit_loss=profit_loss,
            profit_loss_percent=profit_loss_percent
        ))
        
        total_current_value += current_value
        total_invested += holding['total_invested']
    
    # Calculate total portfolio P&L
    total_profit_loss = total_current_value - total_invested
    total_profit_loss_percent = (total_profit_loss / total_invested * 100) if total_invested > 0 else Decimal('0')
    
    # Get wallet balance
    wallet_service = WalletService(db)
    wallet = wallet_service.get_or_create_wallet(current_user.id)
    
    return PortfolioResponse(
        demo_balance=wallet.balance,
        total_portfolio_value=total_current_value,
        total_invested=total_invested,
        total_profit_loss=total_profit_loss,
        total_profit_loss_percent=total_profit_loss_percent,
        holdings=portfolio_holdings
    )

@router.post("/", response_model=TradeConfirmation)
async def execute_trade(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a trade (buy or sell) using the new wallet system"""
    
    # Validate coin symbol
    coin_symbol = trade_request.coin_symbol.upper()
    if coin_symbol not in get_supported_coins():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported coin symbol: {coin_symbol}"
        )
    
    # Get current price from CoinGecko
    current_price = await get_crypto_price(coin_symbol)
    if not current_price:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to fetch current price for {coin_symbol}"
        )
    
    # Initialize services
    wallet_service = WalletService(db)
    leaderboard_service = LeaderboardService(db)
    achievement_service = AchievementService(db)
    
    try:
        if trade_request.side == TradeType.BUY:
            # BUY operation
            total_cost = trade_request.quantity * current_price
            
            # Check wallet balance
            wallet = wallet_service.get_or_create_wallet(current_user.id)
            if wallet.balance < total_cost:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient balance. Required: {total_cost}, Available: {wallet.balance}"
                )
            
            # Deduct from wallet
            wallet_result = wallet_service.deduct_from_wallet(current_user.id, total_cost)
            
            # Create trade record
            trade = Trade(
                user_id=current_user.id,
                coin_symbol=coin_symbol,
                side=TradeType.BUY,
                quantity=trade_request.quantity,
                price_at_trade=current_price,
                total_cost=total_cost
            )
            
            db.add(trade)
            db.commit()
            db.refresh(trade)
            
            message = f"Successfully bought {trade_request.quantity} {coin_symbol} at ${current_price} each"
            
        else:
            # SELL operation
            # Calculate current holdings for this coin
            buys = db.query(Trade).filter(
                Trade.user_id == current_user.id,
                Trade.coin_symbol == coin_symbol,
                Trade.side == ModelTradeType.BUY
            ).all()
            
            sells = db.query(Trade).filter(
                Trade.user_id == current_user.id,
                Trade.coin_symbol == coin_symbol,
                Trade.side == ModelTradeType.SELL
            ).all()
            
            total_bought = sum(trade.quantity for trade in buys)
            total_sold = sum(trade.quantity for trade in sells)
            current_holdings = total_bought - total_sold
            
            # Check if user has enough coins to sell
            if current_holdings < trade_request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient {coin_symbol} balance. Required: {trade_request.quantity}, Available: {current_holdings}"
                )
            
            # Calculate total value
            total_value = trade_request.quantity * current_price
            
            # Add to wallet
            wallet_result = wallet_service.top_up_wallet(current_user.id, total_value)
            
            # Create trade record
            trade = Trade(
                user_id=current_user.id,
                coin_symbol=coin_symbol,
                side=TradeType.SELL,
                quantity=trade_request.quantity,
                price_at_trade=current_price,
                total_cost=total_value
            )
            
            db.add(trade)
            db.commit()
            db.refresh(trade)
            
            message = f"Successfully sold {trade_request.quantity} {coin_symbol} at ${current_price} each"
        
        # Update leaderboard entry for user
        try:
            await leaderboard_service.update_user_leaderboard_entry(current_user)
        except Exception as e:
            print(f"Error updating leaderboard: {e}")
        
        # Check and award achievements
        try:
            await achievement_service.check_and_award_achievements(current_user)
        except Exception as e:
            print(f"Error checking achievements: {e}")
        
        return TradeConfirmation(
            trade=trade,
            new_balance=wallet_result['new_balance'],
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trade execution failed: {str(e)}"
        )

@router.get("/history", response_model=List[TradeResponse])
async def get_trade_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's trade history"""
    trades = db.query(Trade).filter(
        Trade.user_id == current_user.id
    ).order_by(Trade.timestamp.desc()).all()
    
    return [TradeResponse.model_validate(trade) for trade in trades] 