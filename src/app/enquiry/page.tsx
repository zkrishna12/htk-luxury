'use client';

import React, { useState } from 'react';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function EnquiryPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        isImport: false,
        country: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, send to backend
        console.log('Enquiry Submitted:', formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <LuxuryFrame className="pt-32 px-8 flex flex-col items-center text-center bg-[var(--color-background)]">
                <h1 className="text-4xl font-serif text-[var(--color-primary)] mb-6">Thank You.</h1>
                <p className="max-w-md font-sans opacity-80">
                    Your enquiry has been received. Our team will review your details and reach out shortly.
                </p>
                <a href="/" className="mt-8 underline hover:opacity-50">Return Home</a>
            </LuxuryFrame>
        );
    }

    return (
        <LuxuryFrame className="pt-32 pb-24 px-8 bg-[var(--color-background)] text-[var(--color-primary)]">
            <div className="luxury-container max-w-2xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-[var(--color-accent)] uppercase tracking-[0.2em] text-xs">Partner With Us</span>
                    <h1 className="text-4xl md:text-5xl font-serif">Business Enquiry</h1>
                    <p className="opacity-60 max-w-lg mx-auto">
                        Whether you are looking for bulk orders, corporate gifting, or international trade, we are here to collaborate.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in bg-white p-8 md:p-12 border border-[var(--color-primary)]/10 shadow-sm">

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-60">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full border-b border-[var(--color-primary)]/20 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest opacity-60">Phone Number</label>
                            <input
                                required
                                type="tel"
                                className="w-full border-b border-[var(--color-primary)]/20 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest opacity-60">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full border-b border-[var(--color-primary)]/20 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Import Toggle */}
                    <div className="py-4">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
                                checked={formData.isImport}
                                onChange={e => setFormData({ ...formData, isImport: e.target.checked })}
                            />
                            <span className="font-serif text-lg group-hover:opacity-80 transition-opacity">
                                I am interested in importing products to my country
                            </span>
                        </label>
                    </div>

                    {/* Conditional Country Field */}
                    {formData.isImport && (
                        <div className="space-y-2 animate-fade-in bg-[var(--color-background)] p-6 border border-[var(--color-primary)]/5">
                            <label className="text-xs uppercase tracking-widest opacity-60">Target Country for Import</label>
                            <input
                                required
                                placeholder="e.g. United Arab Emirates, USA, Japan"
                                type="text"
                                className="w-full border-b border-[var(--color-primary)]/20 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest opacity-60">Message / Requirement</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full border-b border-[var(--color-primary)]/20 py-2 focus:outline-none focus:border-[var(--color-primary)] transition-colors bg-transparent resize-none"
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] uppercase tracking-widest text-sm hover:opacity-90 transition-opacity mt-8"
                    >
                        Submit Enquiry
                    </button>

                </form>
            </div>
        </LuxuryFrame>
    );
}
