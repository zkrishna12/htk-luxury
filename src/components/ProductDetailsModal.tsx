'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [linkCopied, setLinkCopied] = useState(false);

    // Zoom state
    const [isZoomed, setIsZoomed] = useState(false);
    const [transformOrigin, setTransformOrigin] = useState('50% 50%');
    const [hintVisible, setHintVisible] = useState(true);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsZoomed(true);
        setHintVisible(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsZoomed(false);
        setTransformOrigin('50% 50%');
    }, []);

    const handleTouchToggle = useCallback(() => {
        setIsZoomed(prev => !prev);
        setHintVisible(false);
    }, []);

    // Reset zoom when product changes
    useEffect(() => {
        setIsZoomed(false);
        setHintVisible(true);
        setTransformOrigin('50% 50%');
    }, [product?.id]);

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

                        {/* Left: Image Section with Zoom on Hover */}
                        <div
                            ref={imageContainerRef}
                            className="relative h-[300px] md:h-auto bg-[var(--color-bg-warm)] min-h-[400px] overflow-hidden select-none"
                            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onTouchStart={handleTouchToggle}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                    transformOrigin: transformOrigin,
                                    transition: 'transform 300ms ease',
                                    willChange: 'transform',
                                }}
                            >
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    draggable={false}
                                />
                            </div>

                            {/* Logo Overlay */}
                            <div className="absolute top-6 left-6 w-12 h-12 opacity-80 mix-blend-multiply z-10 pointer-events-none">
                                <Image
                                    src="/logo.png"
                                    alt="HTK"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>

                            {/* Hover to zoom hint */}
                            <div
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                                style={{
                                    opacity: hintVisible ? 1 : 0,
                                    transition: 'opacity 400ms ease',
                                }}
                            >
                                <span className="flex items-center gap-1.5 bg-black/50 text-white text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        <line x1="11" y1="8" x2="11" y2="14" />
                                        <line x1="8" y1="11" x2="14" y2="11" />
                                    </svg>
                                    Hover to zoom
                                </span>
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

                                {/* Social Sharing */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="flex items-center gap-1.5 text-[10px] font-medium opacity-50 uppercase tracking-wider">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="18" cy="5" r="3" />
                                                <circle cx="6" cy="12" r="3" />
                                                <circle cx="18" cy="19" r="3" />
                                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                            </svg>
                                            Share
                                        </span>

                                        {/* WhatsApp */}
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} from HTK Enterprises! ${'https://htkenterprises.net/shop/'}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Share on WhatsApp"
                                            className="w-8 h-8 flex items-center justify-center border border-[#25D366]/30 hover:bg-[#25D366]/10 transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </a>

                                        {/* Facebook */}
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://htkenterprises.net/shop/')}&quote=${encodeURIComponent(`Check out ${product.name}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Share on Facebook"
                                            className="w-8 h-8 flex items-center justify-center border border-[#1877F2]/30 hover:bg-[#1877F2]/10 transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </a>

                                        {/* Twitter/X */}
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} from HTK Enterprises!`)}&url=${encodeURIComponent('https://htkenterprises.net/shop/')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Share on X (Twitter)"
                                            className="w-8 h-8 flex items-center justify-center border border-black/15 hover:bg-black/5 transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#000000">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                            </svg>
                                        </a>

                                        {/* Copy Link */}
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('https://htkenterprises.net/shop/').then(() => {
                                                        setLinkCopied(true);
                                                        setTimeout(() => setLinkCopied(false), 2000);
                                                    }).catch(() => {});
                                                }}
                                                title="Copy link"
                                                className="w-8 h-8 flex items-center justify-center border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/5 transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                            </button>
                                            {linkCopied && (
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-[10px] px-2 py-1 whitespace-nowrap shadow-md pointer-events-none">
                                                    Copied!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
