'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendAdminNotification } from '@/lib/adminNotifications';

// Generate a random coupon code in format HTK10-XXXXX
function generateCouponCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HTK10-';
    for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'dismissed'>('idle');
    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        // Check local storage
        const isSubscribed = localStorage.getItem('htk_newsletter_subscribed');
        const isDismissed = localStorage.getItem('htk_newsletter_dismissed');

        if (!isSubscribed && !isDismissed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after 3 seconds (reduced from 8)
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setStatus('dismissed');
        localStorage.setItem('htk_newsletter_dismissed', 'true');
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Generate unique coupon code
        const newCouponCode = generateCouponCode();

        try {
            await addDoc(collection(db, 'leads'), {
                email,
                source: 'newsletter_popup',
                couponCode: newCouponCode,
                couponDiscount: 10,
                couponUsed: false,
                createdAt: serverTimestamp()
            });

            // Send admin notification
            sendAdminNotification({
                type: 'newsletter',
                data: { email, couponCode: newCouponCode }
            });

            setCouponCode(newCouponCode);
            setStatus('success');
            localStorage.setItem('htk_newsletter_subscribed', 'true');
            localStorage.setItem('htk_coupon_code', newCouponCode);
            // Don't auto-dismiss so user can copy the coupon
        } catch (error) {
            console.error("Subscription error", error);
            setStatus('idle');
            alert("Unable to subscribe. Please try again.");
        }
    };

    const handleCopyCoupon = () => {
        navigator.clipboard.writeText(couponCode);
        alert('Coupon code copied!');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleDismiss} />

            {/* Modal */}
            <div className={`
                relative bg-[var(--color-background)] w-full max-w-md p-8 shadow-2xl 
                border-2 border-[var(--color-primary)] 
                transform transition-all animate-slide-up
                ${status === 'success' ? 'text-center' : ''}
            `}>
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-4 text-2xl opacity-50 hover:opacity-100"
                >
                    &times;
                </button>

                {status === 'success' ? (
                    <div className="py-6 space-y-4 animate-fade-in">
                        <div className="text-4xl">🎁</div>
                        <h3 className="font-serif text-2xl text-[var(--color-primary)]">Welcome to the Family!</h3>
                        <p className="font-sans text-sm opacity-70">
                            Here's your exclusive 10% discount code:
                        </p>
                        <div className="bg-[var(--color-primary)]/10 border-2 border-dashed border-[var(--color-primary)] p-4 my-4">
                            <p className="font-mono text-2xl font-bold text-[var(--color-primary)] tracking-wider">
                                {couponCode}
                            </p>
                        </div>
                        <p className="font-sans text-xs opacity-60">
                            Use this code at checkout to get 10% off your first order.
                        </p>
                        <button
                            onClick={handleCopyCoupon}
                            className="mt-4 py-3 px-8 bg-[var(--color-primary)] text-white uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                        >
                            Copy Code
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]">Exclusive Access</span>
                            <h2 className="font-serif text-3xl">Join the Inner Circle</h2>
                            <p className="font-sans text-sm opacity-70 leading-relaxed px-4">
                                Subscribe to receive early access to our seasonal harvests and a 10% welcome gift.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <input
                                type="email"
                                placeholder="YOUR EMAIL ADDRESS"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none text-center placeholder:text-xs placeholder:tracking-widest"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-[var(--color-primary)] text-white uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                            >
                                {status === 'loading' ? 'Joining...' : 'Subscribe'}
                            </button>
                        </form>

                        <p className="text-[10px] text-center opacity-40 uppercase tracking-widest">
                            No Spam. Only Nature's Best.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
