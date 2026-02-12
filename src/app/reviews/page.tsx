'use client';

import React, { useState } from 'react';
import LuxuryFrame from '@/components/LuxuryFrame';
import { sendAdminNotification } from '@/lib/adminNotifications';

// Mock initial data
const initialReviews = [
    {
        id: 1,
        name: "Dr. Ananya Reddy",
        location: "Hyderabad",
        rating: 5,
        date: "Feb 14, 2025",
        text: "The Wild Forest Honey is unlike anything I've tasted in stores. You can feel the rawness and the medicinal quality. HTK has brought something truly authentic to our tables."
    },
    {
        id: 2,
        name: "Rajesh Kumar",
        location: "Coimbatore",
        rating: 5,
        date: "Mar 22, 2025",
        text: "I was skeptical about the 'organic' claim until I tried the Country Sugar. It smells of the earth and molasses. My family refuses to use white sugar now."
    },
    {
        id: 3,
        name: "Sarah Jenkins",
        location: "Bangalore",
        rating: 4,
        date: "Apr 10, 2025",
        text: "Excellent packaging and delivery. The Kasturi Manjal has done wonders for my skin. Highly recommended for genuine skincare enthusiasts."
    }
];

function StarIcon({ className }: { className?: string }) {
    return (
        <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LeafIcon({ className }: { className?: string }) {
    return (
        <svg className={`w-16 h-16 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C12 21 13 14 19 11C21 19 12 21 12 21ZM12 21C12 21 11 14 5 11C3 19 12 21 12 21Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 21V6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState(initialReviews);
    const [form, setForm] = useState({ name: '', location: '', text: '', rating: 5 });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        const newReview = {
            id: Date.now(),
            name: form.name,
            location: form.location,
            rating: form.rating,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            text: form.text
        };

        setReviews([newReview, ...reviews]);
        setSubmitted(true);

        // Send admin notification
        sendAdminNotification({
            type: 'review',
            data: {
                name: form.name,
                location: form.location,
                rating: form.rating,
                text: form.text
            }
        });

        setForm({ name: '', location: '', text: '', rating: 5 });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <LuxuryFrame className="pt-32 pb-24">

            {/* Hero */}
            <section className="luxury-container text-center mb-24">
                <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-xs">Community Stories</span>
                <h1 className="text-5xl font-serif mt-6 mb-6">Voices of the Harvest</h1>
                <p className="opacity-60 max-w-2xl mx-auto leading-loose">
                    Our purity is best verified not just by labs, but by the families who welcome
                    HTK into their homes. Read their stories or share your own.
                </p>
            </section>

            {/* Review Grid */}
            <section className="luxury-container grid md:grid-cols-2 gap-8 mb-24">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-8 md:p-12 shadow-sm border border-[var(--color-primary)]/5">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-serif text-xl">{review.name}</h3>
                                <p className="text-xs uppercase tracking-widest opacity-40">{review.location}</p>
                            </div>
                            <div className="flex gap-1 text-[var(--color-accent)]">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20'}>
                                        <StarIcon />
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="opacity-80 leading-relaxed italic">"{review.text}"</p>
                        <p className="text-xs opacity-30 mt-6 text-right">{review.date}</p>
                    </div>
                ))}
            </section>

            {/* Submission Form */}
            <section className="max-w-2xl mx-auto px-8">
                <div className="bg-[var(--color-primary)] text-[var(--color-background)] p-8 md:p-12 text-center space-y-8">
                    <h2 className="text-3xl font-serif">Share Your Experience</h2>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="grid md:grid-cols-2 gap-6">
                                <input
                                    required
                                    placeholder="Your Name"
                                    className="w-full bg-transparent border-b border-[var(--color-background)]/20 py-4 focus:outline-none placeholder:text-[var(--color-background)]/40"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                                <input
                                    required
                                    placeholder="City / Location"
                                    className="w-full bg-transparent border-b border-[var(--color-background)]/20 py-4 focus:outline-none placeholder:text-[var(--color-background)]/40"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest opacity-60">Rating</label>
                                <div className="flex gap-4 text-2xl cursor-pointer">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setForm({ ...form, rating: star })}
                                            className={`${star <= form.rating ? 'opacity-100' : 'opacity-20'} transition-opacity hover:opacity-100`}
                                        >
                                            <StarIcon className="w-6 h-6" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                required
                                placeholder="Tell us about your experience..."
                                rows={4}
                                className="w-full bg-transparent border-b border-[var(--color-background)]/20 py-4 focus:outline-none placeholder:text-[var(--color-background)]/40 resize-none"
                                value={form.text}
                                onChange={e => setForm({ ...form, text: e.target.value })}
                            />

                            <button type="submit" className="w-full py-4 bg-[var(--color-background)] text-[var(--color-primary)] uppercase tracking-widest text-xs hover:opacity-90 mt-4">
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="py-12 animate-fade-in flex flex-col items-center">
                            <span className="mb-6 text-[var(--color-accent)]"><LeafIcon /></span>
                            <h3 className="text-2xl font-serif mb-4">Thank you for sharing.</h3>
                            <p className="opacity-80">Your words help our community grow.</p>
                        </div>
                    )}
                </div>
            </section>

        </LuxuryFrame>
    );
}
