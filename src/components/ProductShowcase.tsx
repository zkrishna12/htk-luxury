'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ProductSlide {
    id: number;
    headline: string;
    subline: string;
    tagline: string;
    image: string;
    badge?: string;
    accentColor: string;
    lightBg: string;
}

const products: ProductSlide[] = [
    {
        id: 1,
        headline: "Pure Gold.",
        subline: "From the Wild.",
        tagline: "Straight from the forests of Tamil Nadu – raw, unprocessed, and untouched.",
        image: "/wild-honey.png",
        badge: "Bestseller",
        accentColor: "#D4AF37",
        lightBg: "from-[#F8F6F2] via-[#F5F0E6] to-[#F8F6F2]"
    },
    {
        id: 2,
        headline: "Earth's Spice.",
        subline: "Nature's Healer.",
        tagline: "Lakadong turmeric with 9% curcumin – the gold standard of wellness.",
        image: "/culinary-turmeric.png",
        badge: "Premium",
        accentColor: "#E8A317",
        lightBg: "from-[#F8F6F2] via-[#FBF3E4] to-[#F8F6F2]"
    },
    {
        id: 3,
        headline: "Unrefined.",
        subline: "Unapologetic.",
        tagline: "Country sugar the way your grandmother made it – pure nattu sakkarai.",
        image: "/country-sugar.png",
        accentColor: "#8B7355",
        lightBg: "from-[#F8F6F2] via-[#F2EDE6] to-[#F8F6F2]"
    }
];

