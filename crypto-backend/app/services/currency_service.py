from decimal import Decimal
import requests
from fastapi import HTTPException
from functools import lru_cache
from datetime import datetime, timedelta

class CurrencyService:
    def __init__(self):
        self.base_url = "https://api.exchangerate-api.com/v4/latest/INR"
        self._rates = {}
        self._last_update = None
        self.supported_currencies = {
            'INR': 'Indian Rupee',
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'JPY': 'Japanese Yen',
            'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'SGD': 'Singapore Dollar'
        }

    def _fetch_rates(self):
        """Fetch latest exchange rates from the API"""
        try:
            response = requests.get(self.base_url)
            response.raise_for_status()
            data = response.json()
            self._rates = data['rates']
            self._last_update = datetime.now()
            return self._rates
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch exchange rates: {str(e)}")

    def get_rates(self):
        """Get current exchange rates, fetching new ones if needed"""
        if not self._rates or not self._last_update or \
           (datetime.now() - self._last_update) > timedelta(hours=1):
            return self._fetch_rates()
        return self._rates

    def get_supported_currencies(self):
        """Get list of supported currencies"""
        return self.supported_currencies

    def convert(self, amount: Decimal, from_currency: str = "INR", to_currency: str = "INR") -> Decimal:
        """Convert amount from one currency to another"""
        if from_currency == to_currency:
            return amount

        rates = self.get_rates()
        
        if from_currency not in rates or to_currency not in rates:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported currency. Must be one of: {', '.join(rates.keys())}"
            )

        # Convert to INR first (base currency)
        amount_in_inr = float(amount) / rates[from_currency]
        
        # Then convert to target currency
        final_amount = amount_in_inr * rates[to_currency]
        
        return Decimal(str(round(final_amount, 2)))

# Create a singleton instance
currency_service = CurrencyService() 