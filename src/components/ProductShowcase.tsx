'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductSlide {
    id: number;
    headline: string;
    subline: string;
    tagline: string;
    image: string;
    badge?: string;
    accentColor: string;
    bgGradient: string;
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
        bgGradient: "from-[#1a1a1a] via-[#2d2a1f] to-[#1a1a1a]"
    },
    {
        id: 2,
        headline: "Earth's Spice.",
        subline: "Nature's Healer.",
        tagline: "Lakadong turmeric with 9% curcumin – the gold standard of wellness.",
        image: "/culinary-turmeric.png",
        badge: "Premium",
        accentColor: "#E8A317",
        bgGradient: "from-[#1a1a1a] via-[#2d1f1a] to-[#1a1a1a]"
    },
    {
        id: 3,
        headline: "Unrefined.",
        subline: "Unapologetic.",
        tagline: "Country sugar the way your grandmother made it – pure nattu sakkarai.",
        image: "/country-sugar.png",
        accentColor: "#8B7355",
        bgGradient: "from-[#1a1a1a] via-[#1f1a1a] to-[#1a1a1a]"
    }
];

export default function ProductShowcase() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-advance carousel
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % products.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === currentSlide) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const current = products[currentSlide];

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
            {/* Dynamic Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${current.bgGradient} transition-all duration-1000`}
            />

            {/* Animated Particles/Glow Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${4 + Math.random() * 8}px`,
                            height: `${4 + Math.random() * 8}px`,
                            background: current.accentColor,
                            opacity: 0.3,
                            animation: `shimmer ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Side Accent Bars - Left */}
            <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 z-20">
                <div className="h-1/3 bg-[#D4AF37]" />
                <div className="h-1/3 bg-[#1F3D2B]" />
                <div className="h-1/3 bg-[#BFA76A]" />
            </div>

            {/* Side Accent Bars - Right */}
            <div className="absolute right-0 top-0 bottom-0 w-3 md:w-4 z-20">
                <div className="h-1/3 bg-[#BFA76A]" />
                <div className="h-1/3 bg-[#1F3D2B]" />
                <div className="h-1/3 bg-[#D4AF37]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center px-8 md:px-16 lg:px-24">
                <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-24">

                    {/* Left - Typography */}
                    <div className={`text-white space-y-6 transition-all duration-700 ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                        {/* Badge */}
                        {current.badge && (
                            <span
                                className="inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}88)`,
                                    boxShadow: `0 0 30px ${current.accentColor}66`
                                }}
                            >
                                {current.badge}
                            </span>
                        )}

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-none tracking-tight">
                            <span className="block text-white drop-shadow-2xl">{current.headline}</span>
                            <span
                                className="block mt-2"
                                style={{
                                    color: current.accentColor,
                                    textShadow: `0 0 60px ${current.accentColor}88`
                                }}
                            >
                                {current.subline}
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p className="text-lg md:text-xl text-gray-300 max-w-md leading-relaxed font-light">
                            {current.tagline}
                        </p>

                        {/* CTA */}
                        <div className="pt-4">
                            <a
                                href="/shop"
                                className="group inline-flex items-center gap-3 py-4 px-8 text-sm font-medium uppercase tracking-widest transition-all duration-500"
                                style={{
                                    background: current.accentColor,
                                    boxShadow: `0 0 40px ${current.accentColor}44`
                                }}
                            >
                                <span>Shop Now</span>
                                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Right - Product Image */}
                    <div className="relative flex justify-center items-center">
                        {/* Glow Effect Behind Product */}
                        <div
                            className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full blur-3xl opacity-60 transition-all duration-1000"
                            style={{
                                background: `radial-gradient(circle, ${current.accentColor}88 0%, transparent 70%)`,
                                animation: 'pulseGlow 3s ease-in-out infinite'
                            }}
                        />

                        {/* Product Image */}
                        <div
                            className={`relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 transition-all duration-700 ${isAnimating ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}`}
                            style={{
                                animation: 'float 4s ease-in-out infinite',
                                filter: `drop-shadow(0 0 60px ${current.accentColor}66)`
                            }}
                        >
                            <Image
                                src={current.image}
                                alt={current.headline}
                                fill
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* Decorative Ring */}
                        <div
                            className="absolute w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] border-2 rounded-full opacity-30 transition-all duration-1000"
                            style={{
                                borderColor: current.accentColor,
                                animation: 'spin 20s linear infinite'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
                aria-label="Previous slide"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={handleNext}
                className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
                aria-label="Next slide"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${index === currentSlide
                                ? 'w-8 bg-white'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Bottom Legal Text */}
            <div className="absolute bottom-4 left-8 right-8 z-20">
                <p className="text-[10px] text-gray-500 text-center">
                    HTK Enterprises © 2025 | All products are 100% organic, ethically sourced from Tamil Nadu, India.
                </p>
            </div>
        </section>
    );
}
