'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import ProductShowcase from '@/components/ProductShowcase';

/* ========================================
   Apple-style Parallax Scroll Hook
   ======================================== */
function useParallaxReveal(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            setScrollProgress(1);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin: '0px 0px -60px 0px' }
        );

        if (ref.current) observer.observe(ref.current);

        const handleScroll = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const windowH = window.innerHeight;
            const progress = Math.min(1, Math.max(0, (windowH - rect.top) / (windowH + rect.height)));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [threshold]);

    return { ref, isVisible, scrollProgress };
}

/* ========================================
   Animated Counter
   ======================================== */
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
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [hasStarted, target, duration]);

    return <span ref={ref} className="counter-value">{count}{suffix}</span>;
}

/* ========================================
   Main HomeClient Component
   ======================================== */
export default function HomeClient() {
    const marquee = useParallaxReveal(0.1);
    const features = useParallaxReveal(0.1);
    const philosophy = useParallaxReveal(0.15);
    const showcase = useParallaxReveal(0.08);
    const stats = useParallaxReveal(0.1);
    const journey = useParallaxReveal(0.1);
    const trustBadge = useParallaxReveal(0.1);

    return (
        <main className="min-h-screen relative">
            {/* ========== HERO ========== */}
            <HeroSection />

            {/* ========== DARK TRANSITION - Scrolling Trust Marquee ========== */}
            <div ref={marquee.ref} className="apple-section-dark py-6 overflow-hidden relative">
                <div className={`marquee-track flex items-center gap-14 whitespace-nowrap apple-fade-up ${marquee.isVisible ? 'revealed' : ''}`}
                     style={{ width: 'max-content' }}>
                    {[...Array(3)].map((_, setIdx) => (
                        <React.Fragment key={setIdx}>
                            {[
                                '100% Organic', '✦', 'Women-Led Enterprise', '✦',
                                'Ships All India', '✦', 'Ethically Sourced', '✦',
                                'From Tamil Nadu with Love', '✦', 'Since 2023', '✦',
                                'No Chemicals', '✦', 'Pure & Traceable', '✦'
                            ].map((text, i) => (
                                <span key={`${setIdx}-${i}`}
                                      className={`text-[10px] uppercase tracking-[0.35em] ${text === '✦'
                                          ? 'text-[#D4AF37] text-[8px]'
                                          : 'text-white/40'}`}>
                                    {text}
                                </span>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ========== FEATURE HIGHLIGHTS - Dark section with Apple grid ========== */}
            <section className="apple-section-dark py-28 md:py-36 relative overflow-hidden">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '80px 80px'
                }} />

                <div ref={features.ref} className="luxury-container relative z-10">
                    {/* Section header - slide up */}
                    <div className={`text-center mb-20 apple-text-reveal ${features.isVisible ? 'revealed' : ''}`}>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] mb-5">Why Choose Us</p>
                        <h2 className="text-3xl md:text-5xl font-serif text-white font-bold leading-tight">
                            Rooted in Tradition,<br/>Refined for You
                        </h2>
                    </div>

                    {/* Feature cards - staggered reveal with 3D tilt on hover */}
                    <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                        {[
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        <path d="M9 12l2 2 4-4"/>
                                    </svg>
                                ),
                                title: 'Certified Organic',
                                description: 'Every product sourced from certified organic farms in the Western Ghats. Zero chemicals, zero compromise.'
                            },
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z"/>
                                    </svg>
                                ),
                                title: 'Farm to Doorstep',
                                description: 'Direct from farmers in Thandikudi, Kodaikanal, Ooty, and Coorg. No middlemen, ensuring freshness.'
                            },
                            {
                                icon: (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                ),
                                title: 'Women Empowered',
                                description: 'A women-led enterprise supporting local communities. Every purchase sustains traditional farming families.'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className={`apple-feature-card apple-stagger-reveal ${features.isVisible ? 'revealed' : ''}`}
                                style={{ transitionDelay: `${300 + i * 200}ms` }}
                            >
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 text-[#D4AF37] mb-6 border border-white/10">
                                    {feature.icon}
                                </div>
                                <h3 className="font-serif text-xl text-white mb-3 font-semibold">{feature.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== NAVIGATION PATHS - Minimal links ========== */}
            <nav className="apple-section-dark py-20 flex flex-col md:flex-row justify-center gap-12 md:gap-24 text-lg font-sans relative z-10 border-t border-white/5 border-b border-b-white/5">
                {[
                    { href: '/organic', label: 'Organic Goods' },
                    { href: '/corporate-gifting', label: 'Corporate Gifting' },
                    { href: '/shop', label: 'Shop All' },
                ].map((link, i) => (
                    <a key={i} href={link.href} className="group relative py-2 text-center">
                        <span className="text-white/60 group-hover:text-white transition-colors duration-500">{link.label}</span>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-700 group-hover:w-full" />
                    </a>
                ))}
            </nav>

            {/* ========== PRODUCT SHOWCASE - Full-bleed dark carousel ========== */}
            <div ref={showcase.ref} className={`apple-scale-reveal ${showcase.isVisible ? 'revealed' : ''}`}>
                <ProductShowcase />
            </div>

            {/* ========== PHILOSOPHY - Cinematic text on dark ========== */}
            <section ref={philosophy.ref} className="apple-section-dark py-28 md:py-40 px-8 relative overflow-hidden">
                {/* Ambient background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
                     style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 60%)' }} />

                <div className="max-w-2xl mx-auto text-center relative z-10"
                     style={{ transform: `translateY(${(1 - philosophy.scrollProgress) * 30}px)` }}>
                    <p className={`apple-text-reveal text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] mb-8 ${philosophy.isVisible ? 'revealed' : ''}`}
                       style={{ transitionDelay: '0ms' }}>
                        Our Philosophy
                    </p>
                    <p className={`apple-text-reveal font-serif text-2xl md:text-4xl text-white/80 leading-relaxed mb-6 ${philosophy.isVisible ? 'revealed' : ''}`}
                       style={{ transitionDelay: '200ms' }}>
                        We believe food should be pure, honest, and traceable.
                    </p>
                    <p className={`apple-text-reveal font-serif text-2xl md:text-4xl text-white/80 leading-relaxed mb-10 ${philosophy.isVisible ? 'revealed' : ''}`}
                       style={{ transitionDelay: '400ms' }}>
                        We believe gifting should carry meaning, not noise.
                    </p>
                    <div className={`apple-text-reveal ${philosophy.isVisible ? 'revealed' : ''}`}
                         style={{ transitionDelay: '600ms' }}>
                        <a href="/about" className="inline-block text-sm font-sans text-[#D4AF37] border-b border-[#D4AF37]/40 pb-1 hover:border-[#D4AF37] transition-all duration-500">
                            Read Our Philosophy
                        </a>
                    </div>
                </div>
            </section>

            {/* ========== STATS / IMPACT - Number reveal with parallax ========== */}
            <section ref={stats.ref} className="apple-section-dark py-24 relative overflow-hidden border-t border-white/5">
                {/* Dot pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)',
                    backgroundSize: '48px 48px'
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
                                className={`apple-stagger-reveal ${stats.isVisible ? 'revealed' : ''}`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                <div className="text-4xl md:text-6xl font-serif text-[#D4AF37] mb-3 font-bold">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== THE JOURNEY - Horizontal scroll-reveal steps ========== */}
            <section ref={journey.ref} className="apple-section-dark py-28 md:py-36 relative overflow-hidden border-t border-white/5">
                <div className="luxury-container">
                    <div className={`text-center mb-20 apple-text-reveal ${journey.isVisible ? 'revealed' : ''}`}>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] mb-5">The Journey</p>
                        <h2 className="text-3xl md:text-5xl font-serif text-white font-bold">From Farm to You</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Harvested', desc: 'Hand-picked from organic farms in the Western Ghats' },
                            { step: '02', title: 'Processed', desc: 'Minimally processed to preserve natural goodness' },
                            { step: '03', title: 'Packaged', desc: 'Sealed in premium containers for freshness' },
                            { step: '04', title: 'Delivered', desc: 'Shipped directly to your doorstep across India' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`apple-stagger-reveal text-center md:text-left ${journey.isVisible ? 'revealed' : ''}`}
                                style={{ transitionDelay: `${300 + i * 200}ms` }}
                            >
                                <div className="text-5xl md:text-6xl font-serif text-[#D4AF37]/20 font-bold mb-4">{item.step}</div>
                                <h3 className="font-serif text-lg text-white mb-2 font-semibold">{item.title}</h3>
                                <p className="text-sm text-white/35 leading-relaxed">{item.desc}</p>
                                {i < 3 && (
                                    <div className="hidden md:block mt-6 h-[1px] bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== TRUST BADGE - Final light section transition ========== */}
            <section ref={trustBadge.ref} className="py-20 bg-[var(--color-bg-warm)] relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <p className={`apple-text-reveal text-[10px] uppercase tracking-[0.4em] text-[var(--color-accent)] mb-5 ${trustBadge.isVisible ? 'revealed' : ''}`}
                       style={{ transitionDelay: '0ms' }}>
                        Trusted Since 2023
                    </p>
                    <p className={`apple-text-reveal font-serif text-xl md:text-2xl text-[var(--color-primary)] opacity-70 leading-relaxed ${trustBadge.isVisible ? 'revealed' : ''}`}
                       style={{ transitionDelay: '200ms' }}>
                        3 years of delivering nature&apos;s finest to discerning homes and businesses across India.
                    </p>
                </div>
            </section>
        </main>
    );
}
