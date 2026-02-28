'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useRewards, pointsToRupees } from '@/context/RewardsContext';
import type { RewardTier } from '@/context/RewardsContext';

// ─── Tier Config ───────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<RewardTier, {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    nextAt: number | null;
    label: string;
    discount: string;
}> = {
    Bronze: {
        color: '#92400E',
        bg: '#FEF3C7',
        border: '#D97706',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
        ),
        nextAt: 500,
        label: 'Bronze',
        discount: 'No extra discount',
    },
    Silver: {
        color: '#4B5563',
        bg: '#F9FAFB',
        border: '#9CA3AF',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
        ),
        nextAt: 1000,
        label: 'Silver',
        discount: '2% extra on all orders',
    },
    Gold: {
        color: '#D4AF37',
        bg: '#FFFBEB',
        border: '#D4AF37',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
        ),
        nextAt: 2000,
        label: 'Gold',
        discount: '5% extra on all orders',
    },
    Platinum: {
        color: '#1F3D2B',
        bg: '#F0FDF4',
        border: '#1F3D2B',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
        ),
        nextAt: null,
        label: 'Platinum',
        discount: '8% extra on all orders',
    },
};

const ALL_TIERS: RewardTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const TIER_THRESHOLDS: Record<RewardTier, number> = {
    Bronze: 0,
    Silver: 500,
    Gold: 1000,
    Platinum: 2000,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

// ─── Tier Badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: RewardTier }) {
    const cfg = TIER_CONFIG[tier];
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm"
            style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
        >
            <span style={{ color: cfg.color }}>{cfg.icon}</span>
            {cfg.label} Member
        </div>
    );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function TierProgressBar({ points, tier }: { points: number; tier: RewardTier }) {
    const cfg = TIER_CONFIG[tier];
    const currentThreshold = TIER_THRESHOLDS[tier];
    const nextThreshold = cfg.nextAt;

    if (!nextThreshold) {
        return (
            <div className="space-y-2">
                <div className="flex justify-between text-xs opacity-60">
                    <span>Platinum — Maximum tier achieved</span>
                    <span>{points.toLocaleString('en-IN')} pts</span>
                </div>
                <div className="h-3 bg-[#1F3D2B]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F3D2B] rounded-full" style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

    const progress = Math.min(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100);
    const needed = Math.max(nextThreshold - points, 0);
    const nextTier = ALL_TIERS[ALL_TIERS.indexOf(tier) + 1];

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="opacity-60">{needed > 0 ? `${needed} pts to ${nextTier}` : `${nextTier} unlocked!`}</span>
                <span className="font-medium" style={{ color: cfg.color }}>{points.toLocaleString('en-IN')} / {nextThreshold.toLocaleString('en-IN')} pts</span>
            </div>
            <div className="h-3 bg-[#1F3D2B]/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${cfg.border}, ${cfg.color})`,
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] opacity-40 uppercase tracking-wider">
                <span>{tier}</span>
                <span>{nextTier}</span>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RewardsPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { points, tier, tierDiscount, pointsHistory, isLoading } = useRewards();
    const cfg = TIER_CONFIG[tier];
    const redemptionValue = pointsToRupees(points);

    // Auth gate
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                router.push('/login');
            }
            setAuthChecked(true);
        });
        return () => unsub();
    }, [router]);

    if (!authChecked || !isLoggedIn) {
        return (
            <LuxuryFrame className="pt-32 pb-24 flex items-center justify-center min-h-screen">
                <div className="animate-pulse opacity-40 text-[var(--color-primary)] font-serif text-xl">Loading...</div>
            </LuxuryFrame>
        );
    }

    return (
        <LuxuryFrame className="pt-32 pb-24 px-4 sm:px-8 flex flex-col items-center">
            <style>{`
                @keyframes shimmer-gold {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .gold-shimmer {
                    background: linear-gradient(90deg, #D4AF37, #BFA76A, #D4AF37, #BFA76A);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer-gold 3s linear infinite;
                }
            `}</style>

            <div className="w-full max-w-4xl space-y-10 animate-fade-in text-[var(--color-primary)]">

                {/* ─── Page Header ──────────────────────────────────────────── */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-4">
                        <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-10 h-10">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-serif gold-shimmer">HTK Rewards</h1>
                    <p className="opacity-60 font-sans text-sm tracking-widest uppercase">Your Loyalty Journey</p>
                </div>

                {/* ─── Points Balance Card ───────────────────────────────────── */}
                <div className="bg-[var(--color-primary)] text-white p-8 md:p-12 rounded-sm relative overflow-hidden">
                    {/* Decorative background circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#D4AF37', transform: 'translate(30%, -30%)' }} />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10" style={{ background: '#BFA76A', transform: 'translate(-30%, 30%)' }} />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Current Balance</p>
                            <div className="flex items-end gap-3">
                                <span className="text-6xl md:text-7xl font-serif font-bold" style={{ color: '#D4AF37' }}>
                                    {isLoading ? '—' : points.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xl opacity-60 mb-3">pts</span>
                            </div>
                            {redemptionValue > 0 && (
                                <p className="text-sm opacity-80 mt-2">
                                    ≈ <span style={{ color: '#D4AF37' }} className="font-semibold">₹{redemptionValue}</span> redeemable value
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 md:text-right">
                            <TierBadge tier={tier} />
                            {tierDiscount > 0 && (
                                <p className="text-xs opacity-70">
                                    You get <span style={{ color: '#D4AF37' }} className="font-bold text-sm">{tierDiscount}% off</span> on every order
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative z-10 mt-8">
                        <TierProgressBar points={points} tier={tier} />
                    </div>
                </div>

                {/* ─── Tier Benefits ────────────────────────────────────────── */}
                <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Membership Tiers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {ALL_TIERS.map((t) => {
                            const tcfg = TIER_CONFIG[t];
                            const isActive = t === tier;
                            return (
                                <div
                                    key={t}
                                    className={`p-5 rounded-sm border-2 transition-all duration-300 ${isActive ? 'scale-105 shadow-lg' : 'opacity-70'}`}
                                    style={{
                                        borderColor: isActive ? tcfg.border : '#E5E7EB',
                                        background: isActive ? tcfg.bg : 'white',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3" style={{ color: tcfg.color }}>
                                        {tcfg.icon}
                                        <span className="font-bold text-sm">{tcfg.label}</span>
                                        {isActive && (
                                            <span className="ml-auto text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded" style={{ background: tcfg.color, color: '#fff' }}>
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs opacity-60 mb-1">
                                        {t === 'Platinum' ? '2,000+ points' : `${TIER_THRESHOLDS[t].toLocaleString('en-IN')}–${(TIER_CONFIG[t].nextAt! - 1).toLocaleString('en-IN')} points`}
                                    </p>
                                    <p className="text-xs font-medium" style={{ color: tcfg.color }}>{tcfg.discount}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── How it Works ─────────────────────────────────────────── */}
                <div className="bg-white border border-[var(--color-primary)]/10 p-8 rounded-sm space-y-6">
                    <h2 className="font-serif text-2xl">How Rewards Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#D4AF37' }}>1</div>
                            <h3 className="font-serif text-lg">Earn Points</h3>
                            <p className="text-sm opacity-60 leading-relaxed">
                                Get <strong>1 point</strong> for every <strong>₹10</strong> spent on any order.
                                A ₹550 order earns you 55 points instantly.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#BFA76A' }}>2</div>
                            <h3 className="font-serif text-lg">Climb Tiers</h3>
                            <p className="text-sm opacity-60 leading-relaxed">
                                Accumulate points to unlock <strong>Silver</strong>, <strong>Gold</strong>, and <strong>Platinum</strong> status —
                                each with increasing discounts on future orders.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#1F3D2B' }}>3</div>
                            <h3 className="font-serif text-lg">Redeem Savings</h3>
                            <p className="text-sm opacity-60 leading-relaxed">
                                Every <strong>100 points</strong> = <strong>₹10 discount</strong> at checkout.
                                Redeem from your cart whenever you have at least 100 points.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Points History ───────────────────────────────────────── */}
                <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Points History</h2>
                    {isLoading ? (
                        <div className="py-12 text-center opacity-40 animate-pulse">Loading history...</div>
                    ) : pointsHistory.length === 0 ? (
                        <div className="bg-white border border-[var(--color-primary)]/10 p-12 text-center rounded-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                            </svg>
                            <p className="font-serif text-lg opacity-60">No transactions yet</p>
                            <p className="text-sm opacity-40 mt-2">Your first purchase will earn points here.</p>
                            <a
                                href="/shop"
                                className="inline-block mt-6 border-b border-[var(--color-primary)] pb-1 uppercase tracking-widest text-xs hover:text-[#D4AF37] transition-colors"
                            >
                                Start Shopping
                            </a>
                        </div>
                    ) : (
                        <div className="bg-white border border-[var(--color-primary)]/10 rounded-sm overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b border-[var(--color-primary)]/10 bg-[var(--color-primary)]/[0.03]">
                                <div className="text-[10px] uppercase tracking-widest opacity-50">Description</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-50 text-right">Date</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-50 text-right">Points</div>
                            </div>

                            {/* Rows — newest first */}
                            <div className="divide-y divide-[var(--color-primary)]/5">
                                {[...pointsHistory].reverse().map((tx, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-[var(--color-primary)]/[0.02] transition-colors">
                                        <div>
                                            <p className="text-sm font-medium">{tx.description}</p>
                                            <p className="text-xs opacity-40 mt-0.5">Balance after: {tx.balance.toLocaleString('en-IN')} pts</p>
                                        </div>
                                        <div className="text-xs opacity-50 text-right whitespace-nowrap">
                                            {formatDate(tx.date)}
                                        </div>
                                        <div className={`font-bold text-sm text-right ${tx.points >= 0 ? 'text-[#1F3D2B]' : 'text-red-500'}`}>
                                            {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LuxuryFrame>
    );
}
