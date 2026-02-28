'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PointTransaction {
    date: string;           // ISO string
    description: string;
    points: number;         // positive = earned, negative = redeemed
    balance: number;        // balance after this transaction
}

export type RewardTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface RewardsContextType {
    points: number;
    tier: RewardTier;
    tierDiscount: number;           // percentage, e.g. 5 = 5%
    pointsHistory: PointTransaction[];
    addPoints: (amount: number, description: string) => Promise<void>;
    redeemPoints: (pointsToRedeem: number) => Promise<boolean>;
    canRedeem: (pointsToRedeem: number) => boolean;
    pointsValue: (pts: number) => number; // convert pts to ₹ discount
    isLoading: boolean;
}

// ─── Tier helpers ──────────────────────────────────────────────────────────────

function getTier(points: number): RewardTier {
    if (points >= 2000) return 'Platinum';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
}

function getTierDiscount(tier: RewardTier): number {
    switch (tier) {
        case 'Platinum': return 8;
        case 'Gold':     return 5;
        case 'Silver':   return 2;
        default:         return 0;
    }
}

// 100 points = ₹10 discount
export function pointsToRupees(pts: number): number {
    return Math.floor(pts / 100) * 10;
}

// ₹10 spent = 1 point  (1 point per ₹10)
export function rupeesToPoints(amount: number): number {
    return Math.floor(amount / 10);
}

// ─── Context ───────────────────────────────────────────────────────────────────

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

const REWARDS_DOC = (uid: string) => doc(db, 'users', uid, 'rewards', 'main');

export function RewardsProvider({ children }: { children: React.ReactNode }) {
    const [points, setPoints] = useState(0);
    const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const tier = getTier(points);
    const tierDiscount = getTierDiscount(tier);

    // ── Auth listener ──────────────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setPoints(0);
                setPointsHistory([]);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // ── Firestore real-time sync ────────────────────────────────────────────────
    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);
        const rewardsRef = REWARDS_DOC(userId);
        const unsub = onSnapshot(rewardsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setPoints(data.points ?? 0);
                setPointsHistory(data.history ?? []);
            } else {
                // First-time user — initialise doc
                setDoc(rewardsRef, {
                    points: 0,
                    tier: 'Bronze',
                    history: [],
                    createdAt: new Date().toISOString(),
                }, { merge: true }).catch(console.error);
                setPoints(0);
                setPointsHistory([]);
            }
            setIsLoading(false);
        }, (err) => {
            console.error('RewardsContext: Firestore error', err);
            setIsLoading(false);
        });

        return () => unsub();
    }, [userId]);

    // ── addPoints ────────────────────────────────────────────────────────────────
    const addPoints = useCallback(async (amount: number, description: string) => {
        if (!userId || amount <= 0) return;

        const newBalance = points + amount;
        const newTier = getTier(newBalance);
        const transaction: PointTransaction = {
            date: new Date().toISOString(),
            description,
            points: amount,
            balance: newBalance,
        };

        try {
            await setDoc(
                REWARDS_DOC(userId),
                {
                    points: newBalance,
                    tier: newTier,
                    history: arrayUnion(transaction),
                },
                { merge: true }
            );
        } catch (err) {
            console.error('RewardsContext: addPoints failed', err);
        }
    }, [userId, points]);

    // ── redeemPoints ─────────────────────────────────────────────────────────────
    const redeemPoints = useCallback(async (pointsToRedeem: number): Promise<boolean> => {
        if (!userId || pointsToRedeem <= 0 || points < pointsToRedeem) return false;

        const newBalance = points - pointsToRedeem;
        const newTier = getTier(newBalance);
        const discount = pointsToRupees(pointsToRedeem);
        const transaction: PointTransaction = {
            date: new Date().toISOString(),
            description: `Redeemed for ₹${discount} discount`,
            points: -pointsToRedeem,
            balance: newBalance,
        };

        try {
            await setDoc(
                REWARDS_DOC(userId),
                {
                    points: newBalance,
                    tier: newTier,
                    history: arrayUnion(transaction),
                },
                { merge: true }
            );
            return true;
        } catch (err) {
            console.error('RewardsContext: redeemPoints failed', err);
            return false;
        }
    }, [userId, points]);

    // ── canRedeem ─────────────────────────────────────────────────────────────────
    const canRedeem = useCallback((pointsToRedeem: number): boolean => {
        return !!userId && points >= pointsToRedeem && pointsToRedeem >= 100;
    }, [userId, points]);

    // ── pointsValue ───────────────────────────────────────────────────────────────
    const pointsValue = useCallback((pts: number): number => {
        return pointsToRupees(pts);
    }, []);

    return (
        <RewardsContext.Provider
            value={{
                points,
                tier,
                tierDiscount,
                pointsHistory,
                addPoints,
                redeemPoints,
                canRedeem,
                pointsValue,
                isLoading,
            }}
        >
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    const context = useContext(RewardsContext);
    if (context === undefined) {
        throw new Error('useRewards must be used within a RewardsProvider');
    }
    return context;
}
