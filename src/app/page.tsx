'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import ProductShowcase from '@/components/ProductShowcase';

/* Intersection Observer hook for scroll-triggered animations */
function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

/* Animated counter component */
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [hasStarted, target, duration]);

    return <span ref={ref} className="counter-value">{count}{suffix}</span>;
}

export default function Home() {
    const features = useScrollReveal();
    const philosophy = useScrollReveal();
    const stats = useScrollReveal();
    const showcase = useScrollReveal(0.1);
    const trustBar = useScrollReveal(0.1);

    return (
        <main className="min-h-screen relative">
            {/* Premium Hero Section */}
            <HeroSection />

            {/* ======== Scrolling Trust Marquee ======== */}
            <div ref={trustBar.ref} className={`py-5 bg-[var(--color-primary)] overflow-hidden transition-opacity duration-1000 ${trustBar.isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="marquee-track flex items-center gap-12 whitespace-nowrap" style={{ width: 'max-content' }}>
                    {[...Array(2)].map((_, setIdx) => (
                        <React.Fragment key={setIdx}>
                            {[
                                '100% Organic',
                                '★',
                                'Women-Led Enterprise',
                                '★',
                                'Ships All India',
                                '★',
                                'Ethically Sourced',
                                '★',
                                'From Tamil Nadu with Love',
                                '★',
                                'Since 2023',
                                '★',
                                'No Chemicals',
                                '★',
                                'Pure & Traceable',
                                '★'
                            ].map((text, i) => (
                                <span key={`${setIdx}-${i}`} className={`text-xs uppercase tracking-[0.3em] ${text === '★' ? 'text-[var(--color-gold-deep)] text-[8px]' : 'text-[var(--color-background)] opacity-70'}`}>
                                    {text}
                                </span>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ======== Feature Highlights ======== */}
            <section className="py-24 md:py-32 bg-[var(--color-background)] relative">
                <div ref={features.ref} className="luxury-container">
                    {/* Section header */}
                    <div className={`text-center mb-16 section-reveal ${features.isVisible ? 'visible' : ''}`}>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">Why Choose Us</p>
                        <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)]">Rooted in Tradition,<br/>Refined for You</h2>
                    </div>

                    {/* Feature cards */}
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        <path d="M9 12l2 2 4-4"/>
                                    </svg>
                                ),
                                title: 'Certified Organic',
                                description: 'Every product is sourced from certified organic farms in the Western Ghats. Zero chemicals, zero compromise.'
                            },
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"/>
                                    </svg>
                                ),
                                title: 'Farm to Doorstep',
                                description: 'Direct from farmers in Thandikudi, Kodaikanal, Ooty, and Coorg. No middlemen, ensuring freshness and fair pricing.'
                            },
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                ),
                                title: 'Women Empowered',
                                description: 'A women-led enterprise supporting local communities. Every purchase helps sustain traditional farming families.'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className={`feature-card bg-white border border-[var(--color-primary)]/5 p-8 md:p-10 text-center section-reveal ${features.isVisible ? 'visible' : ''}`}
                                style={{ transitionDelay: `${200 + i * 150}ms` }}
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-warm)] text-[var(--color-accent)] mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="font-serif text-xl text-[var(--color-primary)] mb-3">{feature.title}</h3>
                                <p className="text-sm text-[var(--color-primary)] opacity-60 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== Navigation Paths ======== */}
            <nav className="py-24 flex flex-col md:flex-row justify-center gap-12 md:gap-24 text-lg font-sans relative z-10 bg-[var(--color-background)]">
                <a href="/organic" className="group relative py-2 text-center">
                    <span className="text-[var(--color-primary)]">Organic Goods</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[var(--color-gold-deep)] transition-all duration-700 group-hover:w-full"></span>
                </a>
                <a href="/corporate-gifting" className="group relative py-2 text-center">
                    <span className="text-[var(--color-primary)]">Corporate Gifting</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[var(--color-gold-deep)] transition-all duration-700 group-hover:w-full"></span>
                </a>
                <a href="/shop" className="group relative py-2 text-center">
                    <span className="text-[var(--color-primary)]">Shop All</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[var(--color-gold-deep)] transition-all duration-700 group-hover:w-full"></span>
                </a>
            </nav>

            {/* Decorative Divider */}
            <div className="flex justify-center py-4 bg-[var(--color-background)]">
                <div className="h-px w-24 bg-[var(--color-gold-deep)] opacity-40"></div>
            </div>

            {/* ======== Product Showcase Carousel ======== */}
            <div ref={showcase.ref} className={`section-reveal ${showcase.isVisible ? 'visible' : ''}`}>
                <ProductShowcase />
            </div>

            {/* ======== Philosophy Teaser ======== */}
            <section ref={philosophy.ref} className="py-24 md:py-32 px-8 bg-[var(--color-background)]">
                <div className={`max-w-2xl mx-auto font-serif text-2xl md:text-3xl text-[var(--color-primary)] opacity-80 leading-relaxed text-center relative z-10 section-reveal ${philosophy.isVisible ? 'visible' : ''}`}>
                    <p className="mb-4">
                        We believe food should be pure, honest, and traceable.
                    </p>
                    <p className="mb-0">
                        We believe gifting should carry meaning, not noise.
                    </p>
                    <div className="mt-10">
                        <a href="/about" className="inline-block text-sm font-sans text-[var(--color-accent)] border-b border-[var(--color-accent)] pb-1 hover:opacity-60 transition-opacity">
                            Read Our Philosophy
                        </a>
                    </div>
                </div>
            </section>

            {/* ======== Stats / Impact Section ======== */}
            <section ref={stats.ref} className="py-20 bg-[var(--color-primary)] relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                <div className="luxury-container relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                        {[
                            { value: 3, suffix: '+', label: 'Years of Trust' },
                            { value: 500, suffix: '+', label: 'Happy Families' },
                            { value: 6, suffix: '', label: 'Pure Products' },
                            { value: 100, suffix: '%', label: 'Organic' }
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={`section-reveal ${stats.isVisible ? 'visible' : ''}`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                <div className="text-4xl md:text-5xl font-serif text-[var(--color-gold-deep)] mb-2">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-background)] opacity-60">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======== Trust Badge ======== */}
            <section className="py-16 bg-[var(--color-bg-warm)]">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">
                        Trusted Since 2023
                    </p>
                    <p className="font-serif text-xl text-[var(--color-primary)] opacity-70">
                        3 years of delivering nature&apos;s finest to discerning homes and businesses across India.
                    </p>
                </div>
            </section>
        </main>
    );
}
