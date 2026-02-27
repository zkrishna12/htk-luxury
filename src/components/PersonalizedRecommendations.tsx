'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { products } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Tag priority for fallback ordering
const TAG_PRIORITY: Record<string, number> = {
    'Best Seller': 1,
    'Rare': 2,
    'New Launch': 3,
};

function getTagPriority(tag?: string): number {
    if (!tag) return 99;
    return TAG_PRIORITY[tag] ?? 50;
}

// Derive a simple category from product id
function getCategory(productId: string): string {
    const id = productId.toLowerCase();
    if (id.includes('honey')) return 'Honey';
    if (id.includes('sugar')) return 'Sugar';
    if (id.includes('manjal') || id.includes('turmeric')) return 'Turmeric';
    if (id.includes('coffee')) return 'Coffee';
    return 'Other';
}

function computeRecommendations(
    purchasedIds: Set<string>,
    cartIds: Set<string>
): { recs: typeof products; title: string } {
    const activeProducts = products.filter(p => p.isActive !== false);

    // Case 1: User has purchase history — show items not yet bought, prioritize higher price & different categories
    if (purchasedIds.size > 0) {
        const purchasedCategories = new Set(
            [...purchasedIds].map(id => getCategory(id))
        );

        const notPurchased = activeProducts.filter(p => !purchasedIds.has(p.id));

        // Sort: different category first, then by price descending
        const sorted = [...notPurchased].sort((a, b) => {
            const aNewCat = !purchasedCategories.has(getCategory(a.id)) ? 0 : 1;
            const bNewCat = !purchasedCategories.has(getCategory(b.id)) ? 0 : 1;
            if (aNewCat !== bNewCat) return aNewCat - bNewCat;
            return b.price - a.price;
        });

        return { recs: sorted.slice(0, 4), title: 'Recommended for You' };
    }

    // Case 2: No purchase history — show products not in cart
    if (cartIds.size > 0) {
        const notInCart = activeProducts.filter(p => !cartIds.has(p.id));
        const sorted = [...notInCart].sort((a, b) => b.price - a.price);
        return { recs: sorted.slice(0, 4), title: 'You Might Like' };
    }

    // Case 3: No cart either — top 4 by tag priority (Best Seller → Rare → New Launch → rest)
    const sorted = [...activeProducts].sort((a, b) => {
        const pa = getTagPriority(a.tag);
        const pb = getTagPriority(b.tag);
        if (pa !== pb) return pa - pb;
        return b.price - a.price;
    });
    return { recs: sorted.slice(0, 4), title: 'You Might Like' };
}

