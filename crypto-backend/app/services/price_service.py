import httpx
from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import time
from app.schemas.trade import PriceResponse

class CoinGeckoService:
    """Service for fetching real-time crypto prices from CoinGecko API with rate limiting and caching"""
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    
    # Mapping of common symbols to CoinGecko IDs
    COIN_ID_MAP = {
        "BTC": "bitcoin",
        "ETH": "ethereum", 
        "BNB": "binancecoin",
        "ADA": "cardano",
        "SOL": "solana",
        "DOT": "polkadot",
        "AVAX": "avalanche-2",
        "MATIC": "matic-network",
        "LINK": "chainlink",
        "UNI": "uniswap",
        "ATOM": "cosmos",
        "LTC": "litecoin",
        "XRP": "ripple",
        "DOGE": "dogecoin",
        "SHIB": "shiba-inu",
        "TRX": "tron",
        "ALGO": "algorand",
        "VET": "vechain",
        "FIL": "filecoin",
        "ICP": "internet-computer"
    }
    
    # Fallback prices for when API is unavailable
    FALLBACK_PRICES = {
        "BTC": Decimal("45234.56"),
        "ETH": Decimal("3123.45"),
        "BNB": Decimal("234.56"),
        "ADA": Decimal("0.45"),
        "SOL": Decimal("89.12"),
        "DOT": Decimal("12.34"),
        "AVAX": Decimal("23.45"),
        "MATIC": Decimal("0.89"),
        "LINK": Decimal("15.67"),
        "UNI": Decimal("6.78"),
        "ATOM": Decimal("9.87"),
        "LTC": Decimal("78.90"),
        "XRP": Decimal("0.54"),
        "DOGE": Decimal("0.08"),
        "SHIB": Decimal("0.000012"),
        "TRX": Decimal("0.067"),
        "ALGO": Decimal("0.23"),
        "VET": Decimal("0.034"),
        "FIL": Decimal("4.56"),
        "ICP": Decimal("5.67")
    }
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.cache = {}
        self.cache_duration = timedelta(minutes=5)  # Cache prices for 5 minutes
        self.last_request_time = 0
        self.min_request_interval = 2.0  # Minimum 2 seconds between requests
        self.request_count = 0
        self.rate_limit_reset = time.time()
    
    async def _rate_limit(self):
        """Implement rate limiting to avoid 429 errors"""
        current_time = time.time()
        
        # Reset request count every minute
        if current_time - self.rate_limit_reset > 60:
            self.request_count = 0
            self.rate_limit_reset = current_time
        
        # Limit to 10 requests per minute for free tier
        if self.request_count >= 10:
            sleep_time = 60 - (current_time - self.rate_limit_reset)
            if sleep_time > 0:
                print(f"Rate limit reached, waiting {sleep_time:.1f} seconds...")
                await asyncio.sleep(sleep_time)
                self.request_count = 0
                self.rate_limit_reset = time.time()
        
        # Minimum interval between requests
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - time_since_last)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    def _get_cached_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get cached price if available and not expired"""
        if coin_symbol in self.cache:
            cached_data = self.cache[coin_symbol]
            if datetime.now() - cached_data["timestamp"] < self.cache_duration:
                return cached_data["price"]
        return None
    
    def _cache_price(self, coin_symbol: str, price: PriceResponse):
        """Cache price data"""
        self.cache[coin_symbol] = {
            "price": price,
            "timestamp": datetime.now()
        }
    
    def _get_fallback_price(self, coin_symbol: str) -> PriceResponse:
        """Get fallback price when API is unavailable"""
        symbol_upper = coin_symbol.upper()
        fallback_price = self.FALLBACK_PRICES.get(symbol_upper, Decimal("100.00"))
        
        return PriceResponse(
            coin_symbol=symbol_upper,
            price_usd=fallback_price,
            price_change_24h=Decimal("0"),
            price_change_percentage_24h=Decimal("0"),
            timestamp=datetime.now()
        )
    
    async def get_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get current price for a single cryptocurrency"""
        try:
            # Check cache first
            cached_price = self._get_cached_price(coin_symbol.upper())
            if cached_price:
                return cached_price
            
            coin_id = self.COIN_ID_MAP.get(coin_symbol.upper())
            if not coin_id:
                print(f"Unsupported coin symbol: {coin_symbol}")
                return self._get_fallback_price(coin_symbol)
            
            # Apply rate limiting
            await self._rate_limit()
            
            url = f"{self.BASE_URL}/simple/price"
            params = {
                "ids": coin_id,
                "vs_currencies": "usd",
                "include_24hr_change": "true",
                "include_last_updated_at": "true"
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if coin_id in data and "usd" in data[coin_id]:
                price_data = data[coin_id]
                price = PriceResponse(
                    coin_symbol=coin_symbol.upper(),
                    price_usd=Decimal(str(price_data["usd"])),
                    price_change_24h=Decimal(str(price_data.get("usd_24h_change", 0))),
                    price_change_percentage_24h=Decimal(str(price_data.get("usd_24h_change", 0))),
                    timestamp=datetime.now()
                )
                self._cache_price(coin_symbol.upper(), price)
                return price
            else:
                return self._get_fallback_price(coin_symbol)
                    
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                print(f"Rate limit exceeded for {coin_symbol}, using fallback data")
                return self._get_fallback_price(coin_symbol)
            else:
                print(f"HTTP error fetching price for {coin_symbol}: {e}")
                return self._get_fallback_price(coin_symbol)
        except Exception as e:
            print(f"Error fetching price for {coin_symbol}: {e}")
            return self._get_fallback_price(coin_symbol)
    
    async def get_multiple_prices(self, coin_symbols: List[str]) -> Dict[str, PriceResponse]:
        """Get current prices for multiple cryptocurrencies with intelligent batching"""
        try:
            results = {}
            uncached_symbols = []
            
            # First, check cache for all symbols
            for symbol in coin_symbols:
                cached_price = self._get_cached_price(symbol.upper())
                if cached_price:
                    results[symbol.upper()] = cached_price
                else:
                    uncached_symbols.append(symbol)
            
            # If all prices are cached, return them
            if not uncached_symbols:
                return results
            
            # For uncached symbols, try to fetch from API
            # But limit to avoid rate limits
            batch_size = min(5, len(uncached_symbols))  # Process max 5 at a time
            symbols_to_fetch = uncached_symbols[:batch_size]
            
            # Convert symbols to CoinGecko IDs
            coin_ids = []
            symbol_to_id = {}
            
            for symbol in symbols_to_fetch:
                symbol_upper = symbol.upper()
                coin_id = self.COIN_ID_MAP.get(symbol_upper)
                if coin_id:
                    coin_ids.append(coin_id)
                    symbol_to_id[coin_id] = symbol_upper
            
            if coin_ids:
                try:
                    # Apply rate limiting
                    await self._rate_limit()
                    
                    url = f"{self.BASE_URL}/simple/price"
                    params = {
                        "ids": ",".join(coin_ids),
                        "vs_currencies": "usd",
                        "include_24hr_change": "true",
                        "include_last_updated_at": "true"
                    }
                    
                    response = await self.client.get(url, params=params)
                    response.raise_for_status()
                    data = response.json()
                    
                    # Process successful responses
                    for coin_id, price_data in data.items():
                        if "usd" in price_data:
                            symbol = symbol_to_id[coin_id]
                            price = PriceResponse(
                                coin_symbol=symbol,
                                price_usd=Decimal(str(price_data["usd"])),
                                price_change_24h=Decimal(str(price_data.get("usd_24h_change", 0))),
                                price_change_percentage_24h=Decimal(str(price_data.get("usd_24h_change", 0))),
                                timestamp=datetime.now()
                            )
                            results[symbol] = price
                            self._cache_price(symbol, price)
                
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        print("Rate limit exceeded, using fallback data for remaining symbols")
                    else:
                        print(f"HTTP error fetching multiple prices: {e}")
                except Exception as e:
                    print(f"Error fetching multiple prices: {e}")
            
            # For any symbols we couldn't fetch, use fallback data
            for symbol in coin_symbols:
                if symbol.upper() not in results:
                    results[symbol.upper()] = self._get_fallback_price(symbol)
            
            return results
                
        except Exception as e:
            print(f"Error in get_multiple_prices: {e}")
            # Return fallback data for all symbols
            return {symbol.upper(): self._get_fallback_price(symbol) for symbol in coin_symbols}
    
    async def get_supported_coins(self) -> List[str]:
        """Get list of supported coin symbols"""
        return list(self.COIN_ID_MAP.keys())
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global instance
price_service = CoinGeckoService()

# Utility functions
async def get_crypto_price(coin_symbol: str) -> Optional[Decimal]:
    """Get current price for a cryptocurrency symbol"""
    price_response = await price_service.get_price(coin_symbol)
    return price_response.price_usd if price_response else None

async def get_multiple_crypto_prices(coin_symbols: List[str]) -> Dict[str, Decimal]:
    """Get current prices for multiple cryptocurrency symbols"""
    price_responses = await price_service.get_multiple_prices(coin_symbols)
    return {symbol: response.price_usd for symbol, response in price_responses.items()}

def get_supported_coins() -> List[str]:
    """Get list of supported coin symbols"""
    return list(CoinGeckoService.COIN_ID_MAP.keys()) 