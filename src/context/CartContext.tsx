'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

// Simple debounce utility for internal use
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
import { Coupon } from '@/types/commerce';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    coupon: Coupon | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cartOpen, setCartOpen] = useState(false);

    // 1. Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (localCart.length > 0) {
                    // Simple merge logic: clear local for now
                    localStorage.removeItem('cart');
                }
            } else {
                setUserId(null);
                const savedCart = localStorage.getItem('cart');
                const savedCoupon = localStorage.getItem('coupon');
                if (savedCart) setItems(JSON.parse(savedCart));
                if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Firestore Sync (If Logged In)
    useEffect(() => {
        if (!userId) return;

        const cartRef = doc(db, 'users', userId, 'cart', 'main');
        const unsub = onSnapshot(cartRef, (doc) => {
            if (doc.exists()) {
                setItems(doc.data().items || []);
            }
        });

        return () => unsub();
    }, [userId]);

    // 3. Local Persistence (If Guest)
    useEffect(() => {
        if (!userId) {
            localStorage.setItem('cart', JSON.stringify(items));
            if (coupon) localStorage.setItem('coupon', JSON.stringify(coupon));
            else localStorage.removeItem('coupon');
        }
    }, [items, coupon, userId]);

    // 4. Save to Firestore Helper
    const saveToFirestore = useCallback(
        debounce(async (newItems: CartItem[], uid: string) => {
            try {
                await setDoc(doc(db, 'users', uid, 'cart', 'main'), { items: newItems }, { merge: true });
            } catch (e) {
                console.error("Cart Sync Error", e);
            }
        }, 500),
        []
    );

    const addToCart = (product: any) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            let newItems;
            if (existing) {
                newItems = prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                newItems = [...prev, { ...product, quantity: 1 }];
            }

            if (userId) saveToFirestore(newItems, userId);
            return newItems;
        });
        setCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setItems((prev) => {
            const newItems = prev.filter((item) => item.id !== productId);
            if (userId) saveToFirestore(newItems, userId);
            return newItems;
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setItems(prev => {
            const newItems = prev.map(item => {
                if (item.id === productId) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            });
            if (userId) saveToFirestore(newItems, userId);
            return newItems;
        });
    };

    const clearCart = () => {
        setItems([]);
        setCoupon(null);
        localStorage.removeItem('cart');
        localStorage.removeItem('coupon');
        if (userId) saveToFirestore([], userId);
    };

    // COUPON LOGIC
    const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
        try {
            const couponRef = doc(db, 'coupons', code.toUpperCase());
            const couponSnap = await getDoc(couponRef);

            if (!couponSnap.exists()) {
                return { success: false, message: "Invalid Coupon Code" };
            }

            const couponData = couponSnap.data() as Coupon;

            if (!couponData.isActive) return { success: false, message: "Coupon Expired" };

            setCoupon(couponData);
            return { success: true, message: `Code ${code} Applied!` };
        } catch (err) {
            console.error(err);
            return { success: false, message: "Error verifying code" };
        }
    };

    const removeCoupon = () => setCoupon(null);

    // TOTAL CALCULATION
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    let discountAmount = 0;
    if (coupon) {
        if (coupon.type === 'percentage') {
            discountAmount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
        } else {
            discountAmount = coupon.value;
        }
    }

    const cartTotal = Math.max(0, subtotal - discountAmount);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart,
            cartTotal, cartCount,
            coupon, applyCoupon, removeCoupon,
            cartOpen, setCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
