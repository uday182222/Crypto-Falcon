import httpx
from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import time
import logging
from app.schemas.trade import PriceResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    
    # Fallback prices for when API is unavailable (Updated to current market values)
    FALLBACK_PRICES = {
        "BTC": Decimal("110000.00"),      # Updated from 45234.56
        "ETH": Decimal("6500.00"),        # Updated from 3123.45
        "BNB": Decimal("650.00"),         # Updated from 234.56
        "ADA": Decimal("0.65"),           # Updated from 0.45
        "SOL": Decimal("150.00"),         # Updated from 89.12
        "DOT": Decimal("8.50"),           # Updated from 12.34
        "AVAX": Decimal("35.00"),         # Updated from 23.45
        "MATIC": Decimal("0.95"),         # Updated from 0.89
        "LINK": Decimal("18.00"),         # Updated from 15.67
        "UNI": Decimal("8.50"),           # Updated from 6.78
        "ATOM": Decimal("12.00"),         # Updated from 9.87
        "LTC": Decimal("85.00"),          # Updated from 78.90
        "XRP": Decimal("0.65"),           # Updated from 0.54
        "DOGE": Decimal("0.12"),          # Updated from 0.08
        "SHIB": Decimal("0.000025"),      # Updated from 0.000012
        "TRX": Decimal("0.12"),           # Updated from 0.067
        "ALGO": Decimal("0.18"),          # Updated from 0.23
        "VET": Decimal("0.045"),          # Updated from 0.034
        "FIL": Decimal("6.50"),           # Updated from 4.56
        "ICP": Decimal("12.50")           # Updated from 5.67
    }
    
    def __init__(self):
        # Use a more robust HTTP client with better timeout and retry settings
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
            http2=False  # Disable HTTP/2 for now to avoid import issues
        )
        self.cache = {}
        self.cache_duration = timedelta(seconds=30)  # Cache prices for only 30 seconds for better accuracy
        self.last_request_time = 0
        self.min_request_interval = 2.0  # Minimum 2 seconds between requests
        self.request_count = 0
        self.rate_limit_reset = time.time()
        self.consecutive_failures = 0
        self.max_consecutive_failures = 3
    
    async def _rate_limit(self):
        """Implement rate limiting to avoid 429 errors"""
        current_time = time.time()
        
        # Reset request count every minute
        if current_time - self.rate_limit_reset > 60:
            self.request_count = 0
            self.rate_limit_reset = current_time
        
        # Limit to 8 requests per minute for free tier (more conservative)
        if self.request_count >= 8:
            sleep_time = 60 - (current_time - self.rate_limit_reset)
            if sleep_time > 0:
                logger.info(f"Rate limit reached, waiting {sleep_time:.1f} seconds...")
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
            if datetime.utcnow() - cached_data.timestamp < self.cache_duration:
                return cached_data
            else:
                # Remove expired cache entry
                del self.cache[coin_symbol]
        return None
    
    def _cache_price(self, coin_symbol: str, price: PriceResponse):
        """Cache a price response"""
        self.cache[coin_symbol] = price
    
    def clear_cache(self, coin_symbol: str = None):
        """Clear cache for specific coin or all coins"""
        if coin_symbol:
            if coin_symbol in self.cache:
                del self.cache[coin_symbol]
        else:
            self.cache.clear()
    
    async def get_fresh_price_for_trading(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get fresh price for trading (bypasses cache)"""
        # Clear cache for this coin to force fresh price
        self.clear_cache(coin_symbol.upper())
        
        # Get fresh price
        price_response = await self.get_price(coin_symbol)
        if not price_response:
            return None
        
        # Validate that the price is reasonable (not using old fallback)
        fallback_price = self.FALLBACK_PRICES.get(coin_symbol.upper(), Decimal("0"))
        if price_response.price_usd == fallback_price:
            logger.warning(f"Price service returned fallback price for {coin_symbol}, this may indicate API issues")
        
        return price_response
    
    def _get_fallback_price(self, coin_symbol: str) -> PriceResponse:
        """Get fallback price when API is unavailable"""
        fallback_price = self.FALLBACK_PRICES.get(coin_symbol, Decimal("0"))
        return PriceResponse(
            coin_symbol=coin_symbol,
            price_usd=fallback_price,
            timestamp=datetime.utcnow()
        )
    
    async def _make_api_request(self, url: str, retries: int = 3) -> Optional[dict]:
        """Make API request with retry logic and better error handling"""
        for attempt in range(retries):
            try:
                await self._rate_limit()
                
                logger.info(f"Making API request to {url} (attempt {attempt + 1}/{retries})")
                response = await self.client.get(url)
                
                if response.status_code == 200:
                    self.consecutive_failures = 0  # Reset failure counter on success
                    return response.json()
                elif response.status_code == 429:
                    logger.warning("Rate limited by API, using fallback data")
                    return None
                else:
                    logger.warning(f"API returned status {response.status_code}")
                    
            except httpx.ConnectError as e:
                logger.error(f"Connection error (attempt {attempt + 1}): {e}")
                self.consecutive_failures += 1
            except httpx.TimeoutException as e:
                logger.error(f"Timeout error (attempt {attempt + 1}): {e}")
                self.consecutive_failures += 1
            except Exception as e:
                logger.error(f"Unexpected error (attempt {attempt + 1}): {e}")
                self.consecutive_failures += 1
            
            # Wait before retry (exponential backoff)
            if attempt < retries - 1:
                wait_time = 2 ** attempt
                logger.info(f"Waiting {wait_time} seconds before retry...")
                await asyncio.sleep(wait_time)
        
        return None
    
    async def get_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get current price for a single cryptocurrency"""
        try:
            # Check cache first
            cached_price = self._get_cached_price(coin_symbol)
            if cached_price:
                logger.info(f"Returning cached price for {coin_symbol}")
                return cached_price
            
            # If too many consecutive failures, use fallback immediately
            if self.consecutive_failures >= self.max_consecutive_failures:
                logger.warning(f"Too many consecutive failures ({self.consecutive_failures}), using fallback for {coin_symbol}")
                fallback_price = self._get_fallback_price(coin_symbol)
                self._cache_price(coin_symbol, fallback_price)
                return fallback_price
            
            coin_id = self.COIN_ID_MAP.get(coin_symbol.upper())
            if not coin_id:
                logger.error(f"Unsupported coin symbol: {coin_symbol}")
                return None
            
            url = f"{self.BASE_URL}/simple/price?ids={coin_id}&vs_currencies=usd&include_24hr_change=true"
            
            data = await self._make_api_request(url)
            if data and coin_id in data:
                price_data = data[coin_id]
                price_usd = Decimal(str(price_data.get('usd', 0)))
                change_24h = price_data.get('usd_24h_change', 0)
                
                price_response = PriceResponse(
                    coin_symbol=coin_symbol.upper(),
                    price_usd=price_usd,
                    price_change_24h=Decimal(str(change_24h)),
                    price_change_percentage_24h=Decimal(str(change_24h)),
                    timestamp=datetime.utcnow()
                )
                
                self._cache_price(coin_symbol, price_response)
                logger.info(f"Successfully fetched price for {coin_symbol}: ${price_usd}")
                return price_response
            else:
                logger.warning(f"Failed to fetch price for {coin_symbol}, using fallback")
                fallback_price = self._get_fallback_price(coin_symbol)
                self._cache_price(coin_symbol, fallback_price)
                return fallback_price
                
        except Exception as e:
            logger.error(f"Error fetching price for {coin_symbol}: {e}")
            fallback_price = self._get_fallback_price(coin_symbol)
            self._cache_price(coin_symbol, fallback_price)
            return fallback_price
    
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
                logger.info("All prices retrieved from cache")
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
                                timestamp=datetime.utcnow()
                            )
                            results[symbol] = price
                            self._cache_price(symbol, price)
                
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429:
                        logger.warning("Rate limited by API, using fallback data for remaining symbols")
                    else:
                        logger.error(f"HTTP error fetching multiple prices: {e}")
                    
                    # Use fallback for failed symbols
                    for symbol in symbols_to_fetch:
                        if symbol.upper() not in results:
                            fallback_price = self._get_fallback_price(symbol)
                            results[symbol.upper()] = fallback_price
                            self._cache_price(symbol, fallback_price)
                
                except Exception as e:
                    logger.error(f"Error fetching multiple prices: {e}")
                    # Use fallback for failed symbols
                    for symbol in symbols_to_fetch:
                        if symbol.upper() not in results:
                            fallback_price = self._get_fallback_price(symbol)
                            results[symbol.upper()] = fallback_price
                            self._cache_price(symbol, fallback_price)
            else:
                # No valid coin IDs found, use fallback for all
                for symbol in symbols_to_fetch:
                    fallback_price = self._get_fallback_price(symbol)
                    results[symbol.upper()] = fallback_price
                    self._cache_price(symbol, fallback_price)
            
            logger.info(f"Successfully fetched prices for {len(results)} symbols")
            return results
            
        except Exception as e:
            logger.error(f"Error in get_multiple_prices: {e}")
            # Return fallback prices for all requested symbols
            fallback_results = {}
            for symbol in coin_symbols:
                fallback_price = self._get_fallback_price(symbol)
                fallback_results[symbol.upper()] = fallback_price
            return fallback_results
    
    async def get_supported_coins(self) -> List[str]:
        """Get list of supported cryptocurrency symbols"""
        return list(self.COIN_ID_MAP.keys())
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global price service instance
price_service = CoinGeckoService()

async def get_crypto_price(coin_symbol: str) -> Optional[Decimal]:
    """Get current price for a single cryptocurrency (legacy function)"""
    price_response = await price_service.get_price(coin_symbol)
    return price_response.price_usd if price_response else None

async def get_multiple_crypto_prices(coin_symbols: List[str]) -> Dict[str, Decimal]:
    """Get current prices for multiple cryptocurrencies (legacy function)"""
    price_responses = await price_service.get_multiple_prices(coin_symbols)
    return {symbol: response.price_usd for symbol, response in price_responses.items()}

def get_supported_coins() -> List[str]:
    """Get list of supported cryptocurrency symbols (legacy function)"""
    return list(CoinGeckoService.COIN_ID_MAP.keys()) 