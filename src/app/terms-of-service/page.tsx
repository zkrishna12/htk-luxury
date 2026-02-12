import React from 'react';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function TermsOfService() {
    return (
        <LuxuryFrame className="py-32 px-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">

                <header className="space-y-4 border-b border-[var(--color-primary)]/10 pb-12">
                    <h1 className="text-4xl md:text-5xl font-serif">Terms of Service</h1>
                    <p className="opacity-60 uppercase tracking-widest text-xs">Effective Date: December 2025</p>
                </header>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">1. Acceptance of Terms</h2>
                    <p className="opacity-80 leading-relaxed">
                        By accessing and using the HTK Enterprises website ("Service"), you agree to comply with and be bound by these
                        Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">2. Organic Product Disclaimer</h2>
                    <p className="opacity-80 leading-relaxed">
                        Our products are purely natural and organic. As such, slight variations in color, texture, and taste
                        may occur between batches due to seasonal changes. This is not a defect but a hallmark of purity.
                        Unlike mass-produced items, our goods are not chemically standardized.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">3. Orders & Pricing</h2>
                    <p className="opacity-80 leading-relaxed">
                        Prices for our products are subject to change without notice. We reserve the right to limit the
                        sales of our products to any person, geographic region, or jurisdiction. We reserve the right
                        to refuse any order you place with us.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">4. Shipping & Returns</h2>
                    <p className="opacity-80 leading-relaxed">
                        <strong>Shipping:</strong> We aim to dispatch all orders within 24-48 hours. Delivery times vary by location.<br />
                        <strong>Returns:</strong> Due to the perishable nature of food products, we do not accept returns unless the
                        package is damaged upon arrival. In such cases, please contact support@htkenterprises.net within 24 hours
                        with photographic evidence.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">5. Governing Law</h2>
                    <p className="opacity-80 leading-relaxed">
                        These Terms shall be governed and construed in accordance with the laws of India. Any disputes arising
                        hereunder shall be subject to the exclusive jurisdiction of the courts in Dindigul, Tamil Nadu.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">6. Contact Information</h2>
                    <p className="opacity-80 leading-relaxed">
                        Questions about the Terms of Service should be sent to us at support@htkenterprises.net.
                    </p>
                </section>

            </div>
        </LuxuryFrame>
    );
}
