'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, languageNames, TranslationKeys } from '@/lib/translations';
import type { Language } from '@/lib/translations';

// Re-export for convenience
export type { Language };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
    languageNames: typeof languageNames;
    availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'htk-language';

/**
 * Detects user's preferred language from browser settings.
 */
function detectUserLanguage(): Language {
    if (typeof window === 'undefined') return 'en';

    const storedLang = localStorage.getItem(STORAGE_KEY);
    if (storedLang && (storedLang === 'en' || storedLang === 'hi' || storedLang === 'ta')) {
        return storedLang as Language;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'hi') return 'hi';
    if (browserLang === 'ta') return 'ta';

    return 'en';
}

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize language on mount
    useEffect(() => {
        const detectedLang = detectUserLanguage();
        setLanguageState(detectedLang);
        setIsInitialized(true);
    }, []);

    // Update language and persist to localStorage
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);

        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', lang);
    }, []);

    // Get current translations
    const t = translations[language];

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        languageNames,
        availableLanguages: ['en', 'hi', 'ta'],
    };

    // Prevent hydration mismatch by not rendering until initialized
    if (!isInitialized) {
        return (
            <LanguageContext.Provider value={{ ...value, language: 'en', t: translations.en }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access language context.
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

/**
 * Hook to get translations directly.
 */
export function useTranslation() {
    const { t, language } = useLanguage();
    return { t, language };
}
