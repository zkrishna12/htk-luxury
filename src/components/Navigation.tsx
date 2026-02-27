'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const { setCartOpen, items } = useCart();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Close menu when route changes
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Track scroll for background styling
    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation container — always visible, gains backdrop on scroll
    const navContainerClasses = `
        fixed top-0 right-0 z-50 p-4 md:p-6 flex items-center gap-6 md:gap-8 font-serif pointer-events-auto text-[var(--color-primary)]
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${hasScrolled ? 'bg-[var(--color-background)]/80 backdrop-blur-md shadow-sm rounded-bl-2xl' : ''}
    `.trim().replace(/\s+/g, ' ');

    const logoContainerClasses = `
        fixed top-0 left-0 z-50 p-4 md:p-6 pointer-events-auto
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${hasScrolled ? 'bg-[var(--color-background)]/80 backdrop-blur-md shadow-sm rounded-br-2xl' : ''}
    `.trim().replace(/\s+/g, ' ');

    return (
        <>
            {/* Logo - Independent Layout (Hidden on Home) */}
            {pathname !== '/' && (
                <div className={logoContainerClasses}>
                    <Link href="/" className="relative block w-14 h-14 md:w-16 md:h-16 transition-transform duration-700 hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="HTK"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </Link>
                </div>
            )}

            {/* Menu & Cart - Always visible fixed nav */}
            <div className={navContainerClasses}>
                {/* User Greeting */}
                {user && (
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs opacity-80 font-medium">
                            Welcome, {user.displayName?.split(' ')[0] || 'Member'}
                        </span>
                        <Link href="/orders" className="text-[10px] opacity-50 hover:opacity-100 border-b border-[var(--color-primary)]">
                            View Orders
                        </Link>
                    </div>
                )}

                {/* Main Navigation Links */}
                <div className="hidden md:flex gap-6 items-center">
                    <Link href="/about" className="text-sm hover:opacity-50 font-bold transition-opacity duration-300">
                        About
                    </Link>
                    {!user && (
                        <Link href="/login" className="text-sm hover:opacity-50 font-bold transition-opacity duration-300">
                            Login
                        </Link>
                    )}
                </div>

                {/* Cart Trigger */}
                <button onClick={() => setCartOpen(true)} className="text-xs hover:opacity-50 font-medium transition-opacity duration-300">
                    Cart ({items.length})
                </button>

                {/* Menu Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs hover:opacity-50 font-medium transition-opacity duration-300"
                >
                    {isOpen ? 'Close' : 'Menu'}
                </button>
            </div>

            {/* Sanctuary Menu Overlay */}
            <div
                className={`fixed inset-0 bg-[var(--color-bg-warm)] z-40 flex flex-col items-center transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Scrollable Container */}
                <div className="flex-1 w-full flex flex-col items-center justify-center overflow-y-auto py-24 px-6 hide-scrollbar">
                    <nav className="flex flex-col gap-6 md:gap-10 text-center shrink-0">
                        <Link href="/" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Home
                        </Link>
                        <Link href="/shop" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Shop Collection
                        </Link>
                        <Link href="/organic" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Organic Goods
                        </Link>
                        <Link href="/corporate-gifting" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Corporate Gifting
                        </Link>
                        <Link href="/about" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Our Philosophy
                        </Link>
                        <Link href="/reviews" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Community Stories
                        </Link>
                        <Link href="/enquiry" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Business Enquiry
                        </Link>
                        <Link href="/feedback" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500">
                            Feedback
                        </Link>
                        {user && (
                            <Link href="/orders" className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] hover:italic transition-all duration-500 opacity-60">
                                My History
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="pb-8 pt-4 text-[var(--color-accent)] text-xs opacity-60 shrink-0">
                    HTK Enterprises &copy; 2025
                </div>
            </div>
        </>
    );
}
