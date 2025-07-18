import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export const CurrencyProvider = ({ children }) => {
    const [preferredCurrency, setPreferredCurrency] = useState(() => {
        return localStorage.getItem('preferredCurrency') || 'INR';
    });

    useEffect(() => {
        localStorage.setItem('preferredCurrency', preferredCurrency);
    }, [preferredCurrency]);

    const value = {
        preferredCurrency,
        setPreferredCurrency
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext; 