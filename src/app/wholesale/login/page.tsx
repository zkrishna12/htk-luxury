'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function WholesaleLogin() {
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'HTKWHOLESALE') { // Simple gate for MVP
            // In real app, use Auth or backend cookie
            localStorage.setItem('htk_wholesale_auth', 'true');
            router.push('/wholesale/dashboard');
        } else {
            alert("Invalid Access Code");
        }
    };

    return (
        <LuxuryFrame>
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    <h1 className="font-serif text-3xl">Wholesale Partner Portal</h1>
                    <p className="font-sans text-sm opacity-60">Authorized Distributors Only.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="ACCESS CODE"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border border-[var(--color-primary)]/20 text-center tracking-[0.2em] focus:outline-none"
                        />
                        <button type="submit" className="w-full bg-[var(--color-primary)] text-white py-4 uppercase tracking-widest text-xs hover:opacity-90">
                            Enter Portal
                        </button>
                    </form>
                </div>
            </div>
        </LuxuryFrame>
    );
}
