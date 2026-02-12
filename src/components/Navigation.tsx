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

    // Scroll direction state for hide-on-scroll
    const [isHidden, setIsHidden] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const lastScrollY = useRef(0);

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

    // Scroll direction tracking for hide-on-scroll behavior
    useEffect(() => {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Add shadow when scrolled past threshold
            setHasScrolled(currentScrollY > 50);

            // Don't hide when menu is open
            if (isOpen) {
                setIsHidden(false);
                lastScrollY.current = currentScrollY;
                return;
            }

            // At top of page, always show
            if (currentScrollY <= 0) {
                setIsHidden(false);
                lastScrollY.current = currentScrollY;
                return;
            }

            // Determine scroll direction with threshold
            const scrollDifference = currentScrollY - lastScrollY.current;

            if (scrollDifference > 10) {
                // Scrolling down - hide nav
                setIsHidden(true);
            } else if (scrollDifference < -10) {
                // Scrolling up - show nav
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    // Navigation container classes based on scroll state
    const navContainerClasses = `
        fixed top-0 right-0 z-50 p-6 md:p-8 flex items-center gap-8 font-serif pointer-events-auto text-[var(--color-primary)]
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isHidden && !isOpen ? 'translate-y-[-100%]' : 'translate-y-0'}
        ${hasScrolled && !isHidden ? 'bg-[var(--color-background)]/80 backdrop-blur-md shadow-lg rounded-bl-2xl' : ''}
    `.trim().replace(/\s+/g, ' ');

    const logoContainerClasses = `
        fixed top-0 left-0 z-50 p-6 md:p-8 pointer-events-auto
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isHidden && !isOpen ? 'translate-y-[-100%]' : 'translate-y-0'}
        ${hasScrolled && !isHidden ? 'bg-[var(--color-background)]/80 backdrop-blur-md shadow-lg rounded-br-2xl' : ''}
    `.trim().replace(/\s+/g, ' ');

    return (
        <>
            {/* Logo - Independent Layout (Hidden on Home) */}
            {pathname !== '/' && (
                <div className={logoContainerClasses}>
                    <Link href="/" className="relative block w-16 h-16 md:w-20 md:h-20 transition-transform duration-700 hover:scale-105">
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

            {/* Menu & Cart - Independent Layout */}
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

                {/* Main Navigation Links - Visible & Large */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link href="/about" className="text-sm hover:opacity-50 font-bold">
                        About
                    </Link>
                    {!user && (
                        <Link href="/login" className="text-sm hover:opacity-50 font-bold">
                            Login
                        </Link>
                    )}
                </div>

                {/* Cart Trigger */}
                <button onClick={() => setCartOpen(true)} className="text-xs hover:opacity-50 font-medium">
                    Cart ({items.length})
                </button>

                {/* Menu Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs hover:opacity-50 font-medium"
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

