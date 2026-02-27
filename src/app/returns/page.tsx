'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

const RETURN_REASONS = [
    'Damaged Product',
    'Wrong Item Received',
    'Quality Issue',
    'Changed My Mind',
    'Other',
] as const;

type ReturnStatus = 'pending' | 'under_review' | 'approved' | 'refund_processed';

const STATUS_STEPS: { key: ReturnStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'refund_processed', label: 'Refund Processed' },
];

function PolicyCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="flex gap-4 p-5 border border-[#1F3D2B]/10 bg-white/60">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-[#1F3D2B]/5 text-[#D4AF37]">
                {icon}
            </div>
            <div>
                <h4 className="font-serif text-[#1F3D2B] text-sm font-semibold mb-1">{title}</h4>
                <p className="text-xs text-[#1F3D2B]/70 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

export default function ReturnsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Form state
    const [orderId, setOrderId] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [photoDescription, setPhotoDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    // Status checker state
    const [statusOrderId, setStatusOrderId] = useState('');
    const [statusResult, setStatusResult] = useState<{ status: ReturnStatus; createdAt?: any; reason?: string } | null>(null);
    const [statusNotFound, setStatusNotFound] = useState(false);
    const [statusChecking, setStatusChecking] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
            // Pre-fill phone from displayName isn't possible, leave it blank
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!orderId.trim()) { setFormError('Please enter your Order ID or Payment ID.'); return; }
        if (!reason) { setFormError('Please select a reason for return.'); return; }
        if (!description.trim()) { setFormError('Please provide a description.'); return; }
        if (!phone.trim()) { setFormError('Please enter your contact phone number.'); return; }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'return_requests'), {
                orderId: orderId.trim(),
                reason,
                description: description.trim(),
                photoDescription: photoDescription.trim(),
                phone: phone.trim(),
                userId: user!.uid,
                email: user!.email,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit return request:', err);
            setFormError('Submission failed. Please try again or contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusOrderId.trim()) return;

        setStatusResult(null);
        setStatusNotFound(false);
        setStatusChecking(true);

        try {
            const q = query(
                collection(db, 'return_requests'),
                where('orderId', '==', statusOrderId.trim())
            );
            const snap = await getDocs(q);
            if (snap.empty) {
                setStatusNotFound(true);
            } else {
                const data = snap.docs[0].data();
                setStatusResult({
                    status: data.status as ReturnStatus,
                    createdAt: data.createdAt,
                    reason: data.reason,
                });
            }
        } catch (err) {
            console.error('Status check failed:', err);
            setStatusNotFound(true);
        } finally {
            setStatusChecking(false);
        }
    };

    const activeStep = statusResult
        ? STATUS_STEPS.findIndex((s) => s.key === statusResult.status)
        : -1;

    return (
        <>
            <Navigation />
            <CartDrawer />

            <main className="bg-[#F8F6F2] min-h-screen text-[#1F3D2B] pt-28 pb-24">
                <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-20">

                    {/* Page Header */}
                    <div className="text-center space-y-5 animate-fade-in">
                        <span className="text-[#BFA76A] uppercase tracking-[0.3em] text-xs font-medium">
                            Customer Care
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-[#1F3D2B] leading-tight">
                            Returns &amp; Refunds
                        </h1>
                        <div className="w-12 h-px bg-[#D4AF37] mx-auto" />
                        <p className="text-sm text-[#1F3D2B]/60 max-w-xl mx-auto leading-relaxed">
                            We stand behind the quality of every product. If something isn&apos;t right, we&apos;re here to make it right.
                        </p>
                    </div>

                    {/* ── Section 1: Return Policy ── */}
                    <LuxuryFrame className="p-8 md:p-12 space-y-8">
                        <div className="space-y-2">
                            <span className="text-[#BFA76A] uppercase tracking-[0.25em] text-[10px] font-semibold">
                                Our Policy
                            </span>
                            <h2 className="text-2xl md:text-3xl font-serif text-[#1F3D2B]">Return Policy</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                }
                                title="7-Day Return Window"
                                text="Returns are accepted within 7 days of delivery. Please initiate your request promptly after receiving your order."
                            />
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                }
                                title="Original Packaging Required"
                                text="Products must be unopened and returned in their original, undamaged packaging for a return to be accepted."
                            />
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                }
                                title="Perishable Items"
                                text="Honey, country sugar, and other perishable goods can only be returned if they arrive damaged or defective — not for change of mind."
                            />
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 12 20 22 4 22 4 12" />
                                        <rect x="2" y="7" width="20" height="5" />
                                        <line x1="12" y1="22" x2="12" y2="7" />
                                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                                    </svg>
                                }
                                title="Free Returns for Defects"
                                text="If your product is defective or damaged in transit, we cover all return shipping costs. No questions asked."
                            />
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                }
                                title="Refund Timeline"
                                text="Approved refunds are processed within 5–7 business days to your original payment method (UPI, card, or bank account)."
                            />
                            <PolicyCard
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.72 6.72l1.72-1.71a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                }
                                title="We'll Contact You"
                                text="Once you submit a request, our team will reach out within 24 hours to guide you through the return process."
                            />
                        </div>

                        <div className="border-t border-[#1F3D2B]/10 pt-6 text-xs text-[#1F3D2B]/50 leading-relaxed">
                            For urgent matters, contact us at{' '}
                            <a href="mailto:support@htkenterprises.net" className="text-[#BFA76A] hover:underline">
                                support@htkenterprises.net
                            </a>{' '}
                            or WhatsApp us at <span className="text-[#1F3D2B]/70">8438380900</span>.
                        </div>
                    </LuxuryFrame>

                    {/* ── Section 2: Return Request Form ── */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-[#BFA76A] uppercase tracking-[0.25em] text-[10px] font-semibold">
                                Submit a Request
                            </span>
                            <h2 className="text-2xl md:text-3xl font-serif text-[#1F3D2B]">Request a Return</h2>
                        </div>

                        {authLoading ? (
                            <div className="py-16 flex justify-center">
                                <div className="w-6 h-6 border-2 border-[#1F3D2B]/20 border-t-[#1F3D2B] rounded-full animate-spin" />
                            </div>
                        ) : !user ? (
                            <LuxuryFrame className="p-10 text-center space-y-5">
                                <div className="w-14 h-14 mx-auto flex items-center justify-center bg-[#1F3D2B]/5 border border-[#1F3D2B]/10">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F3D2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <h3 className="font-serif text-xl text-[#1F3D2B]">Sign In Required</h3>
                                <p className="text-sm text-[#1F3D2B]/60 max-w-sm mx-auto leading-relaxed">
                                    Please sign in to your account to submit a return request. This allows us to verify your order and process your refund securely.
                                </p>
                                <a
                                    href="/login"
                                    className="inline-block px-8 py-3 bg-[#1F3D2B] text-[#F8F6F2] text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                                >
                                    Sign In to Continue
                                </a>
                            </LuxuryFrame>
                        ) : submitted ? (
                            <LuxuryFrame className="p-10 text-center space-y-5 animate-fade-in">
                                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-[#1F3D2B]/8 border border-[#D4AF37]/40">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 className="font-serif text-2xl text-[#1F3D2B]">Request Submitted</h3>
                                <p className="text-sm text-[#1F3D2B]/70 max-w-md mx-auto leading-relaxed">
                                    Your return request has been submitted. We&apos;ll contact you within 24 hours.
                                </p>
                                <p className="text-xs text-[#BFA76A]">
                                    Reference Order ID: <span className="font-mono font-semibold">{orderId}</span>
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setOrderId('');
                                        setReason('');
                                        setDescription('');
                                        setPhotoDescription('');
                                        setPhone('');
                                    }}
                                    className="text-xs text-[#1F3D2B]/50 hover:text-[#1F3D2B] underline transition-colors"
                                >
                                    Submit another request
                                </button>
                            </LuxuryFrame>
                        ) : (
                            <LuxuryFrame className="p-8 md:p-12">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Signed in as */}
                                    <div className="flex items-center gap-2 text-xs text-[#1F3D2B]/50 bg-[#1F3D2B]/3 border border-[#1F3D2B]/8 px-4 py-3">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Submitting as <span className="font-medium text-[#1F3D2B]/80">{user.email}</span>
                                    </div>

                                    {/* Order ID */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
                                            Order ID / Payment ID <span className="text-[#D4AF37]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={orderId}
                                            onChange={(e) => setOrderId(e.target.value)}
                                            placeholder="e.g. HTK-2024-00123 or pay_XXXXXXXXXX"
                                            className="w-full border border-[#1F3D2B]/20 bg-white/80 px-4 py-3 text-sm text-[#1F3D2B] placeholder-[#1F3D2B]/30 focus:outline-none focus:border-[#1F3D2B]/60 transition-colors"
                                        />
                                    </div>

                                    {/* Reason */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
                                            Reason for Return <span className="text-[#D4AF37]">*</span>
                                        </label>
                                        <select
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full border border-[#1F3D2B]/20 bg-white/80 px-4 py-3 text-sm text-[#1F3D2B] focus:outline-none focus:border-[#1F3D2B]/60 transition-colors appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231F3D2B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                        >
                                            <option value="">Select a reason…</option>
                                            {RETURN_REASONS.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
                                            Description <span className="text-[#D4AF37]">*</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Please describe the issue in detail — what was wrong, when you noticed it, etc."
                                            rows={4}
                                            className="w-full border border-[#1F3D2B]/20 bg-white/80 px-4 py-3 text-sm text-[#1F3D2B] placeholder-[#1F3D2B]/30 focus:outline-none focus:border-[#1F3D2B]/60 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Photo Description */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
                                            Photo Description
                                            <span className="ml-2 text-[10px] font-normal normal-case text-[#1F3D2B]/40">(Optional — describe what you would attach)</span>
                                        </label>
                                        <div className="border border-dashed border-[#1F3D2B]/25 bg-[#1F3D2B]/2 p-5 space-y-3">
                                            <div className="flex items-center gap-2 text-[#1F3D2B]/40">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span className="text-xs">Describe your photo evidence</span>
                                            </div>
                                            <textarea
                                                value={photoDescription}
                                                onChange={(e) => setPhotoDescription(e.target.value)}
                                                placeholder="e.g. Photo of the damaged packaging seal, photo showing the wrong product label, etc."
                                                rows={2}
                                                className="w-full bg-transparent text-sm text-[#1F3D2B] placeholder-[#1F3D2B]/30 focus:outline-none resize-none"
                                            />
                                            <p className="text-[10px] text-[#1F3D2B]/35">
                                                You can email photos to{' '}
                                                <a href="mailto:support@htkenterprises.net" className="text-[#BFA76A] hover:underline">
                                                    support@htkenterprises.net
                                                </a>{' '}
                                                with your Order ID in the subject line.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
                                            Contact Phone Number <span className="text-[#D4AF37]">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. +91 98765 43210"
                                            className="w-full border border-[#1F3D2B]/20 bg-white/80 px-4 py-3 text-sm text-[#1F3D2B] placeholder-[#1F3D2B]/30 focus:outline-none focus:border-[#1F3D2B]/60 transition-colors"
                                        />
                                    </div>

                                    {/* Error */}
                                    {formError && (
                                        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-4 py-3">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            {formError}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-[#1F3D2B] text-[#F8F6F2] text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-[#F8F6F2]/30 border-t-[#F8F6F2] rounded-full animate-spin" />
                                                Submitting…
                                            </span>
                                        ) : (
                                            'Submit Return Request'
                                        )}
                                    </button>
                                </form>
                            </LuxuryFrame>
                        )}
                    </div>

                    {/* ── Section 3: Return Status Checker ── */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-[#BFA76A] uppercase tracking-[0.25em] text-[10px] font-semibold">
                                Track Your Request
                            </span>
                            <h2 className="text-2xl md:text-3xl font-serif text-[#1F3D2B]">Check Return Status</h2>
                        </div>

                        <LuxuryFrame className="p-8 md:p-12 space-y-8">
                            <form onSubmit={handleStatusCheck} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={statusOrderId}
                                    onChange={(e) => {
                                        setStatusOrderId(e.target.value);
                                        setStatusResult(null);
                                        setStatusNotFound(false);
                                    }}
                                    placeholder="Enter your Order ID or Payment ID"
                                    className="flex-1 border border-[#1F3D2B]/20 bg-white/80 px-4 py-3 text-sm text-[#1F3D2B] placeholder-[#1F3D2B]/30 focus:outline-none focus:border-[#1F3D2B]/60 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={statusChecking || !statusOrderId.trim()}
                                    className="shrink-0 px-8 py-3 bg-[#1F3D2B] text-[#F8F6F2] text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {statusChecking ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-3.5 h-3.5 border-2 border-[#F8F6F2]/30 border-t-[#F8F6F2] rounded-full animate-spin" />
                                            Checking
                                        </span>
                                    ) : (
                                        'Check Status'
                                    )}
                                </button>
                            </form>

                            {/* Not Found */}
                            {statusNotFound && (
                                <div className="flex items-center gap-3 text-sm text-[#1F3D2B]/60 border border-[#1F3D2B]/10 bg-[#1F3D2B]/3 px-5 py-4 animate-fade-in">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    No return request found for that Order ID. Please double-check the ID or contact us at{' '}
                                    <a href="mailto:support@htkenterprises.net" className="text-[#BFA76A] hover:underline">
                                        support@htkenterprises.net
                                    </a>.
                                </div>
                            )}

                            {/* Status Found */}
                            {statusResult && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-xs text-[#1F3D2B]/50 flex items-center gap-2">
                                        <span>Order ID:</span>
                                        <span className="font-mono font-semibold text-[#1F3D2B]/80">{statusOrderId}</span>
                                        {statusResult.reason && (
                                            <>
                                                <span className="text-[#1F3D2B]/20">|</span>
                                                <span>Reason: {statusResult.reason}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Progress Stepper */}
                                    <div className="relative">
                                        {/* Connecting line */}
                                        <div className="absolute top-5 left-5 right-5 h-px bg-[#1F3D2B]/10" />
                                        <div
                                            className="absolute top-5 left-5 h-px bg-[#D4AF37] transition-all duration-700"
                                            style={{
                                                width: activeStep === 0 ? '0%'
                                                    : activeStep === 1 ? '33.3%'
                                                    : activeStep === 2 ? '66.6%'
                                                    : activeStep === 3 ? '100%' : '0%',
                                                right: 'auto',
                                            }}
                                        />

                                        <div className="relative grid grid-cols-4 gap-2">
                                            {STATUS_STEPS.map((step, i) => {
                                                const isActive = i === activeStep;
                                                const isDone = i < activeStep;
                                                return (
                                                    <div key={step.key} className="flex flex-col items-center gap-2 text-center">
                                                        <div
                                                            className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${
                                                                isDone
                                                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                                                                    : isActive
                                                                    ? 'bg-[#1F3D2B] border-[#1F3D2B] text-[#D4AF37]'
                                                                    : 'bg-white border-[#1F3D2B]/15 text-[#1F3D2B]/25'
                                                            }`}
                                                        >
                                                            {isDone ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            ) : (
                                                                <span className="text-xs font-bold">{i + 1}</span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] leading-tight font-medium uppercase tracking-wide ${isActive ? 'text-[#1F3D2B]' : isDone ? 'text-[#D4AF37]' : 'text-[#1F3D2B]/30'}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Current status message */}
                                    <div className="border-l-2 border-[#D4AF37] pl-4 space-y-1">
                                        <p className="text-sm font-serif text-[#1F3D2B]">
                                            {statusResult.status === 'pending' && 'Your request has been received and is awaiting review.'}
                                            {statusResult.status === 'under_review' && 'Our team is currently reviewing your return request.'}
                                            {statusResult.status === 'approved' && 'Your return has been approved. Please follow the instructions provided by our team.'}
                                            {statusResult.status === 'refund_processed' && 'Your refund has been processed and will appear in your account within 5–7 business days.'}
                                        </p>
                                        <p className="text-xs text-[#1F3D2B]/40">
                                            Questions? Reach us at{' '}
                                            <a href="mailto:support@htkenterprises.net" className="text-[#BFA76A] hover:underline">
                                                support@htkenterprises.net
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </LuxuryFrame>
                    </div>

                </div>
            </main>
        </>
    );
}
