import React from 'react';
import EnterpriseContactForm from '@/components/EnterpriseContactForm';
import LuxuryFrame from '@/components/LuxuryFrame';

// Step 6: Corporate Gifting Page (Decision-Maker UX)

const hampers = [
    {
        title: 'The Chairman’s Selection',
        description: 'A commanding assortment of wild forest honey, saffron, and premium nuts. Designed for the highest tier of leadership.',
        tags: ['Premium', 'Wellness', 'Legacy']
    },
    {
        title: 'The Conscious Collective',
        description: 'Zero-waste packaging containing organic teas and sustainable desk essentials. A statement of modern responsibility.',
        tags: ['Sustainable', 'Tea', 'Modern']
    },
    {
        title: 'Festive Grandeur',
        description: 'A celebration of abundance. Traditional spices, curated sweets, and ceremonial artifacts.',
        tags: ['Celebration', 'Heritage', 'Large Volume']
    }
];

export default function CorporatePage() {
    return (
        <LuxuryFrame className="text-[var(--color-primary)]">

            {/* Corporate Hero */}
            <section className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-fade-in bg-[var(--color-bg-neutral)]">
                <span className="text-[var(--color-accent)] uppercase tracking-[0.3em] text-sm mb-6">Refined & Purposeful</span>
                <h1 className="text-4xl md:text-6xl font-serif leading-tight mb-8">
                    A Message<br />Without Words.
                </h1>
                <p className="max-w-xl font-sans text-lg opacity-80 leading-relaxed">
                    Corporate gifting is not an obligation. It is a reflection of values.
                    Establish connection through curated expressions of nature.
                </p>
            </section>

            {/* Philosophy / Why Gifting Matters */}
            <section className="luxury-container py-32 text-center">
                <h2 className="text-3xl font-serif mb-16">The Art of Retention</h2>
                <div className="grid md:grid-cols-3 gap-12 font-sans opacity-80 leading-relaxed">
                    <div>
                        <h3 className="uppercase tracking-widest text-xs mb-4 text-[var(--color-accent)]">Impression</h3>
                        <p>Stand apart from generic gestures. We offer exclusivity that cannot be gathered from shelves.</p>
                    </div>
                    <div>
                        <h3 className="uppercase tracking-widest text-xs mb-4 text-[var(--color-accent)]">Alignment</h3>
                        <p>Align your brand with health, sustainability, and ethical stewardship of the earth.</p>
                    </div>
                    <div>
                        <h3 className="uppercase tracking-widest text-xs mb-4 text-[var(--color-accent)]">Detail</h3>
                        <p>From the texture of the box to the handwritten note, every element is a touchpoint of luxury.</p>
                    </div>
                </div>
            </section>

            {/* Hamper Collections */}
            <section className="py-24 bg-[var(--color-primary)] text-[var(--color-background)]">
                <div className="luxury-container">
                    <h2 className="text-4xl font-serif mb-24 text-center">Curated Collections</h2>

                    <div className="space-y-32">
                        {hampers.map((hamper, idx) => (
                            <div key={idx} className="grid md:grid-cols-2 gap-16 items-center border-b border-[var(--color-accent)] border-opacity-30 pb-16 last:border-0">
                                <div className="space-y-6">
                                    <div className="flex gap-4 mb-4">
                                        {hamper.tags.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase tracking-widest border border-[var(--color-accent)] px-3 py-1 rounded-full text-[var(--color-accent)]">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="text-3xl font-serif">{hamper.title}</h3>
                                    <p className="opacity-80 leading-relaxed max-w-md">{hamper.description}</p>
                                </div>
                                <div className="text-right hidden md:block opacity-20 text-9xl font-serif">
                                    {idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise Contact Form */}
            <section className="py-32">
                <div className="luxury-container">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif mb-4">Private Consultation</h2>
                        <p className="opacity-60">For bulk requirements and customization.</p>
                    </div>
                    <EnterpriseContactForm />
                </div>
            </section>

        </LuxuryFrame>
    );
}
