'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useRouter } from 'next/navigation';

// ─── Status Step Config ───────────────────────────────────────────────────────

const STATUS_STEPS = [
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'processing', label: 'Processing', icon: '⚙' },
    { key: 'shipped', label: 'Shipped', icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✓' },
];

function getStepIndex(status: string): number {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'out_for_delivery') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing') return 1;
    // 'paid', 'confirmed', or any other → step 0
    return 0;
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: string }) {
    const currentStep = getStepIndex(status);

    return (
        <div className="w-full py-4">
            {/* Desktop: horizontal stepper */}
            <div className="hidden sm:flex items-center w-full">
                {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isFuture = index > currentStep;

                    return (
                        <React.Fragment key={step.key}>
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 64 }}>
                                <div
                                    className={`
                                        relative flex items-center justify-center
                                        w-9 h-9 rounded-full border-2 text-sm font-bold
                                        transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                            : isCurrent
                                            ? 'border-[#D4AF37] text-[#D4AF37] bg-white'
                                            : 'border-gray-300 text-gray-300 bg-white'
                                        }
                                    `}
                                    style={isCurrent ? {
                                        boxShadow: '0 0 0 4px rgba(212,175,55,0.2)',
                                        animation: 'pulse-gold 2s ease-in-out infinite',
                                    } : undefined}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="text-xs leading-none">{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-[10px] uppercase tracking-wide text-center leading-tight
                                        ${isCompleted ? 'text-[var(--color-primary)] font-semibold' :
                                          isCurrent ? 'text-[#D4AF37] font-bold' :
                                          'text-gray-400'}
                                    `}
                                    style={{ maxWidth: 64 }}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line (not after last step) */}
                            {index < STATUS_STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-1 relative overflow-hidden" style={{ minWidth: 16 }}>
                                    <div className="absolute inset-0 bg-gray-200 rounded" />
                                    <div
                                        className="absolute inset-y-0 left-0 bg-[var(--color-primary)] rounded transition-all duration-700"
                                        style={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile: vertical stepper */}
            <div className="flex sm:hidden flex-col gap-0">
                {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.key} className="flex items-start gap-3">
                            {/* Left: circle + line */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        flex items-center justify-center
                                        w-7 h-7 rounded-full border-2 text-xs font-bold flex-shrink-0
                                        transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                            : isCurrent
                                            ? 'border-[#D4AF37] text-[#D4AF37] bg-white'
                                            : 'border-gray-300 text-gray-300 bg-white'}
                                    `}
                                    style={isCurrent ? { boxShadow: '0 0 0 3px rgba(212,175,55,0.2)', animation: 'pulse-gold 2s ease-in-out infinite' } : undefined}
                                >
                                    {isCompleted ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                {index < STATUS_STEPS.length - 1 && (
                                    <div className="w-0.5 flex-1 my-0.5" style={{ minHeight: 20 }}>
                                        <div className={`w-full h-full ${isCompleted ? 'bg-[var(--color-primary)]' : 'bg-gray-200'} rounded`} />
                                    </div>
                                )}
                            </div>

                            {/* Right: label */}
                            <div className={`pt-0.5 pb-4 text-sm ${isCompleted ? 'text-[var(--color-primary)] font-medium' : isCurrent ? 'text-[#D4AF37] font-bold' : 'text-gray-400'}`}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Timeline Log ─────────────────────────────────────────────────────────────

function StatusTimeline({ history }: { history?: Array<{ status: string; timestamp: any; note?: string }> }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3">Status History</div>
            <div className="space-y-2">
                {[...history].reverse().map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-[#D4AF37]' : 'bg-[var(--color-primary)] opacity-40'}`} />
                        <div className="flex-1">
                            <span className="font-medium capitalize">{entry.status?.replace(/_/g, ' ')}</span>
                            {entry.note && <span className="opacity-60 ml-2">— {entry.note}</span>}
                        </div>
                        <div className="opacity-40 flex-shrink-0">
                            {entry.timestamp
                                ? new Date(entry.timestamp.seconds * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                : '—'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: any }) {
    const orderId = order.paymentId || order.id;
    const truncatedId = orderId.length > 20 ? `…${orderId.slice(-16)}` : orderId;

    const createdAt = order.createdAt
        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Just now';

    const deliveryEstimate = order.deliveryEstimate
        ? (() => {
            if (order.deliveryEstimate.seconds) {
                return new Date(order.deliveryEstimate.seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            return String(order.deliveryEstimate);
        })()
        : null;

    return (
        <div className="bg-white border border-[var(--color-primary)]/10 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 bg-[var(--color-primary)]/[0.03] border-b border-[var(--color-primary)]/10">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Order ID</div>
                        <div className="font-mono text-sm text-[var(--color-primary)]" title={orderId}>{truncatedId}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Placed On</div>
                        <div className="text-sm">{createdAt}</div>
                    </div>
                    {deliveryEstimate && (
                        <div>
                            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Est. Delivery</div>
                            <div className="text-sm text-[#D4AF37] font-medium">{deliveryEstimate}</div>
                        </div>
                    )}
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Total</div>
                        <div className="font-serif text-lg text-[var(--color-primary)]">₹{order.total}</div>
                    </div>
                </div>
            </div>

            {/* Status tracker */}
            <div className="px-6 pt-5 pb-2">
                <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">Order Progress</div>
                <StatusStepper status={order.status} />
            </div>

            {/* Items list */}
            <div className="px-6 py-4 border-t border-gray-100">
                <div className="text-[10px] uppercase tracking-widest opacity-50 mb-3">Items</div>
                <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                        <div key={item.id || i} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-40" />
                                <span className="text-[var(--color-primary)]">{item.name}</span>
                                <span className="opacity-40 text-xs">× {item.quantity}</span>
                            </div>
                            <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Address */}
            {order.address && (
                <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-2 text-xs opacity-60">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                        {[order.address.line1, order.address.city, order.address.state, order.address.pincode]
                            .filter(Boolean).join(', ')}
                    </span>
                </div>
            )}

            {/* Timeline log */}
            {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="px-6 pb-5">
                    <StatusTimeline history={order.statusHistory} />
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', user.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const ordersData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Sort locally — handle pending writes (null createdAt) by treating them as 'now'
                    ordersData.sort((a: any, b: any) => {
                        const timeA = a.createdAt?.seconds || Date.now() / 1000;
                        const timeB = b.createdAt?.seconds || Date.now() / 1000;
                        return timeB - timeA;
                    });

                    setOrders(ordersData);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <LuxuryFrame className="pt-32 pb-24 px-4 sm:px-8 flex flex-col items-center">
            {/* Pulse animation for current step */}
            <style>{`
                @keyframes pulse-gold {
                    0%, 100% { box-shadow: 0 0 0 4px rgba(212,175,55,0.15); }
                    50% { box-shadow: 0 0 0 8px rgba(212,175,55,0.25); }
                }
            `}</style>

            <div className="luxury-container w-full max-w-4xl space-y-10 animate-fade-in text-[var(--color-primary)]">
                {/* Page header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-serif">Your Collection</h1>
                    <p className="opacity-60 font-sans text-sm tracking-widest uppercase">Past Harvests & Acquisitions</p>
                </div>

                {loading ? (
                    <div className="text-center py-24 opacity-60 animate-pulse">Gathering history...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 border border-[var(--color-primary)]/10 bg-[var(--color-background)] space-y-6 p-8">
                        <p className="text-xl font-serif">No archives found.</p>
                        <p className="opacity-60 max-w-md mx-auto">
                            It seems your journey has just begun.
                            If you have recently placed an order, it might be taking a moment to appear.
                        </p>
                        <a
                            href="/shop"
                            className="inline-block border-b border-[var(--color-primary)] pb-1 uppercase tracking-widest text-xs hover:text-[var(--color-accent)]"
                        >
                            Visit Collection
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </LuxuryFrame>
    );
}
