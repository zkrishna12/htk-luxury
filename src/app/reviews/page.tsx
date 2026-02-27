'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LuxuryFrame from '@/components/LuxuryFrame';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import { auth, db } from '@/lib/firebase';
import { products } from '@/lib/products';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { sendAdminNotification } from '@/lib/adminNotifications';

// ─── Seed Reviews (always displayed as fallback / base data) ─────────────────
interface Review {
    id: string | number;
    name: string;
    location: string;
    rating: number;
    date: string;
    text: string;
    productId?: string;
    productName?: string;
    userId?: string;
    createdAt?: any;
}

const seedReviews: Review[] = [
    {
        id: 'seed-1',
        name: 'Dr. Ananya Reddy',
        location: 'Hyderabad',
        rating: 5,
        date: 'Feb 14, 2025',
        text: "The Wild Forest Honey is unlike anything I've tasted in stores. You can feel the rawness and the medicinal quality. HTK has brought something truly authentic to our tables.",
        productId: 'honey-500',
        productName: 'Mountain Honey',
    },
    {
        id: 'seed-2',
        name: 'Rajesh Kumar',
        location: 'Coimbatore',
        rating: 5,
        date: 'Mar 22, 2025',
        text: "I was skeptical about the 'organic' claim until I tried the Country Sugar. It smells of the earth and molasses. My family refuses to use white sugar now.",
        productId: 'sugar-500',
        productName: 'Country Sugar (Nattu Sakkarai)',
    },
    {
        id: 'seed-3',
        name: 'Sarah Jenkins',
        location: 'Bangalore',
        rating: 4,
        date: 'Apr 10, 2025',
        text: 'Excellent packaging and delivery. The Kasturi Manjal has done wonders for my skin. Highly recommended for genuine skincare enthusiasts.',
        productId: 'manjal-100',
        productName: 'Kasturi Manjal (Wild Turmeric)',
    },
];

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function StarIcon({ filled, size = 'sm' }: { filled: boolean; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
    return (
        <svg
            className={sizes[size]}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z"
                fill={filled ? '#D4AF37' : 'none'}
                stroke={filled ? '#D4AF37' : '#1F3D2B'}
                strokeOpacity={filled ? '1' : '0.25'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <div className="flex gap-0.5 items-center">
            {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} filled={s <= Math.round(rating)} size={size} />
            ))}
        </div>
    );
}

