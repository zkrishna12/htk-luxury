'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
    };

    return (
        <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24">
            <Navigation />
            <CartDrawer />

            {/* Page Header */}
            <div className="luxury-container text-center mb-16 space-y-4 animate-fade-in">
                {/* Ornamental heart icon */}
                <div className="flex justify-center opacity-80">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-[var(--color-accent)]"
                    >
                        <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                    </svg>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif">My Wishlist</h1>
                <p className="opacity-60 max-w-2xl mx-auto font-sans tracking-wide">
                    {wishlistCount > 0
                        ? `${wishlistCount} treasured ${wishlistCount === 1 ? 'item' : 'items'} saved for later.`
                        : 'Your curated collection of nature\'s finest.'}
                </p>
            </div>

            {/* Empty State */}
            {wishlistItems.length === 0 && (
                <div className="luxury-container flex flex-col items-center gap-8 py-24 animate-fade-in">
                    {/* Decorative empty heart */}
                    <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-[var(--color-accent)] opacity-40"
                    >
                        <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                    </svg>
                    <div className="text-center space-y-3">
                        <p className="font-serif text-2xl opacity-70">Nothing saved yet</p>
                        <p className="opacity-50 text-sm font-sans max-w-sm leading-relaxed">
                            Browse our collection and tap the heart icon on any product to save it here.
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-block mt-4 px-10 py-3 border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 text-sm font-medium tracking-widest uppercase"
                    >
                        Explore the Collection
                    </Link>
                </div>
            )}

            {/* Wishlist Grid */}
            {wishlistItems.length > 0 && (
                <div className="luxury-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                    {wishlistItems.map((product) => (
                        <div
                            key={product.id}
                            className="group relative bg-white border border-[var(--color-primary)]/5 hover:border-[var(--color-accent)]/30 transition-all duration-500 flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    unoptimized
                                />

                                {/* HTK Logo overlay */}
                                <div className="absolute top-4 left-4 w-8 h-8 opacity-80 z-10 pointer-events-none">
                                    <Image
                                        src="/logo.png"
                                        alt="HTK Logo"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>

                                {/* Tag badge */}
                                {product.tag && (
                                    <span className="absolute top-4 right-4 bg-[var(--color-primary)] text-[var(--color-background)] text-[10px] px-3 py-1 font-medium z-10">
                                        {product.tag}
                                    </span>
                                )}

                                {/* Remove from wishlist — heart button top-right (below tag) */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    title="Remove from Wishlist"
                                    className="absolute bottom-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                                    aria-label="Remove from wishlist"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-[var(--color-accent)]"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 text-center space-y-3 flex-1 flex flex-col justify-end">
                                <h3 className="font-serif text-xl group-hover:text-[var(--color-accent)] transition-colors">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-[10px] opacity-70 px-2 leading-relaxed line-clamp-2">
                                        {product.description}
                                    </p>
                                )}
                                {product.weight && (
                                    <div className="text-xs opacity-50">{product.weight}</div>
                                )}

                                {/* Stars */}
                                <div className="flex justify-center gap-1 text-[var(--color-accent)] text-xs">
                                    {['★', '★', '★', '★', '★'].map((star, i) => (
                                        <span key={i}>{star}</span>
                                    ))}
                                    <span className="text-[var(--color-primary)] opacity-40 ml-2">(4.9)</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-center gap-4 text-sm font-medium py-2">
                                    <span>₹{product.price.toFixed(2)}</span>
                                    {product.mrp && (
                                        <span className="opacity-40 line-through">₹{product.mrp}.00</span>
                                    )}
                                </div>

                                {/* Add to Cart */}
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full py-3 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-white transition-all text-xs mt-2 font-medium"
                                >
                                    Add to Cart
                                </button>

                                {/* Remove link */}
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="text-[10px] opacity-40 hover:opacity-80 hover:text-red-500 transition-all pb-0.5 w-max mx-auto font-medium"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Continue Shopping */}
            {wishlistItems.length > 0 && (
                <div className="luxury-container text-center mt-16">
                    <Link
                        href="/shop"
                        className="inline-block px-10 py-3 border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 text-sm font-medium tracking-widest uppercase"
                    >
                        Continue Shopping
                    </Link>
                </div>
            )}

            {/* Quote divider */}
            <div className="luxury-container text-center mt-32 mb-16 opacity-60">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="mx-auto mb-4 text-[var(--color-accent)]"
                >
                    <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
                </svg>
                <p className="font-serif italic text-2xl">
                    "The best things in life are worth saving for."
                </p>
            </div>
        </LuxuryFrame>
    );
}
