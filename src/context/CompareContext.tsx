'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { products as allProducts } from '@/lib/products';

interface Product {
    id: string;
    name: string;
    weight: string;
    price: number;
    mrp: number;
    image: string;
    tag?: string;
    description?: string;
    isActive?: boolean;
    advantages?: string[];
    howToUse?: string[];
}

interface CompareContextType {
    compareItems: Product[];
    addToCompare: (productId: string) => void;
    removeFromCompare: (productId: string) => void;
    isInCompare: (productId: string) => boolean;
    clearCompare: () => void;
    compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [compareIds, setCompareIds] = useState<string[]>([]);

    const compareItems: Product[] = compareIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean) as Product[];

    const addToCompare = (productId: string) => {
        setCompareIds(prev => {
            if (prev.includes(productId)) return prev;
            if (prev.length >= 3) {
                alert('You can compare up to 3 products');
                return prev;
            }
            return [...prev, productId];
        });
    };

    const removeFromCompare = (productId: string) => {
        setCompareIds(prev => prev.filter(id => id !== productId));
    };

    const isInCompare = (productId: string) => compareIds.includes(productId);

    const clearCompare = () => setCompareIds([]);

    const compareCount = compareIds.length;

    return (
        <CompareContext.Provider value={{
            compareItems,
            addToCompare,
            removeFromCompare,
            isInCompare,
            clearCompare,
            compareCount,
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error('useCompare must be used within a CompareProvider');
    return ctx;
}
