'use client';

import React, { useState } from 'react';
import { useLanguage, Language } from '@/context/LanguageContext';

/**
 * Language switcher dropdown component.
 * Displays current language and allows selection of available languages.
 */
export default function LanguageSwitcher() {
    const { language, setLanguage, languageNames, availableLanguages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity border border-[var(--color-background)] border-opacity-20 rounded-lg"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label="Select language"
            >
                {/* Globe Icon */}
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                </svg>
                <span>{languageNames[language]}</span>
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
                        aria-label="Available languages"
                        className="absolute bottom-full left-0 mb-2 z-50 bg-[var(--color-primary)] border border-[var(--color-background)] border-opacity-20 rounded-lg shadow-lg overflow-hidden min-w-[120px]"
                    >
                        {availableLanguages.map((lang) => (
                            <li key={lang}>
                                <button
                                    role="option"
                                    aria-selected={lang === language}
                                    onClick={() => handleSelect(lang)}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--color-background)] hover:bg-opacity-10 ${lang === language
                                            ? 'bg-[var(--color-background)] bg-opacity-20 font-medium'
                                            : ''
                                        }`}
                                >
                                    {languageNames[lang]}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
