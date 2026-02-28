'use client';

import React, { useState, useMemo } from 'react';
import Script from 'next/script';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import LuxuryFrame from '@/components/LuxuryFrame';

// ─── FAQ Data ────────────────────────────────────────────────────────────────

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    label: string;
    items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
    {
        label: 'Ordering & Payment',
        items: [
            {
                question: 'How do I place an order?',
                answer: 'Browse products, add to cart, proceed to checkout, enter shipping details, and pay via Razorpay (UPI, cards, wallets, net banking).',
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept UPI, credit/debit cards, net banking, and digital wallets through Razorpay. Cash on delivery is not available currently.',
            },
            {
                question: 'Can I modify my order after placing it?',
                answer: 'Orders cannot be modified once payment is confirmed. Please contact us on WhatsApp at 8838660900 for urgent requests.',
            },
            {
                question: 'Is there a minimum order value?',
                answer: 'No minimum order value. However, orders above ₹999 get free shipping.',
            },
        ],
    },
    {
        label: 'Shipping & Delivery',
        items: [
            {
                question: 'How long does delivery take?',
                answer: 'Tamil Nadu: 2–3 business days. Other states: 4–5 business days.',
            },
            {
                question: 'Do you ship internationally?',
                answer: 'Currently we ship within India only. International shipping coming soon.',
            },
            {
                question: 'How can I track my order?',
                answer: 'Log in and visit "My Orders" to see real-time tracking with status updates.',
            },
            {
                question: 'Is shipping free?',
                answer: 'Free shipping on orders above ₹999. Standard shipping charges apply for smaller orders.',
            },
        ],
    },
    {
        label: 'Products & Quality',
        items: [
            {
                question: 'Are your products really organic?',
                answer: 'Yes, 100%. All our products are sourced directly from organic farms in Tamil Nadu with no chemicals, preservatives, or artificial processing.',
            },
            {
                question: 'What is the shelf life of your products?',
                answer: 'Honey: 24 months. Country Sugar: 18 months. Turmeric: 12 months. Coffee: 12 months. Store in a cool, dry place.',
            },
            {
                question: 'How is your honey different from store-bought?',
                answer: 'Our honey is raw, unfiltered, and never heated. Store-bought honey is often pasteurized and diluted, destroying natural enzymes.',
            },
            {
                question: 'What is Kasturi Manjal used for?',
                answer: 'Kasturi Manjal (wild turmeric) is used for skincare — face packs, reducing acne, and brightening complexion. It does not stain like culinary turmeric.',
            },
        ],
    },
    {
        label: 'Returns & Refunds',
        items: [
            {
                question: 'What is your return policy?',
                answer: '7-day return window from delivery. Products must be unopened and in original packaging.',
            },
            {
                question: 'How do I request a return?',
                answer: 'Visit our Returns & Refunds page, fill out the return request form, and we\'ll contact you within 24 hours.',
            },
            {
                question: 'When will I get my refund?',
                answer: 'Refunds are processed within 5–7 business days to your original payment method.',
            },
        ],
    },
    {
        label: 'Rewards & Loyalty',
        items: [
            {
                question: 'How do I earn reward points?',
                answer: 'Earn 1 point for every ₹10 spent. Points are credited automatically after successful payment.',
            },
            {
                question: 'How do I redeem points?',
                answer: '100 points = ₹10 discount. Apply points at checkout in the cart.',
            },
            {
                question: 'What are the reward tiers?',
                answer: 'Bronze (0–499 pts), Silver (500–999, 2% extra), Gold (1000–1999, 5% extra), Platinum (2000+, 8% extra).',
            },
        ],
    },
];

