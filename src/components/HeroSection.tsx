'use client';

import React, { useEffect, useState, useRef } from 'react';
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

    const parallaxSlow = scrollY * 0.15;
    const parallaxMed = scrollY * 0.3;
    const opacityFade = Math.max(0, 1 - scrollY / 600);

    return (
        <section ref={heroRef} className="apple-hero relative overflow-hidden" style={{ minHeight: '100vh' }}>

            {/* === Light warm background === */}
            <div className="absolute inset-0 bg-[#F8F6F2]" />

            {/* Subtle warm gradient overlay */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%)'
            }} />

            {/* Ambient glow orbs - soft warm tones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="apple-glow-orb" style={{
                    width: '800px', height: '800px',
                    background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)',
                    top: '-20%', right: '-10%',
                    transform: `translate(0, ${parallaxSlow}px)`,
                }} />
                <div className="apple-glow-orb" style={{
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(31,61,43,0.05) 0%, transparent 60%)',
                    bottom: '-10%', left: '-10%',
                    transform: `translate(0, ${-parallaxSlow}px)`,
                }} />
            </div>

            {/* Decorative leaf/dot pattern - very subtle */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #1F3D2B 1px, transparent 0)',
                backgroundSize: '60px 60px'
            }} />

            {/* ===== ORBITING PRODUCT IMAGES ===== */}
            <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden="true" style={{ perspective: '1000px' }}>

                {/* Central orbit container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[700px] md:h-[700px]">

                    {/* Revolving orbit ring - gold dashed */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/20 hero-orbit-ring" />
                    <div className="absolute inset-[60px] rounded-full border border-dashed border-[#1F3D2B]/8 hero-orbit-ring-reverse" />

                    {/* HONEY */}
                    <div className={`hero-product-orbit hero-product-orbit-1 ${isLoaded ? 'revealed' : ''}`}>
                        <div className="hero-product-card hero-product-spin-y">
                            <div className="relative w-28 h-28 md:w-36 md:h-36">
                                <Image src="/shop-honey.jpg" alt="Wild Honey" fill className="object-cover rounded-2xl shadow-lg" unoptimized />
                                <div className="hero-product-shimmer-light" />
                            </div>
                            <div className="hero-product-glow-light" style={{ background: 'rgba(212,175,55,0.2)' }} />
                            <span className="hero-product-label-light">Wild Honey</span>
                        </div>
                    </div>

                    {/* TURMERIC */}
                    <div className={`hero-product-orbit hero-product-orbit-2 ${isLoaded ? 'revealed' : ''}`}>
                        <div className="hero-product-card hero-product-spin-y" style={{ animationDelay: '-2s' }}>
                            <div className="relative w-24 h-24 md:w-32 md:h-32">
                                <Image src="/shop-turmeric-pkg.jpg" alt="Turmeric" fill className="object-cover rounded-2xl shadow-lg" unoptimized />
                                <div className="hero-product-shimmer-light" style={{ animationDelay: '1s' }} />
                            </div>
                            <div className="hero-product-glow-light" style={{ background: 'rgba(232,163,23,0.2)' }} />
                            <span className="hero-product-label-light">Turmeric</span>
                        </div>
                    </div>

                    {/* SUGAR */}
                    <div className={`hero-product-orbit hero-product-orbit-3 ${isLoaded ? 'revealed' : ''}`}>
                        <div className="hero-product-card hero-product-spin-y" style={{ animationDelay: '-4s' }}>
                            <div className="relative w-24 h-24 md:w-32 md:h-32">
                                <Image src="/shop-sugar.jpg" alt="Country Sugar" fill className="object-cover rounded-2xl shadow-lg" unoptimized />
                                <div className="hero-product-shimmer-light" style={{ animationDelay: '2s' }} />
                            </div>
                            <div className="hero-product-glow-light" style={{ background: 'rgba(139,115,85,0.2)' }} />
                            <span className="hero-product-label-light">Country Sugar</span>
                        </div>
                    </div>

                    {/* COFFEE/WILD HONEY */}
                    <div className={`hero-product-orbit hero-product-orbit-4 ${isLoaded ? 'revealed' : ''}`}>
                        <div className="hero-product-card hero-product-spin-y" style={{ animationDelay: '-1s' }}>
                            <div className="relative w-20 h-20 md:w-28 md:h-28">
                                <Image src="/wild-honey.png" alt="Coffee" fill className="object-contain rounded-2xl" unoptimized />
                                <div className="hero-product-shimmer-light" style={{ animationDelay: '3s' }} />
                            </div>
                            <div className="hero-product-glow-light" style={{ background: 'rgba(212,175,55,0.15)' }} />
                        </div>
                    </div>
                </div>

                {/* Particle burst effect on load - gold & green */}
                {isLoaded && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="hero-burst-particle" style={{
                                '--burst-angle': `${(360 / 16) * i}deg`,
                                '--burst-distance': `${120 + Math.random() * 180}px`,
                                '--burst-delay': `${i * 0.05}s`,
                                '--burst-size': `${3 + Math.random() * 5}px`,
                                background: i % 3 === 0 ? '#D4AF37' : i % 3 === 1 ? '#1F3D2B' : '#BFA76A',
                            } as React.CSSProperties} />
                        ))}
                    </div>
                )}
            </div>

            {/* === Main Content === */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
                 style={{ opacity: opacityFade }}>

                {/* Logo */}
                <div className={`apple-mask-reveal mb-8 ${isLoaded ? 'revealed' : ''}`}
                     style={{ transitionDelay: '300ms', transform: `translateY(${-parallaxMed}px)` }}>
                    <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
                        <Image src="/logo.png" alt="HTK Enterprises" fill className="object-contain" priority unoptimized />
                    </div>
                </div>

                {/* Headline */}
                <div style={{ transform: `translateY(${-parallaxMed * 0.8}px)` }}>
                    <h1 className="font-serif leading-[1.1]">
                        <span className={`block apple-text-reveal text-5xl md:text-7xl lg:text-8xl font-bold text-[#1F3D2B] ${isLoaded ? 'revealed' : ''}`}
                              style={{ transitionDelay: '600ms' }}>
                            Nature&apos;s Purity,
                        </span>
                        <span className={`block apple-text-reveal text-4xl md:text-6xl lg:text-7xl font-bold mt-2 ${isLoaded ? 'revealed' : ''}`}
                              style={{ transitionDelay: '900ms', color: '#D4AF37' }}>
                            Professionally Delivered.
                        </span>
                    </h1>
                </div>

                {/* Golden accent line */}
                <div className={`apple-line-reveal mt-8 mb-8 ${isLoaded ? 'revealed' : ''}`}
                     style={{ transitionDelay: '1100ms' }} />

                {/* Subtitle */}
                <p className={`apple-text-reveal text-base md:text-lg text-[#1F3D2B]/60 max-w-lg mx-auto font-light tracking-wide leading-relaxed ${isLoaded ? 'revealed' : ''}`}
                   style={{ transitionDelay: '1200ms', transform: `translateY(${-parallaxSlow}px)` }}>
                    From pure organic harvests to refined corporate expressions.
                    Three years of trust, now at your doorstep.
                </p>

                {/* CTA Buttons */}
                <div className={`flex flex-col sm:flex-row gap-4 mt-12 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                     style={{ transitionDelay: '1400ms', transform: `translateY(${-parallaxSlow * 0.5}px)` }}>
                    <a href="/shop" className="light-cta-primary group relative py-4 px-10 overflow-hidden rounded-full">
                        <span className="relative z-10 text-xs uppercase tracking-[0.25em] font-medium text-white">Shop Collection</span>
                        <span className="apple-cta-shine" />
                    </a>
                    <a href="/corporate-gifting" className="light-cta-secondary py-4 px-10 text-xs uppercase tracking-[0.25em] font-medium rounded-full">
                        Corporate Gifting
                    </a>
                </div>

                {/* Trust badges */}
                <div className={`flex items-center gap-8 mt-16 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                     style={{ transitionDelay: '1700ms' }}>
                    {['100% Organic', 'Women-Led', 'Since 2023'].map((label, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-[0.3em] text-[#1F3D2B]/30">{label}</span>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 apple-text-reveal ${isLoaded ? 'revealed' : ''}`}
                 style={{ transitionDelay: '2400ms' }}>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#1F3D2B]/30">Scroll</span>
                <div className="w-[1px] h-10 relative overflow-hidden">
                    <div className="apple-scroll-line-light" />
                </div>
            </div>
        </section>
    );
}
