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
    
    # Backup APIs (free tiers) with comprehensive symbol mappings
    BACKUP_APIS = {
        "mobula": {
            "base_url": "https://api.mobula.io/api/1",
            "endpoint": "/market/data",
            "symbol_mapping": {
                # Major cryptocurrencies
                "BTC": "BTC", "ETH": "ETH", "BNB": "BNB", "XRP": "XRP",
                "ADA": "ADA", "SOL": "SOL", "DOGE": "DOGE", "TRX": "TRX",
                "AVAX": "AVAX", "DOT": "DOT", "MATIC": "MATIC", "LINK": "LINK",
                "UNI": "UNI", "ATOM": "ATOM", "LTC": "LTC", "BCH": "BCH",
                "ETC": "ETC", "XLM": "XLM", "XMR": "XMR", "DASH": "DASH",
                "ZEC": "ZEC", "EOS": "EOS", "XTZ": "XTZ", "AAVE": "AAVE",
                
                # DeFi tokens
                "COMP": "COMP", "MKR": "MKR", "SNX": "SNX", "YFI": "YFI",
                "SUSHI": "SUSHI", "CRV": "CRV", "1INCH": "1INCH", "BAL": "BAL",
                "LRC": "LRC", "ZRX": "ZRX", "NEAR": "NEAR", "FTM": "FTM",
                "ALGO": "ALGO", "VET": "VET", "ICP": "ICP", "FIL": "FIL",
                
                # Gaming & NFT
                "AXS": "AXS", "SAND": "SAND", "MANA": "MANA", "ENJ": "ENJ",
                "GALA": "GALA", "ILV": "ILV", "CHZ": "CHZ", "FLOW": "FLOW",
                "IMX": "IMX", "APE": "APE",
                
                # Meme coins
                "SHIB": "SHIB", "PEPE": "PEPE", "FLOKI": "FLOKI", "BONK": "BONK",
                "WIF": "WIF", "BABYDOGE": "BABYDOGE",
                
                # AI & Big Data
                "FET": "FET", "AGIX": "AGIX", "OCEAN": "OCEAN", "GRT": "GRT",
                "RLC": "RLC", "NUM": "NUM",
                
                # Storage & Infrastructure
                "AR": "AR", "SC": "SC", "STORJ": "STORJ", "BTT": "BTT", "HOT": "HOT",
                
                # Privacy coins
                "DCR": "DCR", "ZEN": "ZEN",
                
                # Stablecoins
                "USDT": "USDT", "USDC": "USDC", "BUSD": "BUSD", "DAI": "DAI",
                "TUSD": "TUSD", "USDP": "USDP", "FRAX": "FRAX", "LUSD": "LUSD",
                
                # Exchange tokens
                "FTT": "FTT", "LEO": "LEO", "CRO": "CRO", "KCS": "KCS",
                "HT": "HT", "OKB": "OKB", "GT": "GT",
                
                # Oracle & Data
                "BAND": "BAND", "TRB": "TRB", "API3": "API3", "UMA": "UMA", "REP": "REP",
                
                # Cross-Chain & Bridges
                "RUNE": "RUNE", "KAVA": "KAVA", "INJ": "INJ", "OSMO": "OSMO", "JUNO": "JUNO",
                
                # Layer 2 Solutions
                "OP": "OP", "ARB": "ARB",
                
                # Emerging & Trending
                "SUI": "SUI", "APT": "APT", "SEI": "SEI", "TIA": "TIA",
                "JTO": "JTO", "PYTH": "PYTH", "WLD": "WLD", "BLUR": "BLUR"
            }
        },
        "binance": {
            "base_url": "https://api.binance.com/api/v3",
            "endpoint": "/ticker/price",
            "symbol_mapping": {
                # Major cryptocurrencies
                "BTC": "BTCUSDT", "ETH": "ETHUSDT", "BNB": "BNBUSDT", "XRP": "XRPUSDT",
                "ADA": "ADAUSDT", "SOL": "SOLUSDT", "DOGE": "DOGEUSDT", "TRX": "TRXUSDT",
                "AVAX": "AVAXUSDT", "DOT": "DOTUSDT", "MATIC": "MATICUSDT", "LINK": "LINKUSDT",
                "UNI": "UNIUSDT", "ATOM": "ATOMUSDT", "LTC": "LTCUSDT", "BCH": "BCHUSDT",
                "ETC": "ETCUSDT", "XLM": "XLMUSDT", "XMR": "XMRUSDT", "DASH": "DASHUSDT",
                "ZEC": "ZECUSDT", "EOS": "EOSUSDT", "XTZ": "XTZUSDT", "AAVE": "AAVEUSDT",
                
                # DeFi tokens
                "COMP": "COMPUSDT", "MKR": "MKRUSDT", "SNX": "SNXUSDT", "YFI": "YFIUSDT",
                "SUSHI": "SUSHIUSDT", "CRV": "CRVUSDT", "1INCH": "1INCHUSDT", "BAL": "BALUSDT",
                "LRC": "LRCUSDT", "ZRX": "ZRXUSDT", "NEAR": "NEARUSDT", "FTM": "FTMUSDT",
                "ALGO": "ALGOUSDT", "VET": "VETUSDT", "ICP": "ICPUSDT", "FIL": "FILUSDT",
                
                # Gaming & NFT
                "AXS": "AXSUSDT", "SAND": "SANDUSDT", "MANA": "MANAUSDT", "ENJ": "ENJUSDT",
                "GALA": "GALAUSDT", "ILV": "ILVUSDT", "CHZ": "CHZUSDT", "FLOW": "FLOWUSDT",
                "IMX": "IMXUSDT", "APE": "APEUSDT",
                
                # Meme coins
                "SHIB": "SHIBUSDT", "PEPE": "PEPEUSDT", "FLOKI": "FLOKIUSDT", "BONK": "BONKUSDT",
                "WIF": "WIFUSDT", "BABYDOGE": "BABYDOGEUSDT",
                
                # AI & Big Data
                "FET": "FETUSDT", "AGIX": "AGIXUSDT", "OCEAN": "OCEANUSDT", "GRT": "GRTUSDT",
                "RLC": "RLCUSDT", "NUM": "NUMUSDT",
                
                # Storage & Infrastructure
                "AR": "ARUSDT", "SC": "SCUSDT", "STORJ": "STORJUSDT", "BTT": "BTTUSDT", "HOT": "HOTUSDT",
                
                # Privacy coins
                "DCR": "DCRUSDT", "ZEN": "ZENUSDT",
                
                # Stablecoins
                "USDT": "USDTUSDT", "USDC": "USDCUSDT", "BUSD": "BUSDUSDT", "DAI": "DAIUSDT",
                "TUSD": "TUSDUSDT", "USDP": "USDPUSDT", "FRAX": "FRAXUSDT", "LUSD": "LUSDUSDT",
                
                # Exchange tokens
                "FTT": "FTTUSDT", "LEO": "LEOUSDT", "CRO": "CROUSDT", "KCS": "KCSUSDT",
                "HT": "HTUSDT", "OKB": "OKBUSDT", "GT": "GTUSDT",
                
                # Oracle & Data
                "BAND": "BANDUSDT", "TRB": "TRBUSDT", "API3": "API3USDT", "UMA": "UMAUSDT", "REP": "REPUSDT",
                
                # Cross-Chain & Bridges
                "RUNE": "RUNEUSDT", "KAVA": "KAVAUSDT", "INJ": "INJUSDT", "OSMO": "OSMOUSDT", "JUNO": "JUNOUSDT",
                
                # Layer 2 Solutions
                "OP": "OPUSDT", "ARB": "ARBUSDT",
                
                # Emerging & Trending
                "SUI": "SUIUSDT", "APT": "APTUSDT", "SEI": "SEIUSDT", "TIA": "TIAUSDT",
                "JTO": "JTOUSDT", "PYTH": "PYTHUSDT", "WLD": "WLDUSDT", "BLUR": "BLURUSDT"
            }
        },
        "coinbase": {
            "base_url": "https://api.coinbase.com/v2",
            "endpoint": "/prices",
            "symbol_mapping": {
                # Major cryptocurrencies
                "BTC": "BTC-USD", "ETH": "ETH-USD", "BNB": "BNB-USD", "XRP": "XRP-USD",
                "ADA": "ADA-USD", "SOL": "SOL-USD", "DOGE": "DOGE-USD", "TRX": "TRX-USD",
                "AVAX": "AVAX-USD", "DOT": "DOT-USD", "MATIC": "MATIC-USD", "LINK": "LINK-USD",
                "UNI": "UNI-USD", "ATOM": "ATOM-USD", "LTC": "LTC-USD", "BCH": "BCH-USD",
                "ETC": "ETC-USD", "XLM": "XLM-USD", "XMR": "XMR-USD", "DASH": "DASH-USD",
                "ZEC": "ZEC-USD", "EOS": "EOS-USD", "XTZ": "XTZ-USD", "AAVE": "AAVE-USD",
                
                # DeFi tokens
                "COMP": "COMP-USD", "MKR": "MKR-USD", "SNX": "SNX-USD", "YFI": "YFI-USD",
                "SUSHI": "SUSHI-USD", "CRV": "CRV-USD", "1INCH": "1INCH-USD", "BAL": "BAL-USD",
                "LRC": "LRC-USD", "ZRX": "ZRX-USD", "NEAR": "NEAR-USD", "FTM": "FTM-USD",
                "ALGO": "ALGO-USD", "VET": "VET-USD", "ICP": "ICP-USD", "FIL": "FIL-USD",
                
                # Gaming & NFT
                "AXS": "AXS-USD", "SAND": "SAND-USD", "MANA": "MANA-USD", "ENJ": "ENJ-USD",
                "GALA": "GALA-USD", "ILV": "ILV-USD", "CHZ": "CHZ-USD", "FLOW": "FLOW-USD",
                "IMX": "IMX-USD", "APE": "APE-USD",
                
                # Meme coins
                "SHIB": "SHIB-USD", "PEPE": "PEPE-USD", "FLOKI": "FLOKI-USD", "BONK": "BONK-USD",
                "WIF": "WIF-USD", "BABYDOGE": "BABYDOGE-USD",
                
                # AI & Big Data
                "FET": "FET-USD", "AGIX": "AGIX-USD", "OCEAN": "OCEAN-USD", "GRT": "GRT-USD",
                "RLC": "RLC-USD", "NUM": "NUM-USD",
                
                # Storage & Infrastructure
                "AR": "AR-USD", "SC": "SC-USD", "STORJ": "STORJ-USD", "BTT": "BTT-USD", "HOT": "HOT-USD",
                
                # Privacy coins
                "DCR": "DCR-USD", "ZEN": "ZEN-USD",
                
                # Stablecoins
                "USDT": "USDT-USD", "USDC": "USDC-USD", "BUSD": "BUSD-USD", "DAI": "DAI-USD",
                "TUSD": "TUSD-USD", "USDP": "USDP-USD", "FRAX": "FRAX-USD", "LUSD": "LUSD-USD",
                
                # Exchange tokens
                "FTT": "FTT-USD", "LEO": "LEO-USD", "CRO": "CRO-USD", "KCS": "KCS-USD",
                "HT": "HT-USD", "OKB": "OKB-USD", "GT": "GT-USD",
                
                # Oracle & Data
                "BAND": "BAND-USD", "TRB": "TRB-USD", "API3": "API3-USD", "UMA": "UMA-USD", "REP": "REP-USD",
                
                # Cross-Chain & Bridges
                "RUNE": "RUNE-USD", "KAVA": "KAVA-USD", "INJ": "INJ-USD", "OSMO": "OSMO-USD", "JUNO": "JUNO-USD",
                
                # Layer 2 Solutions
                "OP": "OP-USD", "ARB": "ARB-USD",
                
                # Emerging & Trending
                "SUI": "SUI-USD", "APT": "APT-USD", "SEI": "SEI-USD", "TIA": "TIA-USD",
                "JTO": "JTO-USD", "PYTH": "PYTH-USD", "WLD": "WLD-USD", "BLUR": "BLUR-USD"
            }
        }
    }
    
    # Comprehensive mapping of cryptocurrency symbols to CoinGecko IDs
    COIN_ID_MAP = {
        # Top Tier - Major Cryptocurrencies
        "BTC": "bitcoin",
        "ETH": "ethereum", 
        "BNB": "binancecoin",
        "XRP": "ripple",
        "ADA": "cardano",
        "SOL": "solana",
        "DOGE": "dogecoin",
        "TRX": "tron",
        "AVAX": "avalanche-2",
        "DOT": "polkadot",
        
        # DeFi & Smart Contract Platforms
        "MATIC": "matic-network",
        "LINK": "chainlink",
        "UNI": "uniswap",
        "ATOM": "cosmos",
        "NEAR": "near",
        "FTM": "fantom",
        "ALGO": "algorand",
        "VET": "vechain",
        "ICP": "internet-computer",
        "FIL": "filecoin",
        
        # Layer 1 Blockchains
        "LTC": "litecoin",
        "BCH": "bitcoin-cash",
        "ETC": "ethereum-classic",
        "XLM": "stellar",
        "XMR": "monero",
        "DASH": "dash",
        "ZEC": "zcash",
        "EOS": "eos",
        "XTZ": "tezos",
        "AAVE": "aave",
        
        # DeFi Tokens
        "COMP": "compound-governance-token",
        "MKR": "maker",
        "SNX": "havven",
        "YFI": "yearn-finance",
        "SUSHI": "sushi",
        "CRV": "curve-dao-token",
        "1INCH": "1inch",
        "BAL": "balancer",
        "LRC": "loopring",
        "ZRX": "0x",
        
        # Gaming & NFT
        "AXS": "axie-infinity",
        "SAND": "the-sandbox",
        "MANA": "decentraland",
        "ENJ": "enjincoin",
        "GALA": "gala",
        "ILV": "illuvium",
        "CHZ": "chiliz",
        "FLOW": "flow",
        "IMX": "immutable-x",
        "APE": "apecoin",
        
        # Meme Coins
        "SHIB": "shiba-inu",
        "PEPE": "pepe",
        "FLOKI": "floki",
        "BONK": "bonk",
        "WIF": "dogwifcoin",
        "BABYDOGE": "baby-doge-coin",
        "DOGE": "dogecoin",
        
        # AI & Big Data
        "FET": "fetch-ai",
        "AGIX": "singularitynet",
        "OCEAN": "ocean-protocol",
        "GRT": "the-graph",
        "RLC": "iexec-rlc",
        "NUM": "numbers-protocol",
        
        # Storage & Infrastructure
        "AR": "arweave",
        "SC": "siacoin",
        "STORJ": "storj",
        "BTT": "bittorrent",
        "HOT": "holo",
        
        # Privacy Coins
        "XMR": "monero",
        "ZEC": "zcash",
        "DASH": "dash",
        "DCR": "decred",
        "ZEN": "horizen",
        
        # Stablecoins
        "USDT": "tether",
        "USDC": "usd-coin",
        "BUSD": "binance-usd",
        "DAI": "dai",
        "TUSD": "true-usd",
        "USDP": "paxos-standard",
        "FRAX": "frax",
        "LUSD": "liquity-usd",
        
        # Exchange Tokens
        "FTT": "ftx-token",
        "LEO": "leo-token",
        "CRO": "crypto-com-chain",
        "KCS": "kucoin-shares",
        "HT": "huobi-token",
        "OKB": "okb",
        "GT": "gatechain-token",
        
        # Oracle & Data
        "BAND": "band-protocol",
        "TRB": "tellor",
        "API3": "api3",
        "UMA": "uma",
        "REP": "augur",
        
        # Cross-Chain & Bridges
        "RUNE": "thorchain",
        "KAVA": "kava",
        "INJ": "injective-protocol",
        "OSMO": "osmosis",
        "JUNO": "juno-network",
        
        # Metaverse & Virtual Worlds
        "SAND": "the-sandbox",
        "MANA": "decentraland",
        "AXS": "axie-infinity",
        "ENJ": "enjincoin",
        "GALA": "gala",
        "ILV": "illuvium",
        "CHZ": "chiliz",
        "FLOW": "flow",
        "IMX": "immutable-x",
        "APE": "apecoin",
        
        # Layer 2 Solutions
        "OP": "optimism",
        "ARB": "arbitrum",
        "MATIC": "matic-network",
        "LRC": "loopring",
        "IMX": "immutable-x",
        
        # Emerging & Trending
        "SUI": "sui",
        "APT": "aptos",
        "SEI": "sei-network",
        "TIA": "celestia",
        "INJ": "injective-protocol",
        "JTO": "jito-governance-token",
        "PYTH": "pyth-network",
        "WLD": "worldcoin-wld",
        "BLUR": "blur",
        "ARB": "arbitrum"
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
        # Multi-tier caching system
        self.cache = {}  # Primary cache for successful API responses
        self.fallback_cache = {}  # Fallback cache for when APIs are rate-limited
        self.dynamic_fallback = {}  # Dynamic fallback using recent prices (24 hours)
        self.cache_duration = timedelta(minutes=5)  # Cache successful responses for 5 minutes
        self.fallback_cache_duration = timedelta(minutes=15)  # Keep fallback data for 15 minutes
        self.dynamic_fallback_duration = timedelta(hours=24)  # Keep recent prices for 24 hours as fallback
        self.last_request_time = 0
        self.min_request_interval = 1.0  # 1 second between requests
        self.request_count = 0
        self.api_health_status = {}  # Track API health for smart caching
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
        """Get cached price from primary cache if available and not expired"""
        if coin_symbol in self.cache:
            cached_data = self.cache[coin_symbol]
            if datetime.utcnow() - cached_data.timestamp < self.cache_duration:
                logger.info(f"Returning fresh cached price for {coin_symbol}")
                return cached_data
            else:
                # Move expired cache to fallback cache
                self._move_to_fallback_cache(coin_symbol, cached_data)
                del self.cache[coin_symbol]
        return None
    
    def _get_fallback_cached_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get cached price from fallback cache if available and not expired"""
        if coin_symbol in self.fallback_cache:
            cached_data = self.fallback_cache[coin_symbol]
            if datetime.utcnow() - cached_data.timestamp < self.fallback_cache_duration:
                logger.info(f"Returning fallback cached price for {coin_symbol}")
                return cached_data
            else:
                # Remove expired fallback cache entry
                del self.fallback_cache[coin_symbol]
        return None
    
    def _move_to_fallback_cache(self, coin_symbol: str, price_data: PriceResponse):
        """Move price data to fallback cache"""
        self.fallback_cache[coin_symbol] = price_data
        logger.info(f"Moved {coin_symbol} to fallback cache")
    
    def _update_dynamic_fallback(self, coin_symbol: str, price_data: PriceResponse):
        """Update dynamic fallback with recent price data"""
        self.dynamic_fallback[coin_symbol] = price_data
        logger.info(f"Updated dynamic fallback for {coin_symbol} at ${price_data.price_usd}")
    
    def _get_dynamic_fallback_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get price from dynamic fallback if available and not expired"""
        if coin_symbol in self.dynamic_fallback:
            cached_data = self.dynamic_fallback[coin_symbol]
            if datetime.utcnow() - cached_data.timestamp < self.dynamic_fallback_duration:
                logger.info(f"Using dynamic fallback price for {coin_symbol}: ${cached_data.price_usd}")
                return cached_data
            else:
                # Remove expired dynamic fallback entry
                del self.dynamic_fallback[coin_symbol]
        return None
    
    def _cache_price(self, coin_symbol: str, price: PriceResponse):
        """Cache a price response and update dynamic fallback"""
        self.cache[coin_symbol] = price
        # Also update dynamic fallback with fresh price data
        self._update_dynamic_fallback(coin_symbol, price)
    
    def clear_cache(self, coin_symbol: str = None):
        """Clear cache for specific coin or all coins"""
        if coin_symbol:
            if coin_symbol in self.cache:
                del self.cache[coin_symbol]
            if coin_symbol in self.fallback_cache:
                del self.fallback_cache[coin_symbol]
            if coin_symbol in self.dynamic_fallback:
                del self.dynamic_fallback[coin_symbol]
        else:
            self.cache.clear()
            self.fallback_cache.clear()
            self.dynamic_fallback.clear()
            logger.info("Cleared all caches")
    
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
        """Legacy method - now uses dynamic fallback instead of hardcoded prices"""
        # This method is kept for compatibility but now redirects to dynamic fallback
        return self._get_dynamic_fallback_price(coin_symbol)
    
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
        """Try to get price from backup API with improved error handling"""
        try:
            api_config = self.BACKUP_APIS.get(api_name)
            if not api_config:
                logger.warning(f"Backup API {api_name} not configured")
                return None
            
            symbol_mapping = api_config.get("symbol_mapping", {})
            mapped_symbol = symbol_mapping.get(coin_symbol.upper())
            if not mapped_symbol:
                logger.warning(f"Symbol {coin_symbol} not supported by {api_name}")
                return None
            
            url = f"{api_config['base_url']}{api_config['endpoint']}"
            
            if api_name == "mobula":
                # Mobula API format - high quota, reliable
                url = f"{api_config['base_url']}{api_config['endpoint']}"
                params = {"symbol": mapped_symbol}
            elif api_name == "binance":
                # Binance API format - direct exchange spot price
                url = f"{api_config['base_url']}/ticker/24hr"
                params = {"symbol": f"{mapped_symbol}USDT"}
            else:
                logger.warning(f"Unknown backup API: {api_name}")
                return None
            
            logger.info(f"Trying backup API {api_name} for {coin_symbol} at {url}")
            response = await self.client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract price based on API response format
                if api_name == "mobula":
                    # Mobula API response format
                    price_usd = Decimal(str(data.get("price", 0)))
                    change_24h = Decimal(str(data.get("priceChange24h", 0)))
                    change_24h_percent = Decimal(str(data.get("priceChange24hPercent", 0)))
                elif api_name == "binance":
                    # Binance API response format
                    price_usd = Decimal(str(data.get("lastPrice", 0)))
                    change_24h = Decimal(str(data.get("priceChange", 0)))
                    change_24h_percent = Decimal(str(data.get("priceChangePercent", 0)))
                else:
                    return None
                
                if price_usd > 0:
                    logger.info(f"Successfully got price from {api_name}: {coin_symbol} = ${price_usd}")
                    price_response = PriceResponse(
                        coin_symbol=coin_symbol.upper(),
                        price_usd=price_usd,
                        price_change_24h=change_24h,
                        price_change_percentage_24h=change_24h_percent,
                        timestamp=datetime.utcnow()
                    )
                    # Add source tracking
                    price_response.source_api = api_name
                    return price_response
                else:
                    logger.warning(f"Invalid price from {api_name}: {price_usd}")
            else:
                logger.warning(f"Backup API {api_name} returned status {response.status_code}: {response.text[:100]}")
            
        except Exception as e:
            logger.error(f"Error with backup API {api_name}: {e}")
        
        return None
    
    async def get_price(self, coin_symbol: str) -> Optional[PriceResponse]:
        """Get current price for a single cryptocurrency with intelligent caching"""
        try:
            # Check primary cache first
            cached_price = self._get_cached_price(coin_symbol)
            if cached_price:
                return cached_price
            
            # If too many consecutive failures, try fallback cache first
            if self.consecutive_failures >= self.max_consecutive_failures:
                logger.warning(f"Too many consecutive failures ({self.consecutive_failures}), checking fallback cache for {coin_symbol}")
                fallback_cached = self._get_fallback_cached_price(coin_symbol)
                if fallback_cached:
                    return fallback_cached
                
                # If no fallback cache, use hardcoded fallback
                fallback_price = self._get_fallback_price(coin_symbol)
                if fallback_price:
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
                
                # Try backup APIs in order of preference (Mobula first as it's more reliable)
                backup_apis = ["mobula", "binance"]
                for backup_api in backup_apis:
                    backup_price = await self._try_backup_api(coin_symbol, backup_api)
                    if backup_price:
                        self._cache_price(coin_symbol, backup_price)
                        logger.info(f"Successfully got price from backup API {backup_api}: {coin_symbol} = ${backup_price.price_usd}")
                        return backup_price
                
                # If all APIs fail, try fallback cache
                fallback_cached = self._get_fallback_cached_price(coin_symbol)
                if fallback_cached:
                    logger.info(f"Using fallback cached price for {coin_symbol}")
                    return fallback_cached
                
                # Try dynamic fallback (recent prices from last 24 hours)
                dynamic_fallback_price = self._get_dynamic_fallback_price(coin_symbol)
                if dynamic_fallback_price:
                    logger.warning(f"Using dynamic fallback price for {coin_symbol}: ${dynamic_fallback_price.price_usd}")
                    return dynamic_fallback_price
                
                logger.error(f"All APIs and fallbacks failed for {coin_symbol}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching price for {coin_symbol}: {e}")
            return None
    
    async def get_multiple_prices(self, coin_symbols: List[str]) -> Dict[str, PriceResponse]:
        """Get current prices for multiple cryptocurrencies with intelligent batching"""
        try:
            results = {}
            uncached_symbols = []
            
            # First, check primary cache for all symbols
            for symbol in coin_symbols:
                cached_price = self._get_cached_price(symbol.upper())
                if cached_price:
                    results[symbol.upper()] = cached_price
                else:
                    # Check fallback cache if primary cache is empty
                    fallback_cached = self._get_fallback_cached_price(symbol.upper())
                    if fallback_cached:
                        results[symbol.upper()] = fallback_cached
                    else:
                        # Check dynamic fallback
                        dynamic_fallback_price = self._get_dynamic_fallback_price(symbol.upper())
                        if dynamic_fallback_price:
                            results[symbol.upper()] = dynamic_fallback_price
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
            "backup_api_order": ["mobula", "binance"],
            "cache_duration_seconds": self.cache_duration.total_seconds(),
            "fallback_cache_duration_seconds": self.fallback_cache_duration.total_seconds(),
            "dynamic_fallback_duration_seconds": self.dynamic_fallback_duration.total_seconds(),
            "rate_limit_requests_per_minute": 8,
            "consecutive_failures": self.consecutive_failures,
            "primary_cache_size": len(self.cache),
            "fallback_cache_size": len(self.fallback_cache),
            "dynamic_fallback_size": len(self.dynamic_fallback),
            "total_cached_coins": len(self.cache) + len(self.fallback_cache) + len(self.dynamic_fallback)
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