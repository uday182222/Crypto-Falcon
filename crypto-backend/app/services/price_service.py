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
    """Service for fetching real-time crypto prices from multiple sources with intelligent fallback"""
    
    # Primary API (CoinGecko)
    COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
    
    # Backup APIs (free tiers)
    BACKUP_APIS = {
        "binance": {
            "base_url": "https://api.binance.com/api/v3",
            "endpoint": "/ticker/price",
            "symbol_mapping": {
                "BTC": "BTCUSDT",
                "ETH": "ETHUSDT",
                "BNB": "BNBUSDT",
                "ADA": "ADAUSDT",
                "SOL": "SOLUSDT",
                "DOT": "DOTUSDT",
                "AVAX": "AVAXUSDT",
                "MATIC": "MATICUSDT",
                "LINK": "LINKUSDT",
                "UNI": "UNIUSDT",
                "ATOM": "ATOMUSDT",
                "LTC": "LTCUSDT",
                "XRP": "XRPUSDT",
                "DOGE": "DOGEUSDT",
                "SHIB": "SHIBUSDT",
                "TRX": "TRXUSDT",
                "ALGO": "ALGOUSDT",
                "VET": "VETUSDT",
                "FIL": "FILUSDT",
                "ICP": "ICPUSDT"
            }
        },
        "coinbase": {
            "base_url": "https://api.coinbase.com/v2",
            "endpoint": "/prices",
            "symbol_mapping": {
                "BTC": "BTC-USD",
                "ETH": "ETH-USD",
                "BNB": "BNB-USD",
                "ADA": "ADA-USD",
                "SOL": "SOL-USD",
                "DOT": "DOT-USD",
                "AVAX": "AVAX-USD",
                "MATIC": "MATIC-USD",
                "LINK": "LINK-USD",
                "UNI": "UNI-USD",
                "ATOM": "ATOM-USD",
                "LTC": "LTC-USD",
                "XRP": "XRP-USD",
                "DOGE": "DOGE-USD",
                "SHIB": "SHIB-USD",
                "TRX": "TRXUSDT",
                "ALGO": "ALGO-USD",
                "VET": "VET-USD",
                "FIL": "FIL-USD",
                "ICP": "ICP-USD"
            }
        }
    }
    
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
    
    # No hardcoded fallback prices - always try to get live prices from API
    # This ensures users always get current market prices
    
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
        self.min_request_interval = 1.0  # Reduced to 1 second between requests for better responsiveness
        self.request_count = 0
        self.rate_limit_reset = time.time()
        self.consecutive_failures = 0
        self.max_consecutive_failures = 5  # Increased tolerance for temporary API issues
    
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
        """Get fresh price for trading (bypasses cache) with backup API support"""
        # Clear cache for this coin to force fresh price
        self.clear_cache(coin_symbol.upper())
        
        # Get fresh price from primary API (CoinGecko) with backup fallback
        price_response = await self.get_price(coin_symbol)
        if not price_response:
            logger.error(f"Failed to get fresh price for {coin_symbol} from all APIs - trading not possible")
            return None
        
        # Log which API was used
        if hasattr(price_response, 'source_api'):
            logger.info(f"Trading price for {coin_symbol} from {price_response.source_api}")
        else:
            logger.info(f"Trading price for {coin_symbol} from primary API")
        
        return price_response
    
    def _get_fallback_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """No fallback prices - always return None to force API usage"""
        logger.warning(f"No fallback price available for {coin_symbol} - API must be working for trading")
        return None
    
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
                    logger.warning("Rate limited by API, will try backup APIs")
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
    
    async def _try_backup_api(self, coin_symbol: str, api_name: str) -> Optional[PriceResponse]:
        """Try to get price from backup API"""
        try:
            api_config = self.BACKUP_APIS.get(api_name)
            if not api_config:
                return None
            
            symbol_mapping = api_config.get("symbol_mapping", {})
            mapped_symbol = symbol_mapping.get(coin_symbol.upper())
            if not mapped_symbol:
                return None
            
            url = f"{api_config['base_url']}{api_config['endpoint']}"
            
            if api_name == "binance":
                # Binance API format
                params = {"symbol": mapped_symbol}
            elif api_name == "coinbase":
                # Coinbase API format
                params = {"base": mapped_symbol.split('-')[0], "currency": "USD"}
            else:
                return None
            
            logger.info(f"Trying backup API {api_name} for {coin_symbol}")
            response = await self.client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract price based on API response format
                if api_name == "binance":
                    price_usd = Decimal(str(data.get("price", 0)))
                elif api_name == "coinbase":
                    price_data = data.get("data", {})
                    price_usd = Decimal(str(price_data.get("amount", 0)))
                else:
                    return None
                
                if price_usd > 0:
                    logger.info(f"Successfully got price from {api_name}: {coin_symbol} = ${price_usd}")
                    price_response = PriceResponse(
                        coin_symbol=coin_symbol.upper(),
                        price_usd=price_usd,
                        price_change_24h=Decimal("0"),  # Backup APIs may not provide 24h change
                        price_change_percentage_24h=Decimal("0"),
                        timestamp=datetime.utcnow()
                    )
                    # Add source tracking
                    price_response.source_api = api_name
                    return price_response
            
        except Exception as e:
            logger.error(f"Error with backup API {api_name}: {e}")
        
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
            
            url = f"{self.COINGECKO_BASE_URL}/simple/price?ids={coin_id}&vs_currencies=usd&include_24hr_change=true"
            
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
                logger.warning(f"CoinGecko API failed for {coin_symbol}, trying backup APIs...")
                
                # Try backup APIs in order of preference
                backup_apis = ["binance", "coinbase"]
                for backup_api in backup_apis:
                    backup_price = await self._try_backup_api(coin_symbol, backup_api)
                    if backup_price:
                        self._cache_price(coin_symbol, backup_price)
                        logger.info(f"Successfully got price from backup API {backup_api}: {coin_symbol} = ${backup_price.price_usd}")
                        return backup_price
                
                logger.error(f"All APIs failed for {coin_symbol}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching price for {coin_symbol}: {e}")
            return None
    
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
                    
                    url = f"{self.COINGECKO_BASE_URL}/simple/price"
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
                        logger.warning("Rate limited by API - no fallback prices available")
                    else:
                        logger.error(f"HTTP error fetching multiple prices: {e}")
                    
                    # No fallback prices - log failed symbols
                    for symbol in symbols_to_fetch:
                        if symbol.upper() not in results:
                            logger.warning(f"Failed to fetch price for {symbol} - no fallback available")
                
                except Exception as e:
                    logger.error(f"Error fetching multiple prices: {e}")
                    # No fallback prices - log failed symbols
                    for symbol in symbols_to_fetch:
                        if symbol.upper() not in results:
                            logger.warning(f"Failed to fetch price for {symbol} - no fallback available")
            else:
                # No valid coin IDs found - log error
                logger.error("No valid coin IDs found for symbols")
            
            logger.info(f"Successfully fetched prices for {len(results)} symbols")
            return results
            
        except Exception as e:
            logger.error(f"Error in get_multiple_prices: {e}")
            # No fallback prices available - return empty results
            logger.warning("Returning empty results due to API failure - no fallback prices")
            return {}
    
    async def get_supported_coins(self) -> List[str]:
        """Get list of supported cryptocurrency symbols"""
        return list(self.COIN_ID_MAP.keys())
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def get_api_status(self) -> dict:
        """Get status of all API providers"""
        status = {
            "primary_api": "CoinGecko",
            "backup_apis": list(self.BACKUP_APIS.keys()),
            "cache_duration_seconds": self.cache_duration.total_seconds(),
            "rate_limit_requests_per_minute": 8,
            "consecutive_failures": self.consecutive_failures,
            "cache_size": len(self.cache)
        }
        
        # Test primary API
        try:
            test_price = await self.get_price("BTC")
            status["primary_api_status"] = "working" if test_price else "failed"
        except Exception as e:
            status["primary_api_status"] = f"error: {str(e)}"
        
        return status

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