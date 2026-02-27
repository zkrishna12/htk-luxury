'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { auth, provider, signInWithPopup } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LuxuryFrame from '@/components/LuxuryFrame';
import { sendAdminNotification } from '@/lib/adminNotifications';

export default function LoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<'PHONE' | 'EMAIL' | 'GOOGLE'>('PHONE');

    // User Details
    const [fullName, setFullName] = useState('');

    // Phone State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Initialize RecaptchaVerifier
    const setupRecaptcha = useCallback(() => {
        try {
            if (window.recaptchaVerifier) {
                // Clear existing verifier to avoid re-render issues
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } catch (e) {
            // Ignore clear errors
        }

        // Only setup if the container exists
        const container = document.getElementById('recaptcha-container');
        if (!container) return;

        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setMessage('reCAPTCHA expired. Please try again.');
                }
            });
        } catch (e: any) {
            console.error('RecaptchaVerifier setup error:', e);
        }
    }, []);

    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setupRecaptcha();
        }, 500);
        return () => clearTimeout(timer);
    }, [setupRecaptcha]);

    // ===== PHONE AUTH =====
    const requestOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setMessage('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Re-setup recaptcha if needed
            if (!window.recaptchaVerifier) {
                setupRecaptcha();
                // Wait for it to initialize
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const appVerifier = window.recaptchaVerifier;

            if (!appVerifier) {
                setMessage('reCAPTCHA not ready. Please refresh the page.');
                setLoading(false);
                return;
            }

            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setStep('OTP');
            setMessage('OTP sent successfully.');
        } catch (error: any) {
            console.error('Phone auth error:', error);
            if (error.code === 'auth/billing-not-enabled') {
                setMessage('SMS quota exceeded. Please use Email or Google login.');
            } else if (error.code === 'auth/too-many-requests') {
                setMessage('Too many attempts. Please wait and try again later.');
            } else if (error.code === 'auth/invalid-phone-number') {
                setMessage('Invalid phone number format. Please include country code (e.g., +91).');
            } else {
                setMessage('Failed to send OTP: ' + (error.message || 'Unknown error'));
            }

            // Reset recaptcha on error
            try {
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
                setupRecaptcha();
            } catch (e) {
                // Ignore reset errors
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length < 4) {
            setMessage('Please enter the OTP code.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            if (confirmationResult) {
                const result = await confirmationResult.confirm(otp);
                if (fullName && result.user) {
                    await updateProfile(result.user, { displayName: fullName });
                }
                sendAdminNotification({
                    type: 'registration',
                    data: {
                        phone: phoneNumber,
                        userId: result.user?.uid,
                        name: fullName || 'Not provided'
                    }
                });
                router.push('/shop');
            }
        } catch (error: any) {
            console.error('OTP verify error:', error);
            if (error.code === 'auth/invalid-verification-code') {
                setMessage('Invalid OTP code. Please check and try again.');
            } else if (error.code === 'auth/code-expired') {
                setMessage('OTP expired. Please request a new one.');
                setStep('PHONE');
                setConfirmationResult(null);
            } else {
                setMessage('Verification failed: ' + (error.message || 'Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    // ===== GOOGLE SSO =====
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setMessage('');
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Send admin notification
            sendAdminNotification({
                type: 'registration',
                data: {
                    phone: user.email || 'Google SSO',
                    userId: user.uid,
                    name: user.displayName || 'Google User'
                }
            });

            router.push('/shop');
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setMessage('Sign-in popup was closed. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                setMessage('Popup was blocked by the browser. Please allow popups for this site.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // User clicked multiple times, ignore
            } else {
                setMessage('Google sign-in failed: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    // ===== EMAIL AUTH =====
    const handleEmailAuth = async () => {
        if (!email || !password) {
            setMessage('Please enter email and password.');
            return;
        }
        if (password.length < 6) {
            setMessage('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const { signInWithEmailAndPassword } = await import('@/lib/firebase');
            const result = await signInWithEmailAndPassword(auth, email, password);

            if (fullName && result.user) {
                await updateProfile(result.user, { displayName: fullName });
            }

            router.push('/shop');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setMessage('Account not found. Creating your account...');

                try {
                    const { createUserWithEmailAndPassword } = await import('@/lib/firebase');
                    const createResult = await createUserWithEmailAndPassword(auth, email, password);

                    if (fullName && createResult.user) {
                        await updateProfile(createResult.user, { displayName: fullName });
                    }

                    sendAdminNotification({
                        type: 'registration',
                        data: {
                            phone: email,
                            userId: createResult.user?.uid,
                            name: fullName || 'Not provided'
                        }
                    });

                    router.push('/shop');
                } catch (createError: any) {
                    if (createError.code === 'auth/email-already-in-use') {
                        setMessage('Incorrect password. Please try again.');
                    } else if (createError.code === 'auth/weak-password') {
                        setMessage('Password is too weak. Use at least 6 characters.');
                    } else {
                        setMessage('Authentication failed: ' + (createError.message || 'Unknown error'));
                    }
                }
            } else if (error.code === 'auth/wrong-password') {
                setMessage('Incorrect password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                setMessage('Invalid email format.');
            } else {
                setMessage('Login failed: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LuxuryFrame className="flex flex-col items-center justify-center">

            <div className="w-full max-w-md text-center space-y-10 animate-fade-in relative z-20">
                {/* Logo */}
                <div className="relative w-28 h-28 mx-auto">
                    <Image src="/logo.png" alt="HTK" fill className="object-contain" unoptimized />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-serif text-[var(--color-primary)]">Member Access</h1>

                    {/* Login Method Switcher */}
                    <div className="flex justify-center gap-6 text-xs uppercase tracking-widest pt-4">
                        {[
                            { key: 'PHONE' as const, label: 'Mobile' },
                            { key: 'EMAIL' as const, label: 'Email' },
                        ].map((method) => (
                            <button
                                key={method.key}
                                onClick={() => {
                                    setLoginMethod(method.key);
                                    setMessage('');
                                    setStep('PHONE');
                                }}
                                className={`pb-2 border-b transition-all duration-300 ${loginMethod === method.key
                                    ? 'border-[var(--color-primary)] opacity-100'
                                    : 'border-transparent opacity-40 hover:opacity-70'}`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>

                    <p className="opacity-50 font-sans text-xs tracking-widest uppercase pt-2">
                        {loginMethod === 'PHONE'
                            ? (step === 'PHONE' ? 'Enter your mobile number to begin.' : 'Enter the OTP code sent to your phone.')
                            : 'Enter your email credentials.'}
                    </p>
                </div>

                <div className="space-y-5 px-6">

                    {/* ======== GOOGLE SSO BUTTON ======== */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                    >
                        {/* Google Icon */}
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--color-primary)]/10"></div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-primary)]/30">or</span>
                        <div className="flex-1 h-px bg-[var(--color-primary)]/10"></div>
                    </div>

                    {/* Name Input */}
                    {((loginMethod === 'PHONE' && step === 'PHONE') || loginMethod === 'EMAIL') && (
                        <input
                            type="text"
                            placeholder="Full Name (Optional)"
                            className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-base tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent transition-colors duration-300"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    )}

                    {loginMethod === 'PHONE' ? (
                        <>
                            {step === 'PHONE' ? (
                                <div className="space-y-2">
                                    <input
                                        type="tel"
                                        placeholder="+91 Phone Number"
                                        className="w-full border-b border-[var(--color-primary)]/20 py-4 text-center text-xl tracking-widest focus:outline-none focus:border-[var(--color-primary)] bg-transparent transition-colors duration-300"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && requestOtp()}
                                    />
                                    <div id="recaptcha-container"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="w-full border-b border-[var(--color-primary)]/20 py-4 text-center text-2xl tracking-[0.8em] focus:outline-none focus:border-[var(--color-primary)] bg-transparent transition-colors duration-300"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => {
                                            setStep('PHONE');
                                            setOtp('');
                                            setConfirmationResult(null);
                                            setMessage('');
                                            // Re-setup recaptcha
                                            setTimeout(setupRecaptcha, 300);
                                        }}
                                        className="text-xs text-[var(--color-accent)] hover:opacity-70 transition-opacity"
                                    >
                                        ← Change Number
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={step === 'PHONE' ? requestOtp : verifyOtp}
                                disabled={loading}
                                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 transition-all duration-300 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (step === 'PHONE' ? 'Send OTP' : 'Verify & Login')}
                            </button>
                        </>
                    ) : (
                        /* Email Form */
                        <>
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-base tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent transition-colors duration-300"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                                />
                                <input
                                    type="password"
                                    placeholder="Password (min 6 characters)"
                                    className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-base tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent transition-colors duration-300"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                                />
                            </div>

                            <button
                                onClick={handleEmailAuth}
                                disabled={loading}
                                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 transition-all duration-300 uppercase tracking-widest text-xs mt-2 disabled:opacity-50"
                            >
                                {loading ? 'Authenticating...' : 'Sign In / Register'}
                            </button>
                        </>
                    )}

                    {/* Message display */}
                    {message && (
                        <p className={`text-xs py-2 px-4 rounded ${message.includes('success') || message.includes('sent') || message.includes('Creating')
                            ? 'text-green-600 bg-green-50'
                            : 'text-red-600 bg-red-50'}`}>
                            {message}
                        </p>
                    )}
                </div>

                <div className="pt-8 opacity-25 text-[10px] text-[var(--color-primary)]">
                    <p>Secure Authentication by Google Firebase</p>
                </div>
            </div>

        </LuxuryFrame>
    );
}

// Types for window
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
