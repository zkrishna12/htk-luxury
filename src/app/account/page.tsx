'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';
import { auth, db } from '@/lib/firebase';
import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    User,
    deleteUser,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs,
} from 'firebase/firestore';
import { useRewards } from '@/context/RewardsContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

// ─── Quick Links Config ───────────────────────────────────────────────────────

const QUICK_LINKS = [
    {
        label: 'My Orders',
        href: '/orders',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
            </svg>
        ),
        desc: 'Track & manage your purchases',
    },
    {
        label: 'My Wishlist',
        href: '/wishlist',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
        desc: 'Your saved products',
    },
    {
        label: 'My Rewards',
        href: '/rewards',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
        ),
        desc: 'Points & tier benefits',
        showRewards: true,
    },
    {
        label: 'My Reviews',
        href: '/reviews',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
        desc: 'Your product reviews',
    },
    {
        label: 'Returns & Refunds',
        href: '/returns',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
        ),
        desc: 'Manage returns & refunds',
    },
];

// ─── Tier badge colour ────────────────────────────────────────────────────────

function tierColor(tier: string) {
    switch (tier) {
        case 'Platinum': return 'text-[#A8D8EA] border-[#A8D8EA]/40 bg-[#A8D8EA]/10';
        case 'Gold':     return 'text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10';
        case 'Silver':   return 'text-slate-400 border-slate-300/40 bg-slate-100/30';
        default:         return 'text-[#CD7F32] border-[#CD7F32]/40 bg-[#CD7F32]/10';
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountPage() {
    const router = useRouter();
    const { points, tier } = useRewards();

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Profile edit
    const [editingProfile, setEditingProfile] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Address
    const [address, setAddress] = useState<Address | null>(null);
    const [addrLoading, setAddrLoading] = useState(false);
    const [editingAddr, setEditingAddr] = useState(false);
    const [addrForm, setAddrForm] = useState<Address>({
        line1: '', line2: '', city: '', state: '', pincode: '', country: 'India',
    });
    const [addrSaving, setAddrSaving] = useState(false);
    const [addrMsg, setAddrMsg] = useState('');

    // Delete account
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    // ── Auth listener ─────────────────────────────────────────────────────────
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.replace('/login');
            } else {
                setUser(u);
                setDisplayName(u.displayName || '');
            }
            setAuthLoading(false);
        });
        return () => unsub();
    }, [router]);

    // ── Fetch Address ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setAddrLoading(true);
            try {
                const snap = await getDoc(doc(db, 'users', user.uid, 'addresses', 'default'));
                if (snap.exists()) {
                    const data = snap.data() as Address;
                    setAddress(data);
                    setAddrForm(data);
                } else {
                    setAddress(null);
                }
            } catch (err) {
                console.error('Failed to load address:', err);
            } finally {
                setAddrLoading(false);
            }
        };
        load();
    }, [user]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSaveProfile = async () => {
        if (!user) return;
        setProfileSaving(true);
        setProfileMsg('');
        try {
            await updateProfile(user, { displayName: displayName.trim() || null });
            setProfileMsg('Profile updated successfully.');
            setEditingProfile(false);
        } catch (err: any) {
            setProfileMsg(err.message || 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!user) return;
        setAddrSaving(true);
        setAddrMsg('');
        try {
            await setDoc(doc(db, 'users', user.uid, 'addresses', 'default'), addrForm);
            setAddress({ ...addrForm });
            setAddrMsg('Address saved.');
            setEditingAddr(false);
        } catch (err: any) {
            setAddrMsg(err.message || 'Failed to save address.');
        } finally {
            setAddrSaving(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'addresses', 'default'));
            setAddress(null);
            setAddrForm({ line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
            setAddrMsg('Address removed.');
        } catch (err: any) {
            setAddrMsg(err.message || 'Failed to delete address.');
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmText !== 'DELETE') return;
        setDeleting(true);
        try {
            // Delete Firestore subcollections (best-effort)
            try {
                const subColls = ['addresses', 'rewards'];
                for (const col of subColls) {
                    const colRef = collection(db, 'users', user.uid, col);
                    const snap = await getDocs(colRef);
                    for (const d of snap.docs) {
                        await deleteDoc(d.ref);
                    }
                }
                // Delete user doc
                await deleteDoc(doc(db, 'users', user.uid));
            } catch {
                // Non-blocking
            }
            await deleteUser(user);
            router.push('/');
        } catch (err: any) {
            alert(err.message || 'Failed to delete account. You may need to re-login.');
        } finally {
            setDeleting(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
          })
        : null;

    const providers = user?.providerData?.map((p) => p.providerId) ?? [];
    const providerLabels: Record<string, string> = {
        'google.com': 'Google',
        'phone': 'Phone',
        'password': 'Email',
        'github.com': 'GitHub',
    };

    const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase();

    // ── Loading ───────────────────────────────────────────────────────────────

    if (authLoading) {
        return (
            <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24 min-h-screen flex items-center justify-center">
                <Navigation />
                <CartDrawer />
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
                    <p className="text-sm opacity-50">Loading account…</p>
                </div>
            </LuxuryFrame>
        );
    }

    if (!user) return null;

    return (
        <LuxuryFrame className="text-[var(--color-primary)] pt-28 pb-24">
            <Navigation />
            <CartDrawer />

            <div className="luxury-container max-w-3xl mx-auto space-y-10">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="text-center space-y-2 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-accent)]">Your Account</p>
                    <h1 className="font-serif text-4xl md:text-5xl">My Profile</h1>
                </div>

                {/* ╔══════════════════════════════════════════════════════════╗
                    ║  SECTION 1: Profile Info                                 ║
                    ╚══════════════════════════════════════════════════════════╝ */}
                <section className="bg-white border border-[var(--color-primary)]/8 p-8 space-y-6">

                    {/* Avatar + Basic Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Circle Avatar */}
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif text-white shrink-0 shadow-md"
                            style={{ background: '#D4AF37' }}
                        >
                            {avatarLetter}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-1">
                            <h2 className="font-serif text-2xl text-[var(--color-primary)]">
                                {user.displayName || 'Member'}
                            </h2>
                            <p className="text-sm opacity-60">{user.email}</p>
                            {user.phoneNumber && (
                                <p className="text-sm opacity-60">{user.phoneNumber}</p>
                            )}
                            {memberSince && (
                                <p className="text-[11px] opacity-40 mt-1">Member since {memberSince}</p>
                            )}

                            {/* Provider Badges */}
                            <div className="flex gap-2 flex-wrap justify-center sm:justify-start pt-1">
                                {providers.map((pid) => (
                                    <span
                                        key={pid}
                                        className="text-[10px] px-2.5 py-0.5 border border-[var(--color-accent)]/40 text-[var(--color-accent)] bg-[var(--color-accent)]/8 font-medium uppercase tracking-wider"
                                    >
                                        {providerLabels[pid] || pid}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Edit Toggle */}
                        <button
                            onClick={() => {
                                setEditingProfile(!editingProfile);
                                setProfileMsg('');
                                setDisplayName(user.displayName || '');
                            }}
                            className="shrink-0 text-xs font-medium border border-[var(--color-primary)]/25 px-4 py-2 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                        >
                            {editingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {/* Inline Edit Form */}
                    {editingProfile && (
                        <div className="border-t border-[var(--color-primary)]/8 pt-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider opacity-50 font-medium">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-4 py-2.5 border border-[var(--color-primary)]/15 bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)]/40 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Email (read-only)</label>
                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        readOnly
                                        className="w-full px-4 py-2.5 border border-[var(--color-primary)]/10 bg-[var(--color-primary)]/3 text-sm opacity-50 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider opacity-50 font-medium">Phone (read-only)</label>
                                    <input
                                        type="text"
                                        value={user.phoneNumber || 'Not linked'}
                                        readOnly
                                        className="w-full px-4 py-2.5 border border-[var(--color-primary)]/10 bg-[var(--color-primary)]/3 text-sm opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            {profileMsg && (
                                <p className={`text-xs ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {profileMsg}
                                </p>
                            )}
                            <button
                                onClick={handleSaveProfile}
                                disabled={profileSaving}
                                className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {profileSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {profileMsg && !editingProfile && (
                        <p className={`text-xs ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                            {profileMsg}
                        </p>
                    )}
                </section>

                {/* ╔══════════════════════════════════════════════════════════╗
                    ║  SECTION 2: Saved Addresses                              ║
                    ╚══════════════════════════════════════════════════════════╝ */}
                <section className="bg-white border border-[var(--color-primary)]/8 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif text-xl text-[var(--color-primary)]">Saved Address</h2>
                        {!editingAddr && (
                            <button
                                onClick={() => {
                                    setEditingAddr(true);
                                    setAddrMsg('');
                                    if (address) setAddrForm(address);
                                }}
                                className="text-xs font-medium border border-[var(--color-primary)]/25 px-4 py-2 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                            >
                                {address ? 'Edit Address' : 'Add Address'}
                            </button>
                        )}
                    </div>

                    {addrLoading ? (
                        <div className="h-20 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
                        </div>
                    ) : editingAddr ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(
                                    [
                                        { field: 'line1', label: 'Address Line 1', placeholder: 'Street, building…', required: true },
                                        { field: 'line2', label: 'Address Line 2', placeholder: 'Apartment, suite… (optional)' },
                                        { field: 'city', label: 'City', placeholder: 'City', required: true },
                                        { field: 'state', label: 'State', placeholder: 'State', required: true },
                                        { field: 'pincode', label: 'PIN Code', placeholder: '6-digit PIN', required: true },
                                        { field: 'country', label: 'Country', placeholder: 'Country' },
                                    ] as { field: keyof Address; label: string; placeholder: string; required?: boolean }[]
                                ).map(({ field, label, placeholder }) => (
                                    <div key={field} className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider opacity-50 font-medium">{label}</label>
                                        <input
                                            type="text"
                                            value={addrForm[field] || ''}
                                            onChange={(e) => setAddrForm(prev => ({ ...prev, [field]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="w-full px-4 py-2.5 border border-[var(--color-primary)]/15 bg-[var(--color-background)] text-sm focus:outline-none focus:border-[var(--color-primary)]/40 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            {addrMsg && (
                                <p className={`text-xs ${addrMsg.includes('saved') || addrMsg.includes('removed') ? 'text-green-600' : 'text-red-600'}`}>
                                    {addrMsg}
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={addrSaving}
                                    className="px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {addrSaving ? 'Saving…' : 'Save Address'}
                                </button>
                                <button
                                    onClick={() => { setEditingAddr(false); setAddrMsg(''); }}
                                    className="px-6 py-2.5 border border-[var(--color-primary)]/25 text-sm font-medium hover:bg-[var(--color-primary)]/5 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : address ? (
                        <div className="border border-[var(--color-accent)]/20 bg-[var(--color-background)] p-5 space-y-1">
                            <p className="text-sm font-medium">{address.line1}</p>
                            {address.line2 && <p className="text-sm opacity-70">{address.line2}</p>}
                            <p className="text-sm opacity-70">
                                {address.city}, {address.state} – {address.pincode}
                            </p>
                            <p className="text-sm opacity-60">{address.country}</p>
                            <div className="flex gap-3 pt-3">
                                <button
                                    onClick={() => { setEditingAddr(true); setAddrMsg(''); }}
                                    className="text-xs font-medium text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-3 py-1.5 hover:bg-[var(--color-accent)]/5 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDeleteAddress}
                                    className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                            {addrMsg && (
                                <p className={`text-xs mt-2 ${addrMsg.includes('saved') || addrMsg.includes('removed') ? 'text-green-600' : 'text-red-600'}`}>
                                    {addrMsg}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 space-y-2 border border-dashed border-[var(--color-primary)]/15">
                            <p className="text-sm opacity-40">No address saved yet.</p>
                            <button
                                onClick={() => { setEditingAddr(true); setAddrMsg(''); }}
                                className="text-xs font-medium text-[var(--color-accent)] underline hover:no-underline"
                            >
                                Add your delivery address
                            </button>
                        </div>
                    )}
                </section>

                {/* ╔══════════════════════════════════════════════════════════╗
                    ║  SECTION 3: Quick Links                                  ║
                    ╚══════════════════════════════════════════════════════════╝ */}
                <section className="space-y-4">
                    <h2 className="font-serif text-xl text-[var(--color-primary)]">Quick Access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group bg-white border border-[var(--color-primary)]/8 hover:border-[var(--color-accent)]/40 p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-md"
                            >
                                <span className="text-[var(--color-accent)] opacity-70 group-hover:opacity-100 mt-0.5 transition-opacity shrink-0">
                                    {link.icon}
                                </span>
                                <div className="space-y-0.5 min-w-0">
                                    <p className="font-serif text-base text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                                        {link.label}
                                    </p>
                                    <p className="text-[11px] opacity-50">
                                        {link.showRewards
                                            ? `${points} pts · ${tier} tier`
                                            : link.desc}
                                    </p>
                                </div>
                                {link.showRewards && points > 0 && (
                                    <span
                                        className={`ml-auto shrink-0 self-center text-[10px] px-2 py-0.5 border font-semibold uppercase tracking-wider ${tierColor(tier)}`}
                                    >
                                        {tier}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ╔══════════════════════════════════════════════════════════╗
                    ║  SECTION 4: Account Actions                              ║
                    ╚══════════════════════════════════════════════════════════╝ */}
                <section className="bg-white border border-[var(--color-primary)]/8 p-8 space-y-6">
                    <h2 className="font-serif text-xl text-[var(--color-primary)]">Account Actions</h2>

                    {/* Sign Out */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-primary)]/8">
                        <div>
                            <p className="font-medium text-sm">Sign Out</p>
                            <p className="text-[11px] opacity-50 mt-0.5">You will be redirected to the home page.</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="shrink-0 px-6 py-2.5 border border-[var(--color-primary)]/30 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Delete Account */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-medium text-sm text-red-600">Delete Account</p>
                            <p className="text-[11px] opacity-50 mt-0.5">Permanently remove your account and all data. This cannot be undone.</p>
                        </div>
                        {!showDeleteWarning ? (
                            <button
                                onClick={() => setShowDeleteWarning(true)}
                                className="shrink-0 px-6 py-2.5 border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <button
                                onClick={() => { setShowDeleteWarning(false); setDeleteConfirmText(''); }}
                                className="shrink-0 text-xs opacity-50 hover:opacity-80 underline"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Delete Confirmation Panel */}
                    {showDeleteWarning && (
                        <div className="border border-red-200 bg-red-50/50 p-5 space-y-4">
                            <div className="flex gap-3 items-start">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div className="space-y-1">
                                    <p className="font-medium text-sm text-red-700">This action is permanent and irreversible.</p>
                                    <p className="text-xs text-red-600/80">
                                        Your account, order history, saved addresses, rewards, and all personal data will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-red-700">
                                    Type <span className="font-bold">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full sm:max-w-xs px-4 py-2.5 border border-red-300 bg-white text-sm focus:outline-none focus:border-red-400 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || deleting}
                                className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Deleting…' : 'Permanently Delete My Account'}
                            </button>
                        </div>
                    )}
                </section>

            </div>
        </LuxuryFrame>
    );
}
