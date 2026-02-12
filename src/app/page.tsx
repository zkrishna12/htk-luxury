import React from 'react';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Premium Hero Section */}
      <HeroSection />

      {/* Navigation Paths */}
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

      {/* Philosophy Teaser */}
      <section className="py-24 px-8 bg-[var(--color-background)]">
        <div className="max-w-2xl mx-auto font-serif text-2xl md:text-3xl text-[var(--color-primary)] opacity-80 leading-relaxed text-center relative z-10">
          <p className="mb-0">
            We believe food should be pure, honest, and traceable.
          </p>
          <p className="mb-0">
            We believe gifting should carry meaning, not noise.
          </p>
        </div>
      </section>

      {/* Trust Badge */}
      <section className="py-16 bg-[var(--color-bg-warm)]">
        <div className="max-w-4xl mx-auto text-center px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">
            Trusted Since 2023
          </p>
          <p className="font-serif text-xl text-[var(--color-primary)] opacity-70">
            3 years of delivering nature's finest to discerning homes and businesses across India.
          </p>
        </div>
      </section>
    </main>
  );
}

