'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LuxuryFrame from '@/components/LuxuryFrame';
import { sendAdminNotification } from '@/lib/adminNotifications';

export default function LoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');

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

    useEffect(() => {
        // Initialize Recaptcha only if Phone method is active or on mount if needed
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved
                }
            });
        }
    }, []);

    const requestOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setMessage('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const appVerifier = window.recaptchaVerifier;

            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setStep('OTP');
            setMessage('OTP sent successfully.');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/billing-not-enabled') {
                setMessage('SMS Quota Exceeded or Billing Required. Please use Email Login or contact support.');
            } else {
                setMessage('Failed to send OTP. ' + error.message);
            }
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.render().then((widgetId: any) => {
                    window.recaptchaVerifier.reset(widgetId);
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp) return;
        setLoading(true);
        try {
            if (confirmationResult) {
                const result = await confirmationResult.confirm(otp);
                // Update Profile Name if provided
                if (fullName && result.user) {
                    await updateProfile(result.user, { displayName: fullName });
                }

                // Send admin notification for new registration
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
            console.error(error);
            setMessage('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // New: Email Login / Signup Logic
    // For simplicity in this demo, we'll try to Sign In, if fails (user-not-found), we try to Sign Up.
    // In a real app, explicit tabs for login/signup are better, but this is a "Member Access" unified flow.
    const handleEmailAuth = async () => {
        if (!email || !password) {
            setMessage('Please enter email and password.');
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const { signInWithEmailAndPassword } = await import('@/lib/firebase');
            const result = await signInWithEmailAndPassword(auth, email, password);

            // Update Profile if Name provided and not already set (or overwrite? Let's overwrite to ensure specific request is met)
            if (fullName && result.user) {
                await updateProfile(result.user, { displayName: fullName });
            }

            router.push('/shop');
        } catch (error: any) {
            // If user not found, try creating? Or just show error.
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setMessage('Invalid credentials. Attempting to register...');

                try {
                    const { createUserWithEmailAndPassword } = await import('@/lib/firebase');
                    const createResult = await createUserWithEmailAndPassword(auth, email, password);

                    if (fullName && createResult.user) {
                        await updateProfile(createResult.user, { displayName: fullName });
                    }

                    // Send admin notification for new email registration
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
                    setMessage('Authentication failed. ' + createError.message);
                }
            } else {
                setMessage('Login failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LuxuryFrame className="flex flex-col items-center justify-center">

            <div className="w-full max-w-md text-center space-y-12 animate-fade-in relative z-20">
                {/* Logo */}
                <div className="relative w-32 h-32 mx-auto">
                    <Image src="/logo.png" alt="HTK" fill className="object-contain" unoptimized />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-serif text-[var(--color-primary)]">Member Access</h1>

                    {/* Switcher */}
                    <div className="flex justify-center gap-8 text-xs uppercase tracking-widest pt-4">
                        <button
                            onClick={() => setLoginMethod('PHONE')}
                            className={`pb-2 border-b transition-all ${loginMethod === 'PHONE' ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            Mobile
                        </button>
                        <button
                            onClick={() => setLoginMethod('EMAIL')}
                            className={`pb-2 border-b transition-all ${loginMethod === 'EMAIL' ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            Email
                        </button>
                    </div>

                    <p className="opacity-60 font-sans text-sm tracking-widest uppercase pt-2">
                        {loginMethod === 'PHONE'
                            ? (step === 'PHONE' ? 'Enter details to begin.' : 'Enter the OTP code.')
                            : 'Enter your email credentials.'}
                    </p>
                </div>

                <div className="space-y-6 px-8">

                    {/* Name Input - Always Visible for new convenience */}
                    {step === 'PHONE' && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Full Name (Optional)"
                                className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-lg tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>
                    )}

                    {loginMethod === 'PHONE' ? (
                        <>
                            {step === 'PHONE' ? (
                                <div className="space-y-2">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full border-b border-[var(--color-primary)]/20 py-4 text-center text-xl tracking-widest focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                    />
                                    <div id="recaptcha-container"></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        className="w-full border-b border-[var(--color-primary)]/20 py-4 text-center text-2xl tracking-[1em] focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                    />
                                </div>
                            )}

                            <button
                                onClick={step === 'PHONE' ? requestOtp : verifyOtp}
                                disabled={loading}
                                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 transition-all uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Processing...' : (step === 'PHONE' ? 'Send OTP' : 'Verify & Login')}
                            </button>
                        </>
                    ) : (
                        // Email Form
                        <>
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-lg tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full border-b border-[var(--color-primary)]/20 py-3 text-center text-lg tracking-wide focus:outline-none focus:border-[var(--color-primary)] bg-transparent"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleEmailAuth}
                                disabled={loading}
                                className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 transition-all uppercase tracking-widest text-xs mt-4"
                            >
                                {loading ? 'Authenticating...' : 'Sign In / Register'}
                            </button>
                        </>
                    )}

                    {message && <p className="text-xs text-[var(--color-accent)]">{message}</p>}
                </div>

                <div className="pt-12 opacity-30 text-xs text-[var(--color-primary)]">
                    <p>Secure Authentication by Google Firebase</p>
                </div>
            </div>

        </LuxuryFrame>
    );
}

// Add types for window
declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