export default function PersonalizedRecommendations() {
    const { items, addToCart } = useCart();
    const [recs, setRecs] = useState<typeof products>([]);
    const [title, setTitle] = useState('You Might Like');
    const [addedId, setAddedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Compute recommendations whenever cart changes or on mount
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const cartIds = new Set(items.map(i => i.id));

            const user = auth.currentUser;
            if (user) {
                // Logged in: try to fetch order history
                try {
                    const ordersQuery = query(
                        collection(db, 'orders'),
                        where('userId', '==', user.uid)
                    );
                    const snap = await getDocs(ordersQuery);
                    const purchasedIds = new Set<string>();
                    snap.forEach(doc => {
                        const data = doc.data();
                        // orders may store items as array of {id, ...}
                        const orderItems: any[] = data.items || data.products || [];
                        orderItems.forEach((item: any) => {
                            if (item.id) purchasedIds.add(item.id);
                            else if (item.productId) purchasedIds.add(item.productId);
                        });
                    });

                    if (!cancelled) {
                        const result = computeRecommendations(purchasedIds, cartIds);
                        setRecs(result.recs);
                        setTitle(result.recs.length > 0 && purchasedIds.size > 0 ? 'Recommended for You' : result.title);
                    }
                } catch {
                    // Firestore error — fall back to cart-based logic
                    if (!cancelled) {
                        const result = computeRecommendations(new Set(), cartIds);
                        setRecs(result.recs);
                        setTitle(result.title);
                    }
                }
            } else {
                // Guest — cart-based or top tags
                if (!cancelled) {
                    const result = computeRecommendations(new Set(), cartIds);
                    setRecs(result.recs);
                    setTitle(result.title);
                }
            }
        };

        // Wait for auth to initialise, then compute
        const unsubscribe = onAuthStateChanged(auth, () => {
            run();
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [items]);

    // Update scroll arrow visibility
    const updateArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateArrows();
        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows, { passive: true });
        return () => {
            el.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
        };
    }, [recs, updateArrows]);

    const scrollBy = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector('[data-rec-card]')?.clientWidth ?? 260;
        el.scrollBy({ left: direction === 'right' ? cardWidth + 16 : -(cardWidth + 16), behavior: 'smooth' });
    };

    const handleAddToCart = (product: (typeof products)[number]) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    if (recs.length === 0) return null;

    return (
        <div className="relative">
            {/* Scroll arrows — desktop only */}
            {canScrollLeft && (
                <button
                    onClick={() => scrollBy('left')}
                    aria-label="Scroll left"
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                               w-10 h-10 items-center justify-center
                               bg-[#F8F6F2] border border-[#D4AF37]/40 shadow-md
                               text-[#1F3D2B] hover:border-[#D4AF37] hover:bg-white transition-all duration-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}
            {canScrollRight && (
                <button
                    onClick={() => scrollBy('right')}
                    aria-label="Scroll right"
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                               w-10 h-10 items-center justify-center
                               bg-[#F8F6F2] border border-[#D4AF37]/40 shadow-md
                               text-[#1F3D2B] hover:border-[#D4AF37] hover:bg-white transition-all duration-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}

            {/* Scrollable carousel */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
                           pb-2 px-1
                           [scrollbar-width:none] [-ms-overflow-style:none]
                           [&::-webkit-scrollbar]:hidden"
            >
                {recs.map(product => {
                    const inCart = items.some(i => i.id === product.id);
                    const justAdded = addedId === product.id;

                    return (
                        <div
                            key={product.id}
                            data-rec-card
                            className="
                                snap-start shrink-0
                                w-[220px] sm:w-[240px] md:w-[260px]
                                flex flex-col
                                bg-[#F8F6F2] border border-transparent
                                hover:border-[#D4AF37]/60
                                transition-all duration-300 group
                            "
                        >
                            {/* Product Image */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-white/60">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                                {/* Tag badge */}
                                {product.tag && (
                                    <span className="absolute top-3 right-3 bg-[#1F3D2B] text-[#F8F6F2] text-[9px] px-2.5 py-1 font-medium tracking-wide uppercase">
                                        {product.tag}
                                    </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex flex-col gap-2 flex-1">
                                <h4 className="font-serif text-[#1F3D2B] text-sm font-semibold leading-snug line-clamp-2">
                                    {product.name}
                                </h4>
                                <div className="flex items-baseline gap-2 mt-auto">
                                    <span className="text-[#1F3D2B] font-medium text-sm">₹{product.price}</span>
                                    {product.mrp && (
                                        <span className="text-[#1F3D2B]/40 line-through text-xs">₹{product.mrp}</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className={`
                                        mt-1 w-full py-2.5 text-xs font-medium tracking-wide transition-all duration-200
                                        ${justAdded
                                            ? 'bg-[#1F3D2B] text-[#D4AF37] border border-[#1F3D2B]'
                                            : inCart
                                                ? 'bg-[#1F3D2B]/8 text-[#1F3D2B] border border-[#1F3D2B]/25 hover:bg-[#1F3D2B] hover:text-white'
                                                : 'border border-[#1F3D2B]/25 text-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-white'
                                        }
                                    `}
                                >
                                    {justAdded ? '✓ Added' : inCart ? 'Add Again' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
