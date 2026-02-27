'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function HeroSection() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isClient, setIsClient] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsClient(true);
        // Stagger the entrance animation
        const timer = setTimeout(() => setIsLoaded(true), 100);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsLoaded(true);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timer);
        };
    }, []);

    return (
        <section ref={heroRef} className="min-h-[100vh] relative overflow-hidden">
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

            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
                <div className="hero-orb hero-orb-3" />
            </div>

            {/* Split Screen Container */}
            <div className="flex flex-col lg:flex-row min-h-[100vh]">

                {/* Left Side - Content */}
                <div className="lg:w-1/2 flex flex-col justify-center items-center lg:items-start px-8 lg:px-16 py-16 lg:py-0 text-center lg:text-left order-2 lg:order-1">

                    {/* Logo with entrance animation */}
                    <div className={`relative w-32 h-32 md:w-40 md:h-40 mb-8 transition-all duration-1000 ease-out hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                         style={{ transitionDelay: '200ms' }}>
                        <Image
                            src="/logo.png"
                            alt="HTK Enterprises"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>

                    {/* Hook / Tagline with staggered text reveal */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-primary)] font-bold leading-tight mb-6">
                        <span className={`block hero-text-reveal transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                              style={{ transitionDelay: '400ms' }}>
                            Nature&apos;s Purity,
                        </span>
                        <span className={`block text-[var(--color-gold-deep)] hero-text-reveal transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                              style={{ transitionDelay: '700ms' }}>
                            Professionally Delivered.
                        </span>
                    </h1>

                    {/* Animated underline accent */}
                    <div className={`h-[2px] bg-gradient-to-r from-[var(--color-gold-deep)] via-[var(--color-accent)] to-transparent mb-8 transition-all duration-1200 ease-out ${isLoaded ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
                         style={{ transitionDelay: '900ms' }} />

                    {/* Supporting Text */}
                    <p className={`text-lg md:text-xl text-[var(--color-primary)] opacity-70 max-w-md mb-10 font-light leading-relaxed transition-all duration-1000 ease-out ${isLoaded ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-8'}`}
                       style={{ transitionDelay: '1000ms' }}>
                        From pure organic harvests to refined corporate expressions.
                        3 years of trust, now at your doorstep.
                    </p>

                    {/* Dual CTAs with entrance animation */}
                    <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                         style={{ transitionDelay: '1200ms' }}>
                        <a
                            href="/shop"
                            className="group relative py-4 px-10 bg-[var(--color-primary)] text-white font-medium tracking-wide overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-primary)]/20"
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

                    {/* Trust Indicators - animated entrance */}
                    <div className={`flex items-center gap-8 mt-12 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                         style={{ transitionDelay: '1500ms' }}>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] opacity-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>100% Organic</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] opacity-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"/>
                            </svg>
                            <span>Women-Led</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] opacity-50">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>Since 2023</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Enhanced Floating Products Visual */}
                <div className="lg:w-1/2 relative flex items-center justify-center py-16 lg:py-0 order-1 lg:order-2 bg-gradient-to-br from-[var(--color-bg-warm)] to-[var(--color-bg-cream)]">

                    {/* Radial glow behind products */}
                    <div className={`absolute w-[500px] h-[500px] rounded-full transition-all duration-[2000ms] ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                         style={{
                             background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.04) 50%, transparent 70%)',
                             transitionDelay: '500ms'
                         }}
                    />

                    {/* Golden Particle Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute w-1.5 h-1.5 rounded-full bg-[var(--color-gold-deep)] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                style={{
                                    left: `${10 + (i * 7)}%`,
                                    top: `${15 + (i * 6)}%`,
                                    animation: `shimmer ${3 + (i * 0.5)}s ease-in-out infinite, heroParticleDrift ${8 + i}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.4}s`,
                                    transitionDelay: `${1500 + i * 100}ms`
                                }}
                            />
                        ))}
                    </div>

                    {/* Floating Products with enhanced entrance */}
                    <div className="relative w-full max-w-lg h-[400px] md:h-[500px]">

                        {/* Main Honey Jar */}
                        <div
                            className={`absolute top-[10%] left-[15%] w-40 h-40 md:w-56 md:h-56 drop-shadow-2xl transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'}`}
                            style={{
                                animation: isLoaded ? 'float 6s ease-in-out infinite' : 'none',
                                transitionDelay: '600ms'
                            }}
                        >
                            <Image
                                src="/shop-honey.jpg"
                                alt="Organic Wild Honey"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -bottom-2 -right-2 w-full h-full rounded-lg border-2 border-[var(--color-gold-deep)] opacity-30 -z-10"></div>
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 rounded-lg hero-card-shimmer" />
                        </div>

                        {/* Turmeric Pack */}
                        <div
                            className={`absolute top-[35%] right-[10%] w-36 h-36 md:w-48 md:h-48 drop-shadow-2xl transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'}`}
                            style={{
                                animation: isLoaded ? 'floatAlt 5s ease-in-out infinite' : 'none',
                                animationDelay: '1s',
                                transitionDelay: '900ms'
                            }}
                        >
                            <Image
                                src="/shop-turmeric-pkg.jpg"
                                alt="Premium Turmeric"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -bottom-2 -left-2 w-full h-full rounded-lg border-2 border-[var(--color-accent)] opacity-30 -z-10"></div>
                            <div className="absolute inset-0 rounded-lg hero-card-shimmer" style={{ animationDelay: '2s' }} />
                        </div>

                        {/* Country Sugar */}
                        <div
                            className={`absolute bottom-[10%] left-[25%] w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-90'}`}
                            style={{
                                animation: isLoaded ? 'float 7s ease-in-out infinite' : 'none',
                                animationDelay: '2s',
                                transitionDelay: '1200ms'
                            }}
                        >
                            <Image
                                src="/shop-sugar.jpg"
                                alt="Country Sugar"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <div className="absolute -top-2 -right-2 w-full h-full rounded-lg border-2 border-[var(--color-primary)] opacity-20 -z-10"></div>
                            <div className="absolute inset-0 rounded-lg hero-card-shimmer" style={{ animationDelay: '4s' }} />
                        </div>
                    </div>

                    {/* Decorative golden accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold-deep)] to-transparent transition-opacity duration-1000 ${isLoaded ? 'opacity-40' : 'opacity-0'}`}
                         style={{ transitionDelay: '1800ms' }} />
                </div>
            </div>

            {/* Scroll indicator */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${isLoaded ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'}`}
                 style={{ transitionDelay: '2000ms' }}>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-primary)]">Scroll</span>
                <div className="w-px h-8 bg-[var(--color-primary)] opacity-40 hero-scroll-line" />
            </div>
        </section>
    );
}
