'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Supported currencies
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

interface CurrencyInfo {
    symbol: string;
    name: string;
    rate: number; // Conversion rate from INR
}

// Currency data with approximate conversion rates (INR as base)
export const currencies: Record<CurrencyCode, CurrencyInfo> = {
    INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 },
    USD: { symbol: '$', name: 'US Dollar', rate: 0.012 },
    EUR: { symbol: '€', name: 'Euro', rate: 0.011 },
    GBP: { symbol: '£', name: 'British Pound', rate: 0.0095 },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 0.044 },
};

// Country code to currency mapping
const countryToCurrency: Record<string, CurrencyCode> = {
    'IN': 'INR',
    'US': 'USD',
    'GB': 'GBP',
    'AE': 'AED',
    'SA': 'AED',
    'QA': 'AED',
    'KW': 'AED',
    'BH': 'AED',
    'OM': 'AED',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'BE': 'EUR',
    'AT': 'EUR',
    'PT': 'EUR',
    'IE': 'EUR',
    'FI': 'EUR',
    'GR': 'EUR',
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    currencyInfo: CurrencyInfo;
    formatPrice: (priceInINR: number) => string;
    convertPrice: (priceInINR: number) => number;
    availableCurrencies: CurrencyCode[];
    isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'htk-currency';

interface CurrencyProviderProps {
    children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
    const [isDetecting, setIsDetecting] = useState(true);

    // Detect user's region and set currency
    useEffect(() => {
        const detectCurrency = async () => {
            // Check localStorage first
            const storedCurrency = localStorage.getItem(STORAGE_KEY);
            if (storedCurrency && storedCurrency in currencies) {
                setCurrencyState(storedCurrency as CurrencyCode);
                setIsDetecting(false);
                return;
            }

            // Try to detect from IP (with fallback)
            try {
                const response = await fetch('https://ipapi.co/json/', {
                    signal: AbortSignal.timeout(3000), // 3 second timeout
                });
                const data = await response.json();

                if (data.country_code && countryToCurrency[data.country_code]) {
                    const detectedCurrency = countryToCurrency[data.country_code];
                    setCurrencyState(detectedCurrency);
                    localStorage.setItem(STORAGE_KEY, detectedCurrency);
                }
            } catch {
                // Fallback to INR if detection fails
                console.log('Currency detection failed, defaulting to INR');
            }

            setIsDetecting(false);
        };

        detectCurrency();
    }, []);

    // Update currency and persist
    const setCurrency = useCallback((newCurrency: CurrencyCode) => {
        setCurrencyState(newCurrency);
        localStorage.setItem(STORAGE_KEY, newCurrency);
    }, []);

    // Convert price from INR to selected currency
    const convertPrice = useCallback((priceInINR: number): number => {
        const rate = currencies[currency].rate;
        return Math.round(priceInINR * rate * 100) / 100;
    }, [currency]);

    // Format price with currency symbol
    const formatPrice = useCallback((priceInINR: number): string => {
        const converted = convertPrice(priceInINR);
        const { symbol } = currencies[currency];

        // Format based on currency
        if (currency === 'INR') {
            return `${symbol}${converted.toLocaleString('en-IN')}`;
        }
        return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }, [currency, convertPrice]);

    const value: CurrencyContextType = {
        currency,
        setCurrency,
        currencyInfo: currencies[currency],
        formatPrice,
        convertPrice,
        availableCurrencies: Object.keys(currencies) as CurrencyCode[],
        isDetecting,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

/**
 * Hook to access currency context.
 */
export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
