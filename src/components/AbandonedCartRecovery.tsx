'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { auth, db } from '@/lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    addDoc,
    updateDoc,
    collection,
    serverTimestamp,
} from 'firebase/firestore';

const COUPON_CODE = 'COMEBACK5';
const INACTIVITY_TIMEOUT_MS = 60_000; // 60 seconds

export default function AbandonedCartRecovery() {
    const { items, cartTotal, setCartOpen } = useCart();

    // Track whether popup has already been shown this session (no localStorage)
    const hasShownRef = useRef(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const abandonedCartDocIdRef = useRef<string | null>(null);
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Ensure COMEBACK5 coupon exists in Firestore
    // ─────────────────────────────────────────────────────────────────────────
    const ensureCoupon = useCallback(async () => {
        try {
            const couponRef = doc(db, 'coupons', COUPON_CODE);
            const snap = await getDoc(couponRef);
            if (!snap.exists()) {
                await setDoc(couponRef, {
                    code: COUPON_CODE,
                    type: 'percentage',
                    value: 5,
                    minOrderValue: 0,
                    usageLimit: 9999,
                    usedCount: 0,
                    isActive: true,
                });
            }
        } catch (err) {
            console.error('[AbandonedCart] Failed to ensure coupon:', err);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Save abandoned cart record to Firestore
    // ─────────────────────────────────────────────────────────────────────────
    const saveAbandonedCart = useCallback(async () => {
        try {
            const userId = auth.currentUser?.uid ?? 'guest';
            const docRef = await addDoc(collection(db, 'abandoned_carts'), {
                userId,
                items,
                total: cartTotal,
                couponCode: COUPON_CODE,
                triggeredAt: serverTimestamp(),
                recovered: false,
            });
            abandonedCartDocIdRef.current = docRef.id;
        } catch (err) {
            console.error('[AbandonedCart] Failed to save abandoned cart:', err);
        }
    }, [items, cartTotal]);

    // ─────────────────────────────────────────────────────────────────────────
    // Show the popup (only once per session, only if cart has items)
    // ─────────────────────────────────────────────────────────────────────────
    const showPopup = useCallback(() => {
        if (hasShownRef.current) return;
        if (items.length === 0) return;

        hasShownRef.current = true;
        setIsVisible(true);

        // Fire-and-forget side effects
        ensureCoupon();
        saveAbandonedCart();
    }, [items.length, ensureCoupon, saveAbandonedCart]);

    // ─────────────────────────────────────────────────────────────────────────
    // Dismiss popup
    // ─────────────────────────────────────────────────────────────────────────
    const handleDismiss = useCallback(() => {
        setIsVisible(false);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // "Complete My Order" CTA
    // ─────────────────────────────────────────────────────────────────────────
    const handleCompleteOrder = useCallback(async () => {
        setIsVisible(false);
        setCartOpen(true);

        // Mark the abandoned cart as recovered
        if (abandonedCartDocIdRef.current) {
            try {
                await updateDoc(
                    doc(db, 'abandoned_carts', abandonedCartDocIdRef.current),
                    { recovered: true }
                );
            } catch (err) {
                console.error('[AbandonedCart] Failed to mark as recovered:', err);
            }
        }
    }, [setCartOpen]);

    // ─────────────────────────────────────────────────────────────────────────
    // Reset & restart the inactivity timer
    // ─────────────────────────────────────────────────────────────────────────
    const resetInactivityTimer = useCallback(() => {
        if (hasShownRef.current) return;
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            showPopup();
        }, INACTIVITY_TIMEOUT_MS);
    }, [showPopup]);

    // ─────────────────────────────────────────────────────────────────────────
    // Register event listeners
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // Only run on client, only if cart has items
        if (typeof window === 'undefined') return;
        if (items.length === 0) {
            // Clear timers if cart is empty
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            return;
        }

        // ── 1. Exit-intent: mouse leaving toward the top of the viewport ──
        const handleMouseOut = (e: MouseEvent) => {
            if (hasShownRef.current) return;
            // Check that the mouse is leaving the document (not a child element)
            if (!e.relatedTarget && e.clientY < 10) {
                showPopup();
            }
        };

        // ── 2. Inactivity timer ──
        const activityEvents: Array<keyof DocumentEventMap> = [
            'mousemove',
            'click',
            'scroll',
            'keydown',
            'touchstart',
        ];

        const handleActivity = () => resetInactivityTimer();

        // Start the inactivity timer immediately
        resetInactivityTimer();

        document.addEventListener('mouseout', handleMouseOut);
        activityEvents.forEach((evt) =>
            document.addEventListener(evt, handleActivity, { passive: true })
        );

        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
            activityEvents.forEach((evt) =>
                document.removeEventListener(evt, handleActivity)
            );
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [items.length, showPopup, resetInactivityTimer]);

    // ─────────────────────────────────────────────────────────────────────────
    // Render nothing if not visible
    // ─────────────────────────────────────────────────────────────────────────
    if (!isVisible) return null;

    const displayItems = items.slice(0, 2);

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Abandoned cart recovery"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div
                className="
                    relative z-10
                    w-full max-w-md
                    bg-[#F8F6F2]
                    border border-[#1F3D2B]/20
                    shadow-2xl
                    rounded-sm
                    overflow-hidden
                    animate-slide-up
                "
            >
                {/* Gold accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#BFA76A] to-[#D4AF37]" />

                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    aria-label="Close"
                    className="
                        absolute top-3 right-4
                        text-2xl leading-none
                        text-[#1F3D2B]/40 hover:text-[#1F3D2B]
                        transition-colors duration-200
                    "
                >
                    &times;
                </button>

                <div className="p-7 space-y-5">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <span className="block text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-medium">
                            Your cart is waiting
                        </span>
                        <h2 className="font-serif text-2xl text-[#1F3D2B] leading-tight">
                            Don&apos;t forget your items!
                        </h2>
                        <p className="text-sm text-[#1F3D2B]/70 leading-relaxed pt-1">
                            You left something behind. Complete your order and enjoy
                            a&nbsp;special discount just for you.
                        </p>
                    </div>

                    {/* Cart item previews */}
                    {displayItems.length > 0 && (
                        <div className="space-y-3">
                            {displayItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 bg-white/60 border border-[#1F3D2B]/10 rounded-sm p-3"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover rounded-sm flex-shrink-0 border border-[#1F3D2B]/10"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 bg-[#1F3D2B]/10 rounded-sm flex-shrink-0 flex items-center justify-center">
                                            <span className="text-[#1F3D2B]/30 text-xs">IMG</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1F3D2B] truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[#1F3D2B]/60 mt-0.5">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-[#1F3D2B] flex-shrink-0">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                            {items.length > 2 && (
                                <p className="text-xs text-center text-[#1F3D2B]/50">
                                    + {items.length - 2} more item{items.length - 2 > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Cart total */}
                    <div className="flex justify-between items-center border-t border-[#1F3D2B]/10 pt-3">
                        <span className="text-sm text-[#1F3D2B]/70 uppercase tracking-wider">
                            Cart Total
                        </span>
                        <span className="text-lg font-semibold text-[#1F3D2B]">
                            ₹{cartTotal.toFixed(2)}
                        </span>
                    </div>

                    {/* Discount banner */}
                    <div className="bg-[#1F3D2B] text-center py-3 px-4 rounded-sm space-y-1">
                        <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-medium">
                            Exclusive Offer
                        </p>
                        <p className="text-white text-sm leading-relaxed">
                            Complete your order now and get{' '}
                            <span className="text-[#D4AF37] font-bold">5% off!</span>
                        </p>
                        <div className="mt-2 border border-dashed border-[#D4AF37]/60 py-1.5 px-4 inline-block">
                            <span className="font-mono text-[#D4AF37] text-base tracking-widest font-bold">
                                {COUPON_CODE}
                            </span>
                        </div>
                        <p className="text-white/50 text-[10px] pt-1">
                            Apply at checkout to redeem your discount
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                            onClick={handleCompleteOrder}
                            className="
                                flex-1 py-3 px-4
                                bg-[#1F3D2B] text-white
                                uppercase tracking-widest text-xs font-medium
                                hover:bg-[#2d5940]
                                transition-colors duration-200
                                rounded-sm
                            "
                        >
                            Complete My Order
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="
                                flex-1 py-3 px-4
                                border border-[#1F3D2B]/30 text-[#1F3D2B]/70
                                uppercase tracking-widest text-xs font-medium
                                hover:border-[#1F3D2B] hover:text-[#1F3D2B]
                                transition-colors duration-200
                                rounded-sm
                            "
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>

                {/* Gold accent bottom bar */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
            </div>
        </div>
    );
}
