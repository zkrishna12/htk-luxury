'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

// ─── Product type (minimal, matches what ProductDetailsModal uses) ─────────────

export interface RecentProduct {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    image: string;
    weight?: string;
    description?: string;
}

// ─── In-memory store (module-level, survives re-renders and navigation) ───────

const MAX_ITEMS = 10;
const _recentProducts: RecentProduct[] = [];

/**
 * Add a product to the recently viewed list.
 * - Deduplicates by id (moves to front if already present).
 * - Keeps a maximum of MAX_ITEMS entries, most recent first.
 */
export function trackProductView(product: RecentProduct): void {
    const existingIndex = _recentProducts.findIndex((p) => p.id === product.id);
    if (existingIndex !== -1) {
        // Move to front
        _recentProducts.splice(existingIndex, 1);
    }
    _recentProducts.unshift(product);
    if (_recentProducts.length > MAX_ITEMS) {
        _recentProducts.splice(MAX_ITEMS);
    }
}

/**
 * Get a snapshot of recently viewed products.
 */
export function getRecentlyViewed(): RecentProduct[] {
    return [..._recentProducts];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentlyViewed() {
    const { addToCart } = useCart();
    const scrollRef = useRef<HTMLDivElement>(null);

    // We poll the in-memory list so the component stays reactive to changes.
    const [items, setItems] = useState<RecentProduct[]>([]);

    useEffect(() => {
        // Initial hydration from the module-level array
        setItems(getRecentlyViewed());

        // Re-sync every 500 ms so that views tracked in the same session appear.
        const interval = setInterval(() => {
            setItems(getRecentlyViewed());
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Only show when there are at least 2 items
    if (items.length < 2) return null;

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 280;
        scrollRef.current.scrollBy({ left: dir === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    };

    return (
        <section className="border-t border-[var(--color-primary)]/5 pt-16 pb-8">
            <div className="luxury-container">
                {/* Header */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-accent)] mb-2">
                            Your Journey
                        </p>
                        <h2 className="font-serif text-2xl text-[var(--color-primary)] font-semibold">
                            Recently Viewed
                        </h2>
                    </div>

                    {/* Desktop Scroll Arrows */}
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                            className="w-9 h-9 flex items-center justify-center border border-[var(--color-primary)]/20 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 transition-all duration-200"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            className="w-9 h-9 flex items-center justify-center border border-[var(--color-primary)]/20 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 transition-all duration-200"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {items.map((product) => (
                        <div
                            key={product.id}
                            className="snap-start shrink-0 w-56 bg-white border border-[var(--color-primary)]/5 hover:border-[var(--color-accent)]/30 transition-all duration-300 group flex flex-col"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                                {/* Subtle logo overlay */}
                                <div className="absolute top-3 left-3 w-7 h-7 opacity-70 z-10 pointer-events-none">
                                    <Image
                                        src="/logo.png"
                                        alt="HTK"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1">
                                    <h3 className="font-serif text-sm text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug line-clamp-2">
                                        {product.name}
                                    </h3>
                                    {product.weight && (
                                        <p className="text-[10px] opacity-40">{product.weight}</p>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-medium">₹{product.price}</span>
                                        {product.mrp && (
                                            <span className="text-[10px] opacity-35 line-through">₹{product.mrp}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                            quantity: 1,
                                        })
                                    }
                                    className="w-full py-2 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-white transition-all text-[11px] font-medium"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
