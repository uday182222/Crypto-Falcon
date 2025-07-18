import React, { useState, useEffect } from 'react';
import { getSupportedCurrencies, updatePreferredCurrency } from '../../services/api';

const CurrencySelector = ({ currentCurrency, onCurrencyChange }) => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await getSupportedCurrencies();
                setCurrencies(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load currencies');
                setLoading(false);
            }
        };
        fetchCurrencies();
    }, []);

    const handleCurrencyChange = async (event) => {
        const newCurrency = event.target.value;
        try {
            await updatePreferredCurrency(newCurrency);
            onCurrencyChange(newCurrency);
        } catch (err) {
            setError('Failed to update currency preference');
        }
    };

    if (loading) {
        return <div className="animate-pulse">Loading currencies...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                Preferred Currency
            </label>
            <select
                id="currency"
                value={currentCurrency}
                onChange={handleCurrencyChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                {Object.entries(currencies).map(([code, name]) => (
                    <option key={code} value={code}>
                        {code} - {name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelector; 