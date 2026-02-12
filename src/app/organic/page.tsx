'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LuxuryFrame from '@/components/LuxuryFrame';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { products as libProducts } from '@/lib/products';

const narrativeProducts = [
    {
        id: 'honey-500',
        name: 'Wild Forest/Mountain Honey',
        tagline: 'From Thandikudi Hills. Untouched.',
        story: 'Harvested from the pristine Thandikudi hills of Southern India, where nature remains untouched. Sourced from wild, naturally foraging bees, this honey reflects the purity of medicinal herbs and native flora. Left raw, unprocessed, and free from additives to preserve its natural enzymes.',
        origin: 'Thandikudi Hills, South India',
        harvest: 'Latest Harvest',
        image: '/shop-honey.jpg'
    },
    {
        id: 'manjal-100',
        name: 'Kasturi Manjal (Wild Turmeric)',
        tagline: 'Pure in origin. Timeless in tradition.',
        story: 'Sourced from the southern regions of India, traditionally cultivated for its aromatic and wellness value. Unlike culinary turmeric, Kasturi Manjal is cherished for its natural fragrance and skin-enhancing gentle potency. Sun-dried and finely ground using traditional methods.',
        origin: 'South India',
        harvest: 'Latest Harvest',
        image: '/shop-turmeric-pkg.jpg'
    },
    {
        id: 'turmeric-100',
        name: 'Heirloom Turmeric',
        tagline: 'Born of the soil. Preserved by tradition.',
        story: 'Sourced from the fertile southern regions of Tamil Nadu. Cultivated with patience and deep respect for the land. Enriched by mineral-rich soil, this turmeric is known for its deep color and superior potency. Traditionally boiled, sun-dried, and stone-ground to preserve curcumin content.',
        origin: 'Tamil Nadu, South India',
        harvest: 'Latest Harvest',
        image: '/culinary-turmeric.png'
    },
    {
        id: 'sugar-500',
        name: 'Pure Country Sugar',
        tagline: 'Born in Southern Tamil Nadu.',
        story: 'Sourced from the fertile southern heartlands of Tamil Nadu, renowned for centuries-old sugarcane traditions. Produced using low-intervention methods, this sugar retains natural minerals and a warm golden hue. Free from chemical refining or whitening.',
        origin: 'Tamil Nadu, South India',
        harvest: 'Latest Harvest',
        image: '/shop-sugar.jpg'
    },
    {
        id: 'coffee-instant',
        name: 'Premium Instant Coffee',
        tagline: 'The Honest Yield of the Earth',
        story: 'Procured beans from Ooty, Gudaloor & Coorg. Hand picked and prepared using a chemical-free amalgamation method. This premium instant coffee dissolves perfectly in both Hot and Cold Milk, offering a pure, unadulterated coffee experience.',
        origin: 'Ooty, Gudaloor & Coorg',
        harvest: 'Launching Jan 15, 2026',
        image: '/shop-coffee-v2.jpg'
    }
];

// Color themes for each product - luxury, subtle, on-brand
const colorThemes = [
    { bg: '#FFF8E7', accent: '#D4AF37', border: '#BFA76A' }, // Warm Honey Gold
    { bg: '#FFF4E0', accent: '#E8B44C', border: '#D4A843' }, // Golden Turmeric
    { bg: '#FFF0E6', accent: '#CD7F32', border: '#B8702C' }, // Rich Spice Terracotta
    { bg: '#FAF7F2', accent: '#C9B99A', border: '#B5A689' }, // Natural Sugar Beige
    { bg: '#F5F0EB', accent: '#8B6F47', border: '#7A5E3A' }  // Deep Coffee Brown
];

