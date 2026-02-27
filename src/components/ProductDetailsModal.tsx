'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import LuxuryFrame from './LuxuryFrame';
import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
} from 'firebase/firestore';

interface ModalReview {
    id: string;
    name: string;
    location?: string;
    rating: number;
    text: string;
    date?: string;
    createdAt?: any;
}

function formatModalDate(ts: any): string {
    if (!ts) return '';
    if (typeof ts === 'string') return ts;
    const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ModalStarRow({ rating }: { rating: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z"
                        fill={s <= Math.round(rating) ? '#D4AF37' : 'none'}
                        stroke={s <= Math.round(rating) ? '#D4AF37' : '#1F3D2B'}
                        strokeOpacity={s <= Math.round(rating) ? '1' : '0.2'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ))}
        </span>
    );
}

interface Product {
    id: string;
    name: string;
    price: number;
    mrp?: number;
    image: string;
    description?: string;
    advantages?: string[];
    howToUse?: string[];
    weight?: string;
}

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
    const { addToCart } = useCart();
    const [productReviews, setProductReviews] = useState<ModalReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Fetch reviews whenever product changes
    useEffect(() => {
        if (!isOpen || !product) {
            setProductReviews([]);
            return;
        }
        const fetchProductReviews = async () => {
            setReviewsLoading(true);
            try {
                const q = query(
                    collection(db, 'reviews'),
                    where('productId', '==', product.id),
                    orderBy('createdAt', 'desc'),
                    limit(3)
                );
                const snap = await getDocs(q);
                const fetched: ModalReview[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<ModalReview, 'id'>),
                }));
                setProductReviews(fetched);
            } catch (err) {
                console.error('Failed to fetch product reviews:', err);
                setProductReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchProductReviews();
    }, [isOpen, product?.id]);

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        onClose(); // Optional: close modal on add? Or keep open? Let's close for now or show flair.
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[var(--color-bg-light)] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full md:hidden text-2xl"
                >
                    ✕
                </button>

                <LuxuryFrame className="p-0 border-none">
                    <div className="grid md:grid-cols-2">

                        {/* Left: Image Section */}
                        <div className="relative h-[300px] md:h-auto bg-[var(--color-bg-warm)] min-h-[400px]">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {/* Logo Overlay */}
                            <div className="absolute top-6 left-6 w-12 h-12 opacity-80 mix-blend-multiply">
                                <Image
                                    src="/logo.png"
                                    alt="HTK"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* Right: Content Section */}
                        <div className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[90vh]">

                            {/* Header */}
                            <div className="space-y-4 border-b border-[var(--color-primary)]/10 pb-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)] leading-tight">
                                        {product.name}
                                    </h2>
                                    <button onClick={onClose} className="hidden md:block text-2xl opacity-50 hover:opacity-100">✕</button>
                                </div>
                                <div className="flex items-baseline gap-4 text-xl">
                                    <span className="font-serif">₹{product.price}</span>
                                    {product.mrp && <span className="text-sm opacity-40 line-through">₹{product.mrp}</span>}
                                    <span className="text-xs opacity-60 bg-[var(--color-primary)]/5 px-2 py-1 rounded font-medium">
                                        {product.weight}
                                    </span>
                                </div>
                                {product.description && (
                                    <p className="font-sans opacity-80 leading-relaxed text-sm">
                                        {product.description}
                                    </p>
                                )}
                            </div>

                            {/* Advantages */}
                            {product.advantages && (
                                <div className="space-y-4">
                                    <h3 className="text-sm text-[var(--color-accent)] font-bold">Why it's Exceptional</h3>
                                    <ul className="grid grid-cols-1 gap-3">
                                        {product.advantages.map((adv, i) => (
                                            <li key={i} className="flex gap-3 text-sm opacity-80 leading-relaxed items-start">
                                                <span className="text-[var(--color-accent)] mt-1">✦</span>
                                                <span>{adv}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* How to Use */}
                            {product.howToUse && (
                                <div className="space-y-4 bg-[var(--color-primary)]/5 p-6 border border-[var(--color-primary)]/10">
                                    <h3 className="text-sm text-[var(--color-accent)] font-bold">Ritual & Usage</h3>
                                    <ol className="space-y-3 relative border-l border-[var(--color-primary)]/20 ml-2">
                                        {product.howToUse.map((step, i) => (
                                            <li key={i} className="pl-6 relative text-sm opacity-80">
                                                <span className="absolute -left-[5px] top-[6px] w-2.5 h-2.5 rounded-full bg-[var(--color-background)] border border-[var(--color-primary)]/40"></span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div className="space-y-4 border-t border-[var(--color-primary)]/10 pt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm text-[var(--color-accent)] font-bold uppercase tracking-wider">
                                        Customer Reviews
                                    </h3>
                                    <Link
                                        href="/reviews"
                                        onClick={onClose}
                                        className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 border-b border-transparent hover:border-[var(--color-primary)] transition-all pb-0.5"
                                    >
                                        See all reviews
                                    </Link>
                                </div>

                                {reviewsLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="animate-pulse space-y-1.5">
                                                <div className="h-3 bg-[var(--color-primary)]/10 rounded w-1/3" />
                                                <div className="h-3 bg-[var(--color-primary)]/10 rounded w-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : productReviews.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-xs opacity-40">No reviews yet for this product.</p>
                                        <Link
                                            href="/reviews"
                                            onClick={onClose}
                                            className="text-[10px] text-[var(--color-accent)] opacity-70 hover:opacity-100 underline mt-1 inline-block transition-opacity"
                                        >
                                            Be the first to review
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {productReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="bg-[var(--color-primary)]/3 border border-[var(--color-primary)]/8 p-4 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-serif text-[var(--color-primary)] leading-tight">
                                                            {review.name}
                                                        </p>
                                                        {review.location && (
                                                            <p className="text-[10px] opacity-35 uppercase tracking-wider">
                                                                {review.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <ModalStarRow rating={review.rating} />
                                                        <span className="text-[10px] opacity-30">
                                                            {review.date || formatModalDate(review.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs opacity-70 italic leading-relaxed">
                                                    &ldquo;{review.text}&rdquo;
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-sm hover:opacity-90 transition-all shadow-md mt-4 font-medium"
                            >
                                Add to Cart — ₹{product.price}
                            </button>

                        </div>
                    </div>
                </LuxuryFrame>
            </div>
        </div>
    );
}
