'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * HeroSection — HTK Enterprises
 *
 * Design: Full-viewport hero, warm cream background, four product image cards
 * at the corners, headline + CTA in the center.
 *
 * Animations: Pure CSS @keyframes — NO isLoaded state toggling opacity.
 * Elements animate from opacity:0 to opacity:1 inside the keyframe itself,
 * so they are always visible on first render (forward-fill mode via
 * animation-fill-mode: forwards).
 *
 * Parallax: minimal — only a translateY offset driven by scroll, no reveal logic.
 */

const PRODUCTS = [
    {
        src: '/shop-honey.jpg',
        alt: 'Mountain Honey',
        label: 'Mountain Honey',
        position: 'top-left',
        floatClass: 'hero-float-1',
        delay: '0s',
    },
    {
        src: '/shop-turmeric-pkg.jpg',
        alt: 'Turmeric',
        label: 'Turmeric',
        position: 'top-right',
        floatClass: 'hero-float-2',
        delay: '0.2s',
    },
    {
        src: '/shop-sugar.jpg',
        alt: 'Country Sugar',
        label: 'Country Sugar',
        position: 'bottom-left',
        floatClass: 'hero-float-3',
        delay: '0.4s',
    },
    {
        src: '/shop-coffee-v2.jpg',
        alt: 'Coffee',
        label: 'Arabica Coffee',
        position: 'bottom-right',
        floatClass: 'hero-float-4',
        delay: '0.6s',
    },
];

/** Maps position name → absolute positioning classes */
const POSITION_CLASSES: Record<string, string> = {
    'top-left': 'top-[8%] left-[3%] md:top-[12%] md:left-[5%]',
    'top-right': 'top-[8%] right-[3%] md:top-[12%] md:right-[5%]',
    'bottom-left': 'bottom-[10%] left-[3%] md:bottom-[12%] md:left-[5%]',
    'bottom-right': 'bottom-[10%] right-[3%] md:bottom-[12%] md:right-[5%]',
};

export default function HeroSection() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    /* ------------------------------------------------------------------
     * Minimal scroll-based parallax — only shifts position, never hides.
     * ------------------------------------------------------------------ */
    useEffect(() => {
        let rafId: number;

        const handleScroll = () => {
            if (!heroRef.current || !contentRef.current) return;
            const scrollY = window.scrollY;
            const rect = heroRef.current.getBoundingClientRect();
            if (rect.bottom < 0) return; // skip if hero is off-screen
            const offset = scrollY * 0.12;
            contentRef.current.style.transform = `translateY(${-offset}px)`;
        };

        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(handleScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <section
            ref={heroRef}
            className="apple-hero relative overflow-hidden"
            style={{ minHeight: '100vh' }}
        >
            {/* ── Background ── */}
            <div className="absolute inset-0 bg-[#F8F6F2]" />

            {/* Subtle radial gold top-glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%)',
                }}
            />

            {/* Subtle dot-grid texture */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: 0.035,
                    backgroundImage:
                        'radial-gradient(circle at 1.5px 1.5px, #1F3D2B 1px, transparent 0)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* ── Product Image Cards (four corners) ── */}
            {PRODUCTS.map((product) => (
                <div
                    key={product.src}
                    className={`absolute z-10 ${POSITION_CLASSES[product.position]} ${product.floatClass} hero-product-entry`}
                    style={{ animationDelay: product.delay }}
                >
                    {/* Card */}
                    <div className="
                        relative
                        flex flex-col items-center gap-2
                        bg-white/80 backdrop-blur-sm
                        rounded-2xl
                        p-2.5
                        shadow-[0_8px_32px_rgba(31,61,43,0.10),0_2px_8px_rgba(31,61,43,0.06)]
                        border border-white/90
                        w-[120px] h-auto
                        md:w-[160px]
                    ">
                        {/* Image wrapper — fixed square */}
                        <div className="relative w-[96px] h-[96px] md:w-[132px] md:h-[132px] rounded-xl overflow-hidden">
                            <Image
                                src={product.src}
                                alt={product.alt}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {/* Shimmer overlay */}
                            <div className="hero-product-shimmer-light absolute inset-0 rounded-xl pointer-events-none" />
                        </div>

                        {/* Label */}
                        <span className="
                            text-[9px] uppercase tracking-[0.22em]
                            font-medium text-[#1F3D2B]/55
                            text-center leading-tight
                            w-full
                        ">
                            {product.label}
                        </span>
                    </div>
                </div>
            ))}

            {/* ── Central Content ── */}
            <div
                ref={contentRef}
                className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center"
            >
                {/* Logo */}
                <div className="mb-6 hero-text-enter" style={{ animationDelay: '0.1s' }}>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                        <Image
                            src="/logo.png"
                            alt="HTK Enterprises"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                </div>

                {/* Headline */}
                <h1 className="font-serif leading-[1.1] max-w-2xl">
                    <span
                        className="block text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-[#1F3D2B] hero-text-enter"
                        style={{ animationDelay: '0.25s' }}
                    >
                        Nature&apos;s Purity,
                    </span>
                    <span
                        className="block text-4xl md:text-6xl lg:text-7xl font-bold mt-1 hero-text-enter"
                        style={{ color: '#D4AF37', animationDelay: '0.45s' }}
                    >
                        Professionally Delivered.
                    </span>
                </h1>

                {/* Accent line */}
                <div
                    className="hero-line-enter mt-8 mb-6"
                    style={{ animationDelay: '0.65s' }}
                />

                {/* Subtitle */}
                <p
                    className="hero-text-enter text-base md:text-lg text-[#1F3D2B]/60 max-w-md mx-auto font-light tracking-wide leading-relaxed"
                    style={{ animationDelay: '0.75s' }}
                >
                    From pure organic harvests to refined corporate expressions.
                    <br className="hidden md:block" />
                    Three years of trust, now at your doorstep.
                </p>

                {/* CTA Buttons */}
                <div
                    className="flex flex-col sm:flex-row gap-4 mt-10 hero-text-enter"
                    style={{ animationDelay: '0.95s' }}
                >
                    <a
                        href="/shop"
                        className="light-cta-primary group relative py-4 px-10 overflow-hidden rounded-full"
                    >
                        <span className="relative z-10 text-xs uppercase tracking-[0.22em] font-medium text-white">
                            Shop Collection
                        </span>
                        <span className="apple-cta-shine" />
                    </a>
                    <a
                        href="/corporate-gifting"
                        className="light-cta-secondary py-4 px-10 text-xs uppercase tracking-[0.22em] font-medium rounded-full"
                    >
                        Corporate Gifting
                    </a>
                </div>

                {/* Trust badges */}
                <div
                    className="flex items-center gap-6 md:gap-10 mt-14 hero-text-enter"
                    style={{ animationDelay: '1.15s' }}
                >
                    {['100% Organic', 'Women-Led', 'Since 2023'].map((label) => (
                        <span
                            key={label}
                            className="text-[9px] uppercase tracking-[0.28em] text-[#1F3D2B]/35"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Scroll Indicator ── */}
            <div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 hero-text-enter"
                style={{ animationDelay: '1.4s' }}
            >
                <span className="text-[9px] uppercase tracking-[0.38em] text-[#1F3D2B]/30">
                    Scroll
                </span>
                <div className="w-px h-9 relative overflow-hidden rounded-full">
                    <div className="apple-scroll-line-light" />
                </div>
            </div>
        </section>
    );
}