export default function ProductShowcase() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlide, setPrevSlide] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [showBurst, setShowBurst] = useState(false);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const timer = setInterval(() => { handleNext(); }, 7000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleNext = () => {
        if (isAnimating) return;
        setDirection('next');
        triggerTransition((currentSlide + 1) % products.length);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setDirection('prev');
        triggerTransition((currentSlide - 1 + products.length) % products.length);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === currentSlide) return;
        setDirection(index > currentSlide ? 'next' : 'prev');
        triggerTransition(index);
    };

    const triggerTransition = (nextIndex: number) => {
        setIsAnimating(true);
        setPrevSlide(currentSlide);
        setShowBurst(true);

        setTimeout(() => {
            setCurrentSlide(nextIndex);
        }, 200);

        setTimeout(() => {
            setShowBurst(false);
            setIsAnimating(false);
        }, 1200);
    };

    const current = products[currentSlide];

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#F8F6F2]">
            {/* Dynamic warm Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${current.lightBg} transition-all duration-1000`} />

            {/* Ambient particles - gold */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute rounded-full" style={{
                        left: `${10 + (i * 7.5)}%`,
                        top: `${10 + (i * 7)}%`,
                        width: `${4 + (i % 3) * 3}px`,
                        height: `${4 + (i % 3) * 3}px`,
                        background: current.accentColor,
                        opacity: 0.2,
                        animation: `shimmer ${3 + (i % 4)}s ease-in-out infinite`,
                        animationDelay: `${(i % 5) * 0.6}s`
                    }} />
                ))}
            </div>

            {/* Side Accent Bars */}
            <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 z-20">
                <div className="h-1/3 bg-[#D4AF37]" />
                <div className="h-1/3 bg-[#1F3D2B]" />
                <div className="h-1/3 bg-[#BFA76A]" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-3 md:w-4 z-20">
                <div className="h-1/3 bg-[#BFA76A]" />
                <div className="h-1/3 bg-[#1F3D2B]" />
                <div className="h-1/3 bg-[#D4AF37]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center px-8 md:px-16 lg:px-24">
                <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-24">

                    {/* Left - Typography */}
                    <div className={`space-y-6 showcase-text-enter ${isAnimating ? 'animating' : ''}`}
                         style={{ '--text-dir': direction === 'next' ? '1' : '-1' } as React.CSSProperties}>
                        {current.badge && (
                            <span className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full text-white"
                                  style={{
                                      background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}cc)`,
                                      boxShadow: `0 4px 20px ${current.accentColor}44`
                                  }}>
                                {current.badge}
                            </span>
                        )}

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-none tracking-tight">
                            <span className="block text-[#1F3D2B]">{current.headline}</span>
                            <span className="block mt-2" style={{ color: current.accentColor }}>
                                {current.subline}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-[#1F3D2B]/60 max-w-md leading-relaxed font-light">
                            {current.tagline}
                        </p>

                        <div className="pt-4">
                            <a href="/shop"
                               className="group inline-flex items-center gap-3 py-4 px-8 text-sm font-medium uppercase tracking-widest transition-all duration-500 text-white rounded-full"
                               style={{ background: current.accentColor, boxShadow: `0 4px 30px ${current.accentColor}33` }}>
                                <span>Shop Now</span>
                                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Right - Product Image with animations */}
                    <div className="relative flex justify-center items-center" style={{ perspective: '800px' }}>

                        {/* Pulsing glow behind product */}
                        <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-3xl transition-all duration-1000"
                             style={{
                                 background: `radial-gradient(circle, ${current.accentColor}44 0%, transparent 70%)`,
                                 animation: 'pulseGlow 3s ease-in-out infinite',
                                 opacity: 0.4
                             }} />

                        {/* Revolving ring 1 - outer */}
                        <div className="absolute w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full opacity-20 transition-colors duration-1000"
                             style={{ borderColor: current.accentColor, border: `2px solid ${current.accentColor}40` }}>
                            <div className="showcase-revolve-ring" style={{ borderColor: current.accentColor }} />
                        </div>

                        {/* Revolving ring 2 - inner, reverse */}
                        <div className="absolute w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full opacity-15">
                            <div className="showcase-revolve-ring-reverse" style={{ borderColor: current.accentColor }} />
                        </div>

                        {/* Burst particles on transition */}
                        {showBurst && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                {[...Array(20)].map((_, i) => (
                                    <div key={`burst-${currentSlide}-${i}`} className="showcase-burst-particle"
                                         style={{
                                             '--burst-angle': `${(360 / 20) * i}deg`,
                                             '--burst-distance': `${100 + Math.random() * 200}px`,
                                             '--burst-delay': `${i * 0.03}s`,
                                             '--burst-size': `${2 + Math.random() * 6}px`,
                                             background: i % 2 === 0 ? current.accentColor : '#1F3D2B',
                                         } as React.CSSProperties}
                                    />
                                ))}
                            </div>
                        )}

                        {/* PRODUCT IMAGE - 3D revolving entrance */}
                        <div className={`relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 z-10 showcase-product-enter ${isAnimating ? 'animating' : ''}`}
                             style={{
                                 animation: 'showcaseFloat 5s ease-in-out infinite',
                                 filter: `drop-shadow(0 20px 60px ${current.accentColor}44)`,
                                 '--enter-dir': direction === 'next' ? '1' : '-1',
                             } as React.CSSProperties}>
                            <Image src={current.image} alt={current.headline} fill className="object-contain" priority unoptimized />
                        </div>

                        {/* Orbiting dots around product */}
                        <div className="absolute w-80 h-80 md:w-[400px] md:h-[400px] showcase-orbit-dots">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="absolute w-2 h-2 rounded-full" style={{
                                    background: current.accentColor,
                                    boxShadow: `0 0 10px ${current.accentColor}66`,
                                    top: '50%', left: '50%',
                                    transform: `rotate(${i * 90}deg) translateX(${160 + i * 10}px) translateY(-50%)`,
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button onClick={handlePrev}
                    className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-[#1F3D2B]/10 backdrop-blur-sm rounded-full hover:bg-[#1F3D2B]/20 hover:scale-110 transition-all duration-300"
                    aria-label="Previous slide">
                <svg className="w-6 h-6 text-[#1F3D2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button onClick={handleNext}
                    className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-[#1F3D2B]/10 backdrop-blur-sm rounded-full hover:bg-[#1F3D2B]/20 hover:scale-110 transition-all duration-300"
                    aria-label="Next slide">
                <svg className="w-6 h-6 text-[#1F3D2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {products.map((_, index) => (
                    <button key={index} onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[#1F3D2B]' : 'w-3 bg-[#1F3D2B]/30 hover:bg-[#1F3D2B]/50'}`}
                            aria-label={`Go to slide ${index + 1}`} />
                ))}
            </div>

            {/* Bottom text */}
            <div className="absolute bottom-4 left-8 right-8 z-20">
                <p className="text-[10px] text-[#1F3D2B]/30 text-center">
                    HTK Enterprises © 2025 | All products are 100% organic, ethically sourced from Tamil Nadu, India.
                </p>
            </div>
        </section>
    );
}
