'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useCompare } from '@/context/CompareContext';
import { useCart } from '@/context/CartContext';

// Compute price-per-gram from weight string like "500g" or "100g"
function pricePerGram(price: number, weight: string): number {
    const match = weight.match(/(\d+(\.\d+)?)/);
    if (!match) return Infinity;
    const grams = parseFloat(match[1]);
    return grams > 0 ? price / grams : Infinity;
}

// Collect all advantages across items, mark those unique to one product
function buildAdvantageMap(items: any[]): Map<string, number[]> {
    // key: advantage text, value: array of column indices that have it
    const map = new Map<string, number[]>();
    items.forEach((product, idx) => {
        (product.advantages || []).forEach((adv: string) => {
            const existing = map.get(adv) ?? [];
            map.set(adv, [...existing, idx]);
        });
    });
    return map;
}

export default function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart, items: cartItems } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
    };

    // Empty state
    if (compareItems.length === 0) {
        return (
            <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24">
                <Navigation />
                <CartDrawer />
                <div className="luxury-container flex flex-col items-center justify-center py-32 space-y-8 text-center">
                    {/* Scale / Balance icon */}
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)] opacity-50">
                        <line x1="12" y1="3" x2="12" y2="21" />
                        <path d="M3 8l9-5 9 5" />
                        <path d="M6 8a3 3 0 0 1-3 3 3 3 0 0 1-3-3l3-5 3 5z" />
                        <path d="M18 8a3 3 0 0 1-3 3 3 3 0 0 1-3-3l3-5 3 5z" />
                        <line x1="5" y1="21" x2="19" y2="21" />
                    </svg>
                    <div className="space-y-3">
                        <h1 className="font-serif text-4xl md:text-5xl">Compare Products</h1>
                        <p className="opacity-50 font-sans text-sm tracking-wide max-w-md mx-auto">
                            Add products to compare their advantages, ingredients, and value side by side.
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="px-8 py-3 bg-[var(--color-primary)] text-white text-xs font-medium tracking-widest uppercase hover:opacity-80 transition-opacity"
                    >
                        Browse The Collection
                    </Link>
                </div>
            </LuxuryFrame>
        );
    }

    // Compute best deal (lowest price per gram)
    const ppg = compareItems.map(p => pricePerGram(p.price, p.weight));
    const minPpg = Math.min(...ppg);
    const bestDealIdx = ppg.indexOf(minPpg);

    // Discount percentages
    const discounts = compareItems.map(p =>
        p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0
    );

    // Advantage map for unique highlighting
    const advMap = buildAdvantageMap(compareItems);

    const colWidth = compareItems.length === 2 ? 'w-1/2' : 'w-1/3';

    return (
        <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24">
            <Navigation />
            <CartDrawer />

            {/* Header */}
            <div className="luxury-container text-center mb-12 space-y-4">
                <div className="flex justify-center opacity-70">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
                        <line x1="12" y1="3" x2="12" y2="20" />
                        <path d="M3 8l9-5 9 5" />
                        <path d="M5 8a4 4 0 0 0 8 0" />
                        <path d="M11 8a4 4 0 0 0 8 0" />
                        <line x1="4" y1="20" x2="20" y2="20" />
                    </svg>
                </div>
                <h1 className="font-serif text-5xl md:text-6xl">Compare Products</h1>
                <p className="opacity-50 text-sm font-sans tracking-wide">
                    {compareItems.length} product{compareItems.length > 1 ? 's' : ''} selected
                </p>
            </div>

            {/* Action bar */}
            <div className="luxury-container flex flex-wrap items-center justify-between gap-4 mb-8">
                <Link
                    href="/shop"
                    className="text-xs font-medium opacity-60 hover:opacity-100 border-b border-transparent hover:border-[var(--color-primary)] transition-all pb-0.5"
                >
                    ← Back to Shop
                </Link>
                <button
                    onClick={clearCompare}
                    className="text-xs font-medium opacity-50 hover:opacity-100 transition-opacity border border-[var(--color-primary)]/20 px-4 py-2 hover:border-[var(--color-primary)]/60"
                >
                    Clear All
                </button>
            </div>

            {/* Comparison Table — horizontally scrollable on mobile */}
            <div className="luxury-container">
                <div className="overflow-x-auto -mx-4 px-4">
                    <div className={`min-w-[340px] ${compareItems.length === 3 ? 'min-w-[700px]' : 'min-w-[420px]'}`}>

                        {/* ── ROW 1: Images ── */}
                        <div className="flex gap-0 mb-0">
                            {compareItems.map((product, idx) => (
                                <div key={product.id} className={`${colWidth} relative`}>
                                    {idx === bestDealIdx && (
                                        <div className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-white text-[9px] px-2.5 py-1 font-medium tracking-wider uppercase shadow-md">
                                            Best Value
                                        </div>
                                    )}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-white border border-[var(--color-primary)]/5 mx-1">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 2: Product Name ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product, idx) => (
                                <div key={product.id} className={`${colWidth} px-4 py-5 bg-white mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-1 font-medium">Product</p>
                                    <h2 className={`font-serif text-lg leading-snug ${idx === bestDealIdx ? 'text-[#D4AF37]' : 'text-[var(--color-primary)]'}`}>
                                        {product.name}
                                    </h2>
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 3: Price / MRP / Discount ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product, idx) => (
                                <div key={product.id} className={`${colWidth} px-4 py-5 bg-[var(--color-background)] mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2 font-medium">Price</p>
                                    <div className="space-y-1">
                                        <p className={`font-serif text-2xl font-semibold ${idx === bestDealIdx ? 'text-[#D4AF37]' : 'text-[var(--color-primary)]'}`}>
                                            ₹{product.price}
                                        </p>
                                        {product.mrp && (
                                            <p className="text-xs opacity-40 line-through">₹{product.mrp}</p>
                                        )}
                                        {discounts[idx] > 0 && (
                                            <span className="inline-block bg-[#D4AF37]/15 text-[#8B6914] text-[10px] px-2 py-0.5 font-medium">
                                                {discounts[idx]}% off
                                            </span>
                                        )}
                                        <p className="text-[10px] opacity-40 pt-1">
                                            ₹{(ppg[idx] * 100).toFixed(1)} per 100g
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 4: Weight ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product) => (
                                <div key={product.id} className={`${colWidth} px-4 py-4 bg-white mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-1.5 font-medium">Weight</p>
                                    <p className="text-sm font-medium">{product.weight}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 5: Tag / Badge ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product) => (
                                <div key={product.id} className={`${colWidth} px-4 py-4 bg-[var(--color-background)] mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-1.5 font-medium">Category</p>
                                    {product.tag ? (
                                        <span className="inline-block bg-[var(--color-primary)] text-[var(--color-background)] text-[10px] px-3 py-1 font-medium">
                                            {product.tag}
                                        </span>
                                    ) : (
                                        <span className="text-xs opacity-35">—</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 6: Description ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product) => (
                                <div key={product.id} className={`${colWidth} px-4 py-5 bg-white mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-2 font-medium">About</p>
                                    <p className="text-xs leading-relaxed opacity-70">{product.description || '—'}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 7: Advantages ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product, idx) => (
                                <div key={product.id} className={`${colWidth} px-4 py-5 bg-[var(--color-background)] mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3 font-medium">Advantages</p>
                                    {product.advantages && product.advantages.length > 0 ? (
                                        <ul className="space-y-2">
                                            {product.advantages.map((adv: string) => {
                                                const sharedWith = advMap.get(adv) ?? [];
                                                const isUnique = sharedWith.length === 1 && sharedWith[0] === idx;
                                                return (
                                                    <li key={adv} className="flex items-start gap-2">
                                                        <span className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${isUnique ? 'bg-[#D4AF37]' : 'bg-[var(--color-primary)]/30'}`} />
                                                        <span className={`text-xs leading-snug ${isUnique ? 'text-[#B8960C] font-medium' : 'opacity-65'}`}>
                                                            {adv}
                                                            {isUnique && (
                                                                <span className="ml-1 text-[9px] text-[#D4AF37] font-semibold">★ unique</span>
                                                            )}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <span className="text-xs opacity-35">—</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 8: How to Use ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product) => (
                                <div key={product.id} className={`${colWidth} px-4 py-5 bg-white mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-3 font-medium">How to Use</p>
                                    {product.howToUse && product.howToUse.length > 0 ? (
                                        <ul className="space-y-2">
                                            {product.howToUse.map((step: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-0.5 shrink-0 text-[10px] text-[var(--color-accent)] font-semibold w-4">{i + 1}.</span>
                                                    <span className="text-xs leading-snug opacity-65">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-xs opacity-35">—</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── ROW 9: Add to Cart ── */}
                        <div className="flex gap-0 border-b border-[var(--color-primary)]/8">
                            {compareItems.map((product, idx) => {
                                const existing = cartItems.find(i => i.id === product.id);
                                const qty = existing ? existing.quantity : 0;
                                return (
                                    <div key={product.id} className={`${colWidth} px-4 py-5 bg-[var(--color-background)] mx-1 border-l border-r border-[var(--color-primary)]/5`}>
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`w-full py-3 text-xs font-medium tracking-wider uppercase transition-all duration-200 border ${
                                                    idx === bestDealIdx
                                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-white hover:bg-[#B8960C] hover:border-[#B8960C]'
                                                        : 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white hover:opacity-80'
                                                }`}
                                            >
                                                Add to Cart
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3 w-full py-2 border border-[var(--color-primary)]/20 bg-white">
                                                <span className="text-xs opacity-50">In Cart:</span>
                                                <span className="text-sm font-medium">{qty}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── ROW 10: Remove from Compare ── */}
                        <div className="flex gap-0">
                            {compareItems.map((product) => (
                                <div key={product.id} className={`${colWidth} px-4 py-4 bg-white mx-1 border-l border-r border-b border-[var(--color-primary)]/5`}>
                                    <button
                                        onClick={() => removeFromCompare(product.id)}
                                        className="w-full py-2 text-[10px] font-medium opacity-40 hover:opacity-80 border border-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/40 transition-all tracking-wider uppercase"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Add more products CTA */}
            {compareItems.length < 3 && (
                <div className="luxury-container mt-12 text-center space-y-4">
                    <p className="text-xs opacity-40 font-medium">
                        You can compare up to 3 products. {3 - compareItems.length} slot{3 - compareItems.length !== 1 ? 's' : ''} available.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block px-8 py-3 border border-[var(--color-primary)]/25 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200 tracking-wider uppercase"
                    >
                        Add More Products
                    </Link>
                </div>
            )}

        </LuxuryFrame>
    );
}
