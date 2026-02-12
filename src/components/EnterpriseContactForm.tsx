'use client';

import React, { useState } from 'react';

export default function EnterpriseContactForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Mock server submission
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="bg-[var(--color-bg-warm)] p-12 text-center animate-fade-in">
                <h3 className="text-3xl font-serif text-[var(--color-primary)] mb-4">Request Received</h3>
                <p className="text-[var(--color-accent)] uppercase tracking-widest">We will contact you within 24 hours.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest opacity-60">Name</label>
                    <input required type="text" className="w-full bg-transparent border-b border-[var(--color-primary)] py-2 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
                </div>
                <div className="space-y-4">
                    <label className="block text-xs uppercase tracking-widest opacity-60">Company</label>
                    <input required type="text" className="w-full bg-transparent border-b border-[var(--color-primary)] py-2 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest opacity-60">Email Address (Business)</label>
                <input required type="email" className="w-full bg-transparent border-b border-[var(--color-primary)] py-2 focus:outline-none focus:border-[var(--color-accent)] transition-colors" />
            </div>

            <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest opacity-60">Gifting Requirement</label>
                <textarea required rows={4} className="w-full bg-transparent border-b border-[var(--color-primary)] py-2 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"></textarea>
            </div>

            <button disabled={status === 'submitting'} type="submit" className="px-12 py-4 bg-[var(--color-primary)] text-[var(--color-background)] uppercase tracking-[0.2em] text-xs hover:bg-[var(--color-accent)] transition-colors duration-500 disabled:opacity-50">
                {status === 'submitting' ? 'Processing...' : 'Request Consultation'}
            </button>

            <p className="text-xs opacity-40 text-center pt-8">
                Your details are treated with strict confidentiality.
            </p>
        </form>
    );
}
