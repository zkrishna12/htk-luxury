'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-primary)] text-[var(--color-background)] pt-24 pb-12 border-t border-[var(--color-accent)] border-opacity-20 animate-fade-in">
            <div className="luxury-container grid md:grid-cols-4 gap-12 mb-24">

                {/* Brand */}
                <div className="space-y-6">
                    <div className="relative w-24 h-24 opacity-80 mix-blend-screen">
                        <Image src="/logo.png" alt="HTK" fill className="object-contain" unoptimized />
                    </div>
                    <p className="opacity-60 text-sm leading-relaxed max-w-xs">
                        Rooted in nature. Crafted for meaningful living.
                        Delivering the earth's honest yield to your home.
                    </p>
                    <Link href="/reviews" className="inline-block text-xs border-b border-[var(--color-accent)] pb-1 hover:opacity-50">
                        Read Community Reviews
                    </Link>
                </div>

                {/* Explore */}
                <div className="space-y-6">
                    <h4 className="font-serif text-2xl tracking-wide">Explore</h4>
                    <nav className="flex flex-col gap-4 text-sm opacity-70 font-light tracking-wide">
                        <Link href="/" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Home</Link>
                        <Link href="/organic" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Organic Goods</Link>
                        <Link href="/corporate-gifting" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Corporate Gifting</Link>
                        <Link href="/shop" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Shop Collection</Link>
                    </nav>
                </div>

                {/* Legal & Info */}
                <div className="space-y-6">
                    <h4 className="font-serif text-2xl tracking-wide text-[var(--color-accent)]">Company</h4>
                    <ul className="space-y-4 opacity-70 text-sm font-light tracking-wide">
                        <li><Link href="/about" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Our Philosophy</Link></li>
                        <li><Link href="/shop" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Collection</Link></li>
                        <li><Link href="/organic" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Organic Methods</Link></li>
                        <li><Link href="/reviews" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Community Stories</Link></li>
                        <li><Link href="/enquiry" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Business Enquiry</Link></li>
                        <li><Link href="/feedback" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">Feedback & Suggestions</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="space-y-6">
                    <h4 className="font-serif text-2xl tracking-wide">Contact</h4>
                    <div className="space-y-3 text-sm opacity-70 font-light tracking-wide">
                        <p className="font-medium opacity-90">Support:</p>
                        <p><a href="mailto:support@htkenterprises.net" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">support@htkenterprises.net</a></p>
                        <p className="font-medium opacity-90 pt-2">Sales:</p>
                        <p><a href="mailto:salesandsupport@htkenterprises.net" className="hover:text-[var(--color-accent)] hover:opacity-100 transition-all duration-300">salesandsupport@htkenterprises.net</a></p>
                        <p className="font-medium opacity-90 pt-2">WhatsApp:</p>
                        <p className="tracking-widest">8438380900 / 8838660900</p>
                    </div>
                </div>

            </div>

            {/* Explicit Divider Line */}
            <div className="luxury-container">
                <div className="border-t border-[var(--color-background)] border-opacity-10 my-16"></div>
            </div>

            {/* Bottom Legal & Social */}
            <div className="luxury-container flex flex-col md:flex-row justify-between items-end gap-16 pb-12">
                <div className="text-xs opacity-40 space-y-4">
                    <p>© 2025 HTK Enterprises. All Rights Reserved.</p>
                    <p>Regd. Office: Dindigul, TN, India, 624708.</p>
                    <p>GSTIN: 33BFCPK4245R2Z4</p>
                    <p>Women-Led Enterprise</p>
                </div>

                {/* Language & Currency Switchers */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <CurrencySwitcher />
                </div>

                {/* Instagram QR Mini */}
                <a href="https://www.instagram.com/naturesorganichoney" target="_blank" className="flex items-center gap-4 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-xs">Follow us</span>
                    <div className="relative w-32 h-32 border border-[var(--color-background)] p-0 overflow-hidden">
                        <Image
                            src="/insta-qr.jpg"
                            alt="QR"
                            fill
                            className="object-cover scale-110"
                            unoptimized
                        />
                    </div>
                </a>
            </div>
        </footer>
    );
}
