import { getCurrencyRates } from '../services/api';

let rates = null;
let lastFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const convertCurrency = async (amount, fromCurrency = 'INR', toCurrency = 'INR') => {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Check if we need to fetch new rates
    if (!rates || !lastFetch || (Date.now() - lastFetch > CACHE_DURATION)) {
        try {
            const response = await getCurrencyRates();
            rates = response.data;
            lastFetch = Date.now();
        } catch (error) {
            console.error('Failed to fetch currency rates:', error);
            return amount; // Return original amount if conversion fails
        }
    }

    // Convert from source currency to INR first (if needed)
    let amountInINR = amount;
    if (fromCurrency !== 'INR') {
        amountInINR = amount / rates[fromCurrency];
    }

    // Convert from INR to target currency
    if (toCurrency === 'INR') {
        return amountInINR;
    }

    return amountInINR * rates[toCurrency];
};

export const useCurrencyFormatter = (amount, preferredCurrency = 'INR') => {
    return async () => {
        const convertedAmount = await convertCurrency(amount, 'INR', preferredCurrency);
        return formatCurrency(convertedAmount, preferredCurrency);
    };
}; 