function LeafIcon({ className }: { className?: string }) {
    return (
        <svg
            className={`w-16 h-16 ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 21C12 21 13 14 19 11C21 19 12 21 12 21ZM12 21C12 21 11 14 5 11C3 19 12 21 12 21Z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M12 21V6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function formatDate(ts: any): string {
    if (!ts) return '';
    if (typeof ts === 'string') return ts;
    const d: Date = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReviewsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>(seedReviews);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        location: '',
        rating: 5,
        text: '',
        productId: '',
    });
    const [hoverRating, setHoverRating] = useState(0);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u?.displayName) setForm((f) => ({ ...f, name: u.displayName || '' }));
        });
        return () => unsub();
    }, []);

    // Fetch Firestore reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                const firestoreReviews: Review[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Review, 'id'>),
                }));

                // Merge: Firestore reviews take priority; dedup by id
                setReviews(() => {
                    const firestoreIds = new Set(firestoreReviews.map((r) => String(r.id)));
                    const filteredSeeds = seedReviews.filter((s) => !firestoreIds.has(String(s.id)));
                    return [...firestoreReviews, ...filteredSeeds];
                });
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                // Keep seed reviews on error
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Average rating
    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        const selectedProduct = products.find((p) => p.id === form.productId);

        try {
            const docRef = await addDoc(collection(db, 'reviews'), {
                name: form.name,
                location: form.location,
                rating: form.rating,
                text: form.text,
                productId: form.productId || null,
                productName: selectedProduct?.name || null,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            // Optimistic local update
            const newReview: Review = {
                id: docRef.id,
                name: form.name,
                location: form.location,
                rating: form.rating,
                text: form.text,
                productId: form.productId || undefined,
                productName: selectedProduct?.name,
                userId: user.uid,
                date: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                }),
            };
            setReviews((prev) => [newReview, ...prev]);
            setSubmitted(true);

            // Admin notification
            sendAdminNotification({
                type: 'review',
                data: {
                    name: form.name,
                    location: form.location,
                    rating: form.rating,
                    text: form.text,
                },
            });

            setForm({ name: user.displayName || '', location: '', rating: 5, text: '', productId: '' });
            setTimeout(() => setSubmitted(false), 6000);
        } catch (err) {
            console.error('Failed to submit review:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LuxuryFrame className="pt-32 pb-24">
            <Navigation />
            <CartDrawer />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="luxury-container text-center mb-16">
                <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-xs">
                    Community Stories
                </span>
                <h1 className="text-5xl font-serif mt-6 mb-6">Voices of the Harvest</h1>
                <p className="opacity-60 max-w-2xl mx-auto leading-loose">
                    Our purity is best verified not just by labs, but by the families who welcome HTK
                    into their homes. Read their stories or share your own.
                </p>
            </section>

            {/* ── Average Rating Banner ────────────────────────────────────── */}
            <section className="luxury-container mb-16">
                <div className="flex flex-col items-center justify-center gap-3 bg-white border border-[var(--color-primary)]/8 py-10 px-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] opacity-50">Overall Rating</p>
                    <div className="flex items-baseline gap-3">
                        <span className="font-serif text-6xl text-[var(--color-primary)]">
                            {avgRating.toFixed(1)}
                        </span>
                        <span className="text-sm opacity-40">/ 5</span>
                    </div>
                    <StarRating rating={avgRating} size="lg" />
                    <p className="text-xs opacity-40 mt-1">
                        Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </section>

            {/* ── Review Grid ──────────────────────────────────────────────── */}
            <section className="luxury-container mb-24">
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/5 animate-pulse"
                            >
                                <div className="h-4 bg-[var(--color-primary)]/10 rounded w-1/3 mb-4" />
                                <div className="h-3 bg-[var(--color-primary)]/10 rounded w-1/4 mb-6" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-[var(--color-primary)]/10 rounded w-full" />
                                    <div className="h-3 bg-[var(--color-primary)]/10 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {reviews.map((review) => (
                            <div
                                key={String(review.id)}
                                className="bg-white p-8 md:p-10 shadow-sm border border-[var(--color-primary)]/5 hover:border-[var(--color-accent)]/20 transition-colors duration-300 flex flex-col"
                            >
                                {/* Header row */}
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className="font-serif text-xl text-[var(--color-primary)]">
                                            {review.name}
                                        </h3>
                                        <p className="text-xs uppercase tracking-widest opacity-40 mt-0.5">
                                            {review.location}
                                        </p>
                                    </div>
                                    <StarRating rating={review.rating} size="sm" />
                                </div>

                                {/* Review text */}
                                <p className="opacity-75 leading-relaxed italic flex-1">
                                    &ldquo;{review.text}&rdquo;
                                </p>

                                {/* Footer row */}
                                <div className="flex justify-between items-end mt-6 pt-4 border-t border-[var(--color-primary)]/5">
                                    {review.productName ? (
                                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] opacity-80">
                                            {review.productName}
                                        </span>
                                    ) : (
                                        <span />
                                    )}
                                    <p className="text-xs opacity-30">
                                        {review.date || formatDate(review.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Write a Review ────────────────────────────────────────────── */}
            <section className="max-w-2xl mx-auto px-6 md:px-8">
                <div className="bg-[var(--color-primary)] text-[var(--color-background)] p-8 md:p-12">
                    <h2 className="text-3xl font-serif text-center mb-8">Share Your Experience</h2>

                    {/* Not logged in */}
                    {!user && (
                        <div className="text-center space-y-4 py-6">
                            <p className="opacity-70 text-sm leading-relaxed">
                                Sign in to share your experience with the HTK community.
                            </p>
                            <Link
                                href="/account"
                                className="inline-block px-8 py-3 bg-[var(--color-background)] text-[var(--color-primary)] text-xs uppercase tracking-widest hover:opacity-90 transition-opacity font-medium"
                            >
                                Sign In to Write a Review
                            </Link>
                        </div>
                    )}

                    {/* Success state */}
                    {user && submitted && (
                        <div className="py-12 flex flex-col items-center animate-fade-in">
                            <span className="mb-6 text-[var(--color-accent)]">
                                <LeafIcon />
                            </span>
                            <h3 className="text-2xl font-serif mb-4">Thank you for sharing.</h3>
                            <p className="opacity-80">Your words help our community grow.</p>
                        </div>
                    )}

                    {/* Form */}
                    {user && !submitted && (
                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {/* Name + Location */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest opacity-50">
                                        Your Name
                                    </label>
                                    <input
                                        required
                                        placeholder="Full name"
                                        className="w-full bg-transparent border-b border-[var(--color-background)]/25 py-3 focus:outline-none focus:border-[var(--color-background)]/60 placeholder:text-[var(--color-background)]/35 transition-colors"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest opacity-50">
                                        City / Location
                                    </label>
                                    <input
                                        required
                                        placeholder="e.g. Chennai"
                                        className="w-full bg-transparent border-b border-[var(--color-background)]/25 py-3 focus:outline-none focus:border-[var(--color-background)]/60 placeholder:text-[var(--color-background)]/35 transition-colors"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Product */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest opacity-50">
                                    Product (optional)
                                </label>
                                <select
                                    className="w-full bg-[var(--color-primary)] border-b border-[var(--color-background)]/25 py-3 focus:outline-none focus:border-[var(--color-background)]/60 transition-colors text-[var(--color-background)] appearance-none cursor-pointer"
                                    value={form.productId}
                                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                >
                                    <option value="">— Select a product —</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Star Rating */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest opacity-50">
                                    Your Rating
                                </label>
                                <div className="flex gap-2 cursor-pointer">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isActive = star <= (hoverRating || form.rating);
                                        return (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setForm({ ...form, rating: star })}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                            >
                                                <svg
                                                    className="w-7 h-7"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z"
                                                        fill={isActive ? '#D4AF37' : 'none'}
                                                        stroke={isActive ? '#D4AF37' : 'rgba(248,246,242,0.4)'}
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        );
                                    })}
                                    <span className="self-center text-xs opacity-50 ml-2">
                                        {form.rating} / 5
                                    </span>
                                </div>
                            </div>

                            {/* Review Text */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest opacity-50">
                                    Your Review
                                </label>
                                <textarea
                                    required
                                    placeholder="Tell us about your experience with HTK products..."
                                    rows={4}
                                    className="w-full bg-transparent border-b border-[var(--color-background)]/25 py-3 focus:outline-none focus:border-[var(--color-background)]/60 placeholder:text-[var(--color-background)]/35 resize-none transition-colors"
                                    value={form.text}
                                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[var(--color-background)] text-[var(--color-primary)] uppercase tracking-widest text-xs hover:opacity-90 transition-opacity mt-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </LuxuryFrame>
    );
}
