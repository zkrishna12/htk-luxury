'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function HeroSection() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isClient, setIsClient] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsClient(true);

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section ref={heroRef} className="min-h-[90vh] relative overflow-hidden">
            {/* Golden Cursor Follower - Only on desktop */}
            {isClient && (
                <div
                    className="cursor-follower hidden md:block"
                    style={{
                        left: mousePosition.x,
                        top: mousePosition.y,
                        opacity: mousePosition.x > 0 ? 1 : 0
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Split Screen Container */}
            <div className="flex flex-col lg:flex-row min-h-[90vh]">

                {/* Left Side - Content */}
                <div className="lg:w-1/2 flex flex-col justify-center items-center lg:items-start px-8 lg:px-16 py-16 lg:py-0 text-center lg:text-left order-2 lg:order-1">

                    {/* Logo */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 transition-transform duration-700 hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="HTK Enterprises"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>

                    {/* Hook / Tagline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-primary)] font-bold leading-tight mb-6">
                        <span className="block">Nature's Purity,</span>
                        <span className="block text-[var(--color-gold-deep)]">Professionally Delivered.</span>
                    </h1>

                    {/* Supporting Text */}
                    <p className="text-lg md:text-xl text-[var(--color-primary)] opacity-70 max-w-md mb-10 font-light leading-relaxed">
                        From pure organic harvests to refined corporate expressions.
                        3 years of trust, now at your doorstep.
                    </p>

                    {/* Dual CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <a
                            href="/shop"
                            className="group relative py-4 px-10 bg-[var(--color-primary)] text-white font-medium tracking-wide overflow-hidden transition-all duration-500 hover:shadow-lg"
                        >
                            <span className="relative z-10">Shop Collection</span>
                            <span className="absolute inset-0 bg-[var(--color-gold-deep)] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                        </a>
                        <a
                            href="/corporate-gifting"
                            className="py-4 px-10 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-medium tracking-wide hover:bg-[var(--color-primary)] hover:text-white transition-all duration-500"
                        >
                            Corporate Gifting
                        </a>
                    </div>
                </div>

                {/* Right Side - Floating Products Visual */}
                <div className="lg:w-1/2 relative flex items-center justify-center py-16 lg:py-0 order-1 lg:order-2 bg-gradient-to-br from-[var(--color-bg-warm)] to-[var(--color-bg-cream)]">

                    {/* Golden Particle Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-[var(--color-gold-deep)]"
                                style={{
                                    left: `${15 + (i * 10)}%`,
                                    top: `${20 + (i * 8)}%`,
                                    animation: `shimmer ${3 + (i * 0.5)}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.3}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Floating Products */}
                    <div className="relative w-full max-w-lg h-[400px] md:h-[500px]">

                        {/* Main Honey Jar */}
                        <div
                            className="absolute top-[10%] left-[15%] w-40 h-40 md:w-56 md:h-56 drop-shadow-2xl"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        >
                            <Image
                                src="/shop-honey.jpg"
                                alt="Organic Wild Honey"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -bottom-2 -right-2 w-full h-full rounded-lg border-2 border-[var(--color-gold-deep)] opacity-30 -z-10"></div>
                        </div>

                        {/* Turmeric Pack */}
                        <div
                            className="absolute top-[35%] right-[10%] w-36 h-36 md:w-48 md:h-48 drop-shadow-2xl"
                            style={{ animation: 'floatAlt 5s ease-in-out infinite', animationDelay: '1s' }}
                        >
                            <Image
                                src="/shop-turmeric-pkg.jpg"
                                alt="Premium Turmeric"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -bottom-2 -left-2 w-full h-full rounded-lg border-2 border-[var(--color-accent)] opacity-30 -z-10"></div>
                        </div>

                        {/* Country Sugar */}
                        <div
                            className="absolute bottom-[10%] left-[25%] w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl"
                            style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }}
                        >
                            <Image
                                src="/shop-sugar.jpg"
                                alt="Country Sugar"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -top-2 -right-2 w-full h-full rounded-lg border-2 border-[var(--color-primary)] opacity-20 -z-10"></div>
                        </div>
                    </div>

                    {/* Decorative golden accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold-deep)] to-transparent opacity-40"></div>
                </div>
            </div>
        </section>
    );
}
