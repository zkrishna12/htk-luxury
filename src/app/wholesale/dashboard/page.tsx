'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function WholesaleDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('htk_wholesale_auth');
        if (!auth) {
            router.push('/wholesale/login');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) return null;

    return (
        <LuxuryFrame>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="font-serif text-3xl">Distributor Dashboard</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('htk_wholesale_auth');
                            router.push('/');
                        }}
                        className="text-xs uppercase tracking-widest hover:text-red-500"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10">
                        <h2 className="font-serif text-xl mb-4">Bulk Order</h2>
                        <p className="text-sm opacity-60 mb-6">
                            Download the catalog or submit a PO directly.
                            Minimum order quantity: 50 units.
                        </p>
                        <div className="space-y-4">
                            <button className="w-full py-3 border border-[var(--color-primary)] uppercase tracking-widest text-xs hover:bg-[var(--color-primary)]/5">
                                Download Catalog (PDF)
                            </button>
                            <button className="w-full py-3 bg-[var(--color-primary)] text-white uppercase tracking-widest text-xs hover:opacity-90">
                                Upload Purchase Order
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--color-background)] p-8 border border-[var(--color-primary)]/10">
                        <h2 className="font-serif text-xl mb-4">Account Status</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-2 border-dashed border-black/10">
                                <span>Tier</span>
                                <span className="font-bold">Gold Partner</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 border-dashed border-black/10">
                                <span>Credit Limit</span>
                                <span className="font-bold">₹5,00,000</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span>Assigned Agent</span>
                                <span className="font-bold">Tanvika H.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LuxuryFrame>
    );
}
