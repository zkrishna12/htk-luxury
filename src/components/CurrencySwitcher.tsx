'use client';

import React, { useState } from 'react';
import { useCurrency, currencies, CurrencyCode } from '@/context/CurrencyContext';

/**
 * Currency switcher dropdown component.
 * Displays current currency and allows selection of supported currencies.
 */
export default function CurrencySwitcher() {
    const { currency, setCurrency, availableCurrencies, isDetecting } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (code: CurrencyCode) => {
        setCurrency(code);
        setIsOpen(false);
    };

    const currencyInfo = currencies[currency];

    return (
        <div className="relative inline-block">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDetecting}
                className="flex items-center gap-2 px-3 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity border border-[var(--color-background)] border-opacity-20 rounded-lg disabled:opacity-50"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label="Select currency"
            >
                {/* Currency Symbol */}
                <span className="font-medium">{currencyInfo.symbol}</span>
                <span>{currency}</span>
                {/* Chevron */}
                <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Dropdown Menu */}
                    <ul
                        role="listbox"
                        aria-label="Available currencies"
                        className="absolute bottom-full left-0 mb-2 z-50 bg-[var(--color-primary)] border border-[var(--color-background)] border-opacity-20 rounded-lg shadow-lg overflow-hidden min-w-[160px]"
                    >
                        {availableCurrencies.map((code) => {
                            const info = currencies[code];
                            return (
                                <li key={code}>
                                    <button
                                        role="option"
                                        aria-selected={code === currency}
                                        onClick={() => handleSelect(code)}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--color-background)] hover:bg-opacity-10 flex items-center justify-between ${code === currency
                                                ? 'bg-[var(--color-background)] bg-opacity-20 font-medium'
                                                : ''
                                            }`}
                                    >
                                        <span>{info.symbol} {code}</span>
                                        <span className="text-xs opacity-60">{info.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}
