'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';

export default function HeroSection() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 200);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsLoaded(true);
            return;
        }

        const handleScroll = () => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                if (rect.bottom > 0) {
                    setScrollY(window.scrollY);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    // Parallax multipliers
    const parallaxSlow = scrollY * 0.15;
    const parallaxMed = scrollY * 0.3;
    const parallaxFast = scrollY * 0.5;
    const opacityFade = Math.max(0, 1 - scrollY / 600);
    const scaleUp = 1 + scrollY * 0.0003;

    return (
        <section ref={heroRef} className="apple-hero relative overflow-hidden" style={{ minHeight: '100vh' }}>

            {/* === Dark cinematic background === */}
            <div className="absolute inset-0 bg-[#0a0a08]" />

            {/* Ambient glow orbs - slow drift */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div
                    className="apple-glow-orb"
                    style={{
                        width: '800px', height: '800px',
                        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)',
                        top: '-20%', right: '-10%',
                        transform: `translate(0, ${parallaxSlow}px)`,
                    }}
                />
                <div
                    className="apple-glow-orb"
                    style={{
                        width: '600px', height: '600px',
                        background: 'radial-gradient(circle, rgba(31,61,43,0.08) 0%, transparent 60%)',
                        bottom: '-10%', left: '-10%',
                        transform: `translate(0, ${-parallaxSlow}px)`,
                    }}
                />
            </div>

            {/* === Main Content with parallax layers === */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
                 style={{ opacity: opacityFade }}>

                {/* Logo - mask reveal */}
                <div
                    className={`apple-mask-reveal mb-8 ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        transitionDelay: '300ms',
                        transform: `translateY(${-parallaxMed}px)`
                    }}
                >
                    <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
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

                {/* Headline - staggered slide+fade */}
                <div style={{ transform: `translateY(${-parallaxMed * 0.8}px)` }}>
                    <h1 className="font-serif text-white leading-[1.1]">
                        <span
                            className={`block apple-text-reveal text-5xl md:text-7xl lg:text-8xl font-bold ${isLoaded ? 'revealed' : ''}`}
                            style={{ transitionDelay: '600ms' }}
                        >
                            Nature&apos;s Purity,
                        </span>
                        <span
                            className={`block apple-text-reveal text-4xl md:text-6xl lg:text-7xl font-bold mt-2 ${isLoaded ? 'revealed' : ''}`}
                            style={{
                                transitionDelay: '900ms',
                                color: '#D4AF37',
                                textShadow: '0 0 80px rgba(212,175,55,0.3)'
                            }}
                        >
                            Professionally Delivered.
                        </span>
                    </h1>
                </div>

                {/* Golden accent line - width reveal */}
                <div
                    className={`apple-line-reveal mt-8 mb-8 ${isLoaded ? 'revealed' : ''}`}
                    style={{ transitionDelay: '1100ms' }}
                />

                {/* Subtitle */}
                <p
                    className={`apple-text-reveal text-base md:text-lg text-white/50 max-w-lg mx-auto font-light tracking-wide leading-relaxed ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        transitionDelay: '1200ms',
                        transform: `translateY(${-parallaxSlow}px)`
                    }}
                >
                    From pure organic harvests to refined corporate expressions.
                    Three years of trust, now at your doorstep.
                </p>

                {/* CTA Buttons */}
                <div
                    className={`flex flex-col sm:flex-row gap-4 mt-12 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        transitionDelay: '1400ms',
                        transform: `translateY(${-parallaxSlow * 0.5}px)`
                    }}
                >
                    <a
                        href="/shop"
                        className="apple-cta-primary group relative py-4 px-10 overflow-hidden"
                    >
                        <span className="relative z-10 text-xs uppercase tracking-[0.25em] font-medium text-[#0a0a08]">
                            Shop Collection
                        </span>
                        <span className="apple-cta-shine" />
                    </a>
                    <a
                        href="/corporate-gifting"
                        className="apple-cta-secondary py-4 px-10 text-xs uppercase tracking-[0.25em] font-medium"
                    >
                        Corporate Gifting
                    </a>
                </div>

                {/* Trust badges - subtle fade */}
                <div
                    className={`flex items-center gap-8 mt-16 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                    style={{ transitionDelay: '1700ms' }}
                >
                    {['100% Organic', 'Women-Led', 'Since 2023'].map((label, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* === Floating Product Images with 3D Perspective === */}
            <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden" aria-hidden="true" style={{ perspective: '1200px' }}>

                {/* Honey - left drift */}
                <div
                    className={`apple-float-product ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        top: '15%', left: '5%',
                        width: '180px', height: '180px',
                        transitionDelay: '1800ms',
                        transform: `translateY(${parallaxFast * 0.6}px) rotateY(8deg) rotateX(-3deg) scale(${scaleUp})`,
                        opacity: isLoaded ? 0.15 : 0,
                    }}
                >
                    <Image src="/shop-honey.jpg" alt="" fill className="object-cover rounded-xl" unoptimized />
                </div>

                {/* Turmeric - right drift */}
                <div
                    className={`apple-float-product ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        top: '25%', right: '3%',
                        width: '160px', height: '160px',
                        transitionDelay: '2000ms',
                        transform: `translateY(${parallaxFast * 0.4}px) rotateY(-10deg) rotateX(5deg) scale(${scaleUp})`,
                        opacity: isLoaded ? 0.12 : 0,
                    }}
                >
                    <Image src="/shop-turmeric-pkg.jpg" alt="" fill className="object-cover rounded-xl" unoptimized />
                </div>

                {/* Sugar - bottom left */}
                <div
                    className={`apple-float-product ${isLoaded ? 'revealed' : ''}`}
                    style={{
                        bottom: '12%', left: '10%',
                        width: '140px', height: '140px',
                        transitionDelay: '2200ms',
                        transform: `translateY(${parallaxFast * 0.3}px) rotateY(12deg) rotateX(6deg) scale(${scaleUp})`,
                        opacity: isLoaded ? 0.10 : 0,
                    }}
                >
                    <Image src="/shop-sugar.jpg" alt="" fill className="object-cover rounded-xl" unoptimized />
                </div>
            </div>

            {/* Scroll indicator */}
            <div
                className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                style={{ transitionDelay: '2400ms' }}
            >
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/30">Scroll</span>
                <div className="w-[1px] h-10 relative overflow-hidden">
                    <div className="apple-scroll-line" />
                </div>
            </div>
        </section>
    );
}