export default function OrganicPage() {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const getProductDetails = (id: string) => {
        return libProducts.find(p => p.id === id) || null;
    };

    return (
        <LuxuryFrame className="text-[var(--color-primary)]">

            {/* Organic Hero */}
            <section className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-sm mb-6">Nature, Untouched</span>
                <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
                    The Earth’s<br />Honest Yield.
                </h1>
                <p className="max-w-xl font-sans text-lg opacity-80 leading-relaxed">
                    Our organic products are not created. They are preserved.
                    Harvested with patience. Delivered with responsibility.
                </p>
            </section>

            {/* Origin Story */}
            <section className="luxury-container py-32 grid md:grid-cols-2 gap-16 items-center">
                <div className="h-[500px] w-full rounded-sm relative overflow-hidden group">
                    <Image
                        src="/origin-story.png"
                        alt="Organic Farming"
                        fill
                        className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                        unoptimized
                    />
                </div>
                <div className="space-y-8">
                    <h2 className="text-4xl font-serif">Grounded in Respect.</h2>
                    <p className="font-sans text-lg opacity-80 leading-relaxed">
                        We work directly with farmers who treat the soil as a living entity.
                        No chemicals. No shortcuts. Just the rhythm of the seasons and the
                        wisdom of generations.
                    </p>
                </div>
            </section>

            {/* Product Narratives */}
            <section className="space-y-24">
                {narrativeProducts.map((product, index) => {
                    const theme = colorThemes[index];
                    return (
                        <div
                            key={product.id}
                            className="w-full py-24"
                            style={{ backgroundColor: theme.bg }}
                        >
                            <div className={`luxury-container grid md:grid-cols-2 gap-24 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                                <div
                                    className={`h-[600px] relative overflow-hidden group shadow-lg ${index % 2 === 1 ? 'md:col-start-2' : ''}`}
                                    style={{ backgroundColor: theme.accent + '20' }}
                                >
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                                        unoptimized
                                    />
                                    {/* Logo Overlay */}
                                    <div className="absolute top-4 left-4 w-12 h-12 opacity-80 z-10 pointer-events-none">
                                        <Image
                                            src="/logo.png"
                                            alt="HTK Logo"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <span
                                        className="block font-serif italic text-2xl"
                                        style={{ color: theme.accent }}
                                    >
                                        {product.tagline}
                                    </span>
                                    <h3 className="text-5xl font-serif">{product.name}</h3>

                                    <div className="flex gap-8 text-sm uppercase tracking-widest opacity-60 border-t border-[var(--color-primary)] pt-4 mt-4">
                                        <span>Origin: {product.origin}</span>
                                        <span>Harvest: {product.harvest}</span>
                                    </div>

                                    <p className="text-lg leading-loose opacity-80 font-sans">
                                        {product.story}
                                    </p>

                                    <button
                                        onClick={() => setSelectedProductId(product.id)}
                                        className="mt-8 px-8 py-4 border transition-all duration-700 uppercase tracking-widest text-xs"
                                        style={{
                                            borderColor: theme.border,
                                            color: theme.accent
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = theme.accent;
                                            e.currentTarget.style.color = '#FFFFFF';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = theme.accent;
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Certifications */}
            <section className="py-24 bg-[var(--color-bg-cream)] text-center">
                <div className="luxury-container">
                    <p className="uppercase tracking-[0.2em] mb-12 opacity-60">Purity Verified By Science</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 text-lg md:text-xl font-serif">
                        <span>TC 6060 Accredited Lab Tested</span>
                        <span>ISO 17025 Certified</span>
                        <span>ISO 9001 Certified</span>
                    </div>
                </div>
            </section>

            {/* Soft CTA */}
            <section className="py-48 text-center">
                <h2 className="text-4xl md:text-5xl font-serif mb-12">Begin your journey to health.</h2>
                <Link href="/shop" className="text-lg border-b border-[var(--color-primary)] pb-1 hover:opacity-50 transition-opacity">
                    Explore the Full Collection
                </Link>
            </section>

            {/* Modal */}
            <ProductDetailsModal
                isOpen={!!selectedProductId}
                onClose={() => setSelectedProductId(null)}
                product={selectedProductId ? getProductDetails(selectedProductId) : null}
            />

        </LuxuryFrame>
    );
}
