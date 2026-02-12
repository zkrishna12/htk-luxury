'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import LuxuryFrame from '@/components/LuxuryFrame';
import { sendAdminNotification } from '@/lib/adminNotifications';

export default function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState('Suggestion'); // Suggestion, Appreciation, Complaint, Other
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Send admin notification
        sendAdminNotification({
            type: 'feedback',
            data: { name, email, type, message }
        });

        console.log({ name, email, type, message });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <LuxuryFrame className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-6 animate-fade-in p-8">
                    <h1 className="text-4xl font-serif text-[var(--color-primary)]">Thank You.</h1>
                    <p className="font-sans opacity-80 max-w-md mx-auto leading-relaxed">
                        Your voice matters to us. We have received your {type.toLowerCase()} and will review it with care.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 px-8 py-3 border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] transition-all uppercase tracking-widest text-xs"
                    >
                        Return Home
                    </button>
                </div>
            </LuxuryFrame>
        );
    }

    return (
        <LuxuryFrame className="pt-32 pb-24 text-[var(--color-primary)]">
            <div className="luxury-container max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center space-y-6 mb-16">
                    <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-xs">Help Us Improve</span>
                    <h1 className="text-4xl md:text-5xl font-serif">Your Feedback</h1>
                    <p className="font-sans opacity-60 leading-relaxed">
                        We are committed to perfection. Whether it is a suggestion for a new product, or feedback on your experience, we are listening.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in-up">

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-50">Your Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border-b border-[var(--color-primary)]/20 py-2 bg-transparent focus:outline-none focus:border-[var(--color-primary)] transition-colors font-serif text-lg"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-50">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full border-b border-[var(--color-primary)]/20 py-2 bg-transparent focus:outline-none focus:border-[var(--color-primary)] transition-colors font-serif text-lg"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest opacity-50">Feedback Type</label>
                        <div className="flex flex-wrap gap-4 pt-2">
                            {['Suggestion', 'Appreciation', 'Complaint', 'Other'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-6 py-2 border text-xs uppercase tracking-widest transition-all ${type === t
                                        ? 'bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)]'
                                        : 'border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest opacity-50">Your Message</label>
                        <textarea
                            required
                            rows={6}
                            className="w-full border border-[var(--color-primary)]/20 p-4 bg-transparent focus:outline-none focus:border-[var(--color-primary)] transition-colors font-sans leading-relaxed"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="text-center pt-8">
                        <button
                            type="submit"
                            className="px-12 py-4 bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 transition-all uppercase tracking-widest text-sm shadow-lg"
                        >
                            Submit Feedback
                        </button>
                    </div>

                </form>

            </div>
        </LuxuryFrame>
    );
}