// Flat list for JSON-LD and search
const ALL_FAQS: FAQItem[] = FAQ_DATA.flatMap(cat => cat.items);

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({
    item,
    isOpen,
    onToggle,
}: {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className="border border-[var(--color-primary)]/10 bg-white transition-all duration-200"
            style={isOpen ? { borderColor: '#D4AF3766' } : {}}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group"
                aria-expanded={isOpen}
            >
                <span className="font-serif text-base text-[var(--color-primary)] leading-snug group-hover:text-[#D4AF37] transition-colors">
                    {item.question}
                </span>
                <span
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-300"
                    style={{
                        borderColor: isOpen ? '#D4AF37' : '#1F3D2B33',
                        background: isOpen ? '#D4AF37' : 'transparent',
                        color: isOpen ? 'white' : '#1F3D2B',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="6" y1="1" x2="6" y2="11" />
                        <line x1="1" y1="6" x2="11" y2="6" />
                    </svg>
                </span>
            </button>

            {/* Animated answer */}
            <div
                style={{
                    maxHeight: isOpen ? '400px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 350ms ease',
                }}
            >
                <div className="px-6 pb-5 text-sm opacity-75 leading-relaxed font-sans border-t border-[var(--color-primary)]/5 pt-4">
                    {item.answer}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQPage() {
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...FAQ_DATA.map(c => c.label)];

    // Filter FAQs based on search + category
    const filteredData = useMemo<FAQCategory[]>(() => {
        const q = searchQuery.trim().toLowerCase();

        return FAQ_DATA
            .filter(cat => activeCategory === 'All' || cat.label === activeCategory)
            .map(cat => ({
                ...cat,
                items: cat.items.filter(item =>
                    !q ||
                    item.question.toLowerCase().includes(q) ||
                    item.answer.toLowerCase().includes(q)
                ),
            }))
            .filter(cat => cat.items.length > 0);
    }, [searchQuery, activeCategory]);

    const handleToggle = (key: string) => {
        setOpenKey(prev => (prev === key ? null : key));
    };

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: ALL_FAQS.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24">
            <Navigation />
            <CartDrawer />

            {/* JSON-LD FAQ structured data */}
            <Script
                id="faq-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Page Header */}
            <div className="luxury-container text-center mb-16 space-y-4">
                <div className="flex justify-center opacity-70">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--color-accent)]">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-accent)]">Help Centre</p>
                <h1 className="text-5xl md:text-6xl font-serif">Frequently Asked Questions</h1>
                <p className="opacity-60 max-w-xl mx-auto font-sans tracking-wide text-sm">
                    Everything you need to know about ordering, shipping, products, and more.
                </p>
            </div>

            {/* Search Bar */}
            <div className="luxury-container max-w-2xl mx-auto mb-8">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-40 pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search questions…"
                        className="w-full pl-11 pr-10 py-3.5 bg-white border border-[var(--color-primary)]/15 text-[var(--color-primary)] text-sm placeholder:opacity-35 focus:outline-none focus:border-[#D4AF37]/60 transition-colors shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-40 hover:opacity-80 transition-opacity text-xl leading-none"
                            aria-label="Clear search"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            {/* Category Pills */}
            <div className="luxury-container flex items-center gap-2 flex-wrap justify-center mb-12">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setActiveCategory(cat);
                            setOpenKey(null);
                        }}
                        className="px-4 py-1.5 text-xs font-medium border transition-all duration-200"
                        style={
                            activeCategory === cat
                                ? { background: '#1F3D2B', color: '#F8F6F2', borderColor: '#1F3D2B' }
                                : { background: 'transparent', color: '#1F3D2B', borderColor: '#1F3D2B40' }
                        }
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FAQ Accordion Groups */}
            <div className="luxury-container max-w-3xl mx-auto space-y-10">
                {filteredData.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <p className="font-serif text-xl opacity-50">No results found</p>
                        <p className="text-xs opacity-35">Try a different keyword or browse all categories</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            className="mt-2 px-6 py-2.5 border border-[var(--color-primary)]/30 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    filteredData.map(category => (
                        <div key={category.label} className="space-y-3">
                            {/* Category heading — only shown in "All" view */}
                            <div className="flex items-center gap-3 mb-4">
                                <span
                                    className="text-[10px] uppercase tracking-[0.4em] font-medium px-3 py-1"
                                    style={{ background: '#D4AF3715', color: '#D4AF37', border: '1px solid #D4AF3730' }}
                                >
                                    {category.label}
                                </span>
                                <div className="flex-1 h-px bg-[var(--color-primary)]/8" />
                            </div>

                            <div className="space-y-2">
                                {category.items.map((item, i) => {
                                    const key = `${category.label}-${i}`;
                                    return (
                                        <AccordionItem
                                            key={key}
                                            item={item}
                                            isOpen={openKey === key}
                                            onToggle={() => handleToggle(key)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Still Have Questions? */}
            <div className="luxury-container max-w-3xl mx-auto mt-20">
                <div
                    className="p-10 text-center space-y-6"
                    style={{ border: '1px solid #D4AF3740', background: '#FFFBEB' }}
                >
                    <div className="flex justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h2 className="font-serif text-2xl text-[var(--color-primary)]">Still have questions?</h2>
                    <p className="text-sm opacity-70 max-w-md mx-auto">
                        Our team is here to help. Reach out via WhatsApp for the fastest response, or send us an email.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                        <a
                            href="https://wa.me/918838660900"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 text-white text-sm font-medium transition-opacity hover:opacity-90"
                            style={{ background: '#25D366' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            WhatsApp: 8838660900
                        </a>
                        <a
                            href="mailto:support@htkenterprises.net"
                            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:opacity-90"
                            style={{ border: '1px solid #1F3D2B40', color: '#1F3D2B', background: 'white' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            support@htkenterprises.net
                        </a>
                    </div>
                </div>
            </div>

        </LuxuryFrame>
    );
}
