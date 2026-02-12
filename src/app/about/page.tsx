import React from 'react';
import Image from 'next/image';
import LuxuryFrame from '@/components/LuxuryFrame';

// Step: About Us Page - 100 Year Refinement

export default function AboutPage() {
    return (
        <LuxuryFrame className="min-h-screen">

            {/* Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in relative z-10">
                <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-sm mb-6">Our Philosophy</span>
                <h1 className="text-5xl md:text-8xl font-serif leading-tight mb-8">
                    Nurtured by Nature.<br />Delivered with Love.
                </h1>
                <div className="h-24 w-[1px] bg-[var(--color-primary)] opacity-20"></div>
            </section>

            {/* Narrative */}
            <section className="luxury-container grid md:grid-cols-2 gap-16 items-center py-24 relative z-10">
                <div className="space-y-10 font-serif text-2xl md:text-3xl leading-relaxed opacity-80">
                    <p>
                        HTK Enterprises was born from a simple yet profound belief: that nature,
                        when respected, provides everything we need.
                    </p>
                    <p>
                        We are not manufacturers; we are custodians of tradition. Journeying into the silent
                        hills of Thandikudi and the sun-drenched fields of Tamil Nadu, we bring
                        you products that have not been touched by machines, only by hands—preserving
                        a legacy that tastes of home.
                    </p>
                </div>
                <div className="h-[600px] w-full relative bg-[var(--color-bg-neutral)] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                    <Image
                        src="/origin-story.png"
                        alt="Our Origins"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </section>

            {/* Leadership / Founder Story */}
            <section className="py-32 bg-[var(--color-bg-ivory)] relative z-20">
                <div className="luxury-container grid md:grid-cols-12 gap-12 items-start">
                    <div className="md:col-span-4 space-y-4 sticky top-32">
                        <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-xs">The Visionary</span>
                        <h2 className="text-4xl font-serif">Narmadha Krishna Swamy</h2>
                        <p className="font-sans text-sm uppercase tracking-widest opacity-60">Founder & CEO</p>
                        <div className="h-1 w-24 bg-[var(--color-primary)] opacity-20 mt-4"></div>
                    </div>

                    <div className="md:col-span-8 space-y-8 text-lg leading-loose opacity-80 font-sans">
                        <p className="first-letter:text-5xl first-letter:float-left first-letter:mr-4 first-letter:font-serif">
                            A bold example of women's entrepreneurship in India, Narmadha stands as the solitary pillar
                            behind HTK's operations. Born in Andhra Pradesh and raised in Telangana, she now calls
                            Coimbatore home, bringing a rich cultural tapestry to her work.
                        </p>
                        <p>
                            With a "never give up" attitude and a straightforward vision, she manages every facet of
                            this startup—from finance and marketing to the complex logistics of organic supply chains.
                            She is the force that ensures every jar of honey and every grain of spice meets the highest
                            standard of purity.
                        </p>
                        <p className="text-sm italic opacity-60 mt-4 border-l-2 border-[var(--color-accent)] pl-4 py-2">
                            Supported by the strategic ideation of her husband, Krishna Swamy Muniyandi (IT Professional),
                            Narmadha has built HTK from a concept into a trusted brand.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-32 bg-[var(--color-primary)] text-[var(--color-background)] relative z-10">
                <div className="luxury-container grid md:grid-cols-3 gap-16 text-center">
                    <div className="space-y-6 group cursor-default">
                        <h3 className="text-3xl font-serif text-[var(--color-accent)] group-hover:italic transition-all">Purity</h3>
                        <p className="opacity-80 leading-relaxed font-light">
                            No additives. No preservatives. Just the raw, unadulterated essence of the harvest.
                            We believe in food as medicine.
                        </p>
                    </div>
                    <div className="space-y-6 group cursor-default">
                        <h3 className="text-3xl font-serif text-[var(--color-accent)] group-hover:italic transition-all">Community</h3>
                        <p className="opacity-80 leading-relaxed font-light">
                            We empower local farmers and tribal communities, ensuring fair trade and
                            sustainable livelihoods for the guardians of our land.
                        </p>
                    </div>
                    <div className="space-y-6 group cursor-default">
                        <h3 className="text-3xl font-serif text-[var(--color-accent)] group-hover:italic transition-all">Sustainability</h3>
                        <p className="opacity-80 leading-relaxed font-light">
                            From earth-friendly packaging to traditional farming methods, we ensure
                            our footprint is as light as a leaf.
                        </p>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="py-48 text-center luxury-container relative z-10">
                <p className="text-lg uppercase tracking-widest mb-8 opacity-60">Join our journey</p>
                <h2 className="text-4xl md:text-6xl font-serif max-w-4xl mx-auto leading-tight">
                    "To plant a garden is to believe in tomorrow."
                </h2>
            </section>
        </LuxuryFrame>
    );
}
