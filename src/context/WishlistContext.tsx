'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface WishlistItem {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    image: string;
    description?: string;
    weight?: string;
    tag?: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // 1. Auth Listener — track login state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                // Guest: reset to empty in-memory (no localStorage)
                setWishlistItems([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Firestore Sync — subscribe when logged in
    useEffect(() => {
        if (!userId) return;

        const wishlistRef = doc(db, 'users', userId, 'wishlist', 'main');
        const unsub = onSnapshot(wishlistRef, (snapshot) => {
            if (snapshot.exists()) {
                setWishlistItems(snapshot.data().items || []);
            } else {
                setWishlistItems([]);
            }
        });

        return () => unsub();
    }, [userId]);

    // 3. Save to Firestore helper
    const saveToFirestore = useCallback(async (newItems: WishlistItem[], uid: string) => {
        try {
            await setDoc(
                doc(db, 'users', uid, 'wishlist', 'main'),
                { items: newItems },
                { merge: true }
            );
        } catch (e) {
            console.error('Wishlist Sync Error', e);
        }
    }, []);

    const addToWishlist = useCallback((product: any) => {
        setWishlistItems((prev) => {
            // Prevent duplicates
            if (prev.find((item) => item.id === product.id)) return prev;

            const newItem: WishlistItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                image: product.image,
                description: product.description,
                weight: product.weight,
                tag: product.tag,
            };

            const newItems = [...prev, newItem];
            if (userId) saveToFirestore(newItems, userId);
            return newItems;
        });
    }, [userId, saveToFirestore]);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlistItems((prev) => {
            const newItems = prev.filter((item) => item.id !== productId);
            if (userId) saveToFirestore(newItems, userId);
            return newItems;
        });
    }, [userId, saveToFirestore]);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.some((item) => item.id === productId);
    }, [wishlistItems]);

    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            wishlistCount,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
