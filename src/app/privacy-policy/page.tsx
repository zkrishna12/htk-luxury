import React from 'react';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function PrivacyPolicy() {
    return (
        <LuxuryFrame className="py-32 px-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">

                <header className="space-y-4 border-b border-[var(--color-primary)]/10 pb-12">
                    <h1 className="text-4xl md:text-5xl font-serif">Privacy Policy</h1>
                    <p className="opacity-60 uppercase tracking-widest text-xs">Last Updated: December 2025</p>
                </header>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">1. Our Commitment to Security</h2>
                    <p className="opacity-80 leading-relaxed">
                        At HTK Enterprises ("We", "Us"), your privacy is not just a regulatory requirement; it is a bond of trust.
                        We are committed to maintaining the highest level of security for your personal information. We utilize
                        industry-standard encryption protocols (SSL/TLS) to protect data transmission and secure servers for storage.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">2. Information We Collect</h2>
                    <ul className="list-disc pl-5 opacity-80 space-y-2 leading-relaxed">
                        <li><strong>Personal Identity:</strong> Name, Email Address, Phone Number (for order verification).</li>
                        <li><strong>Shipping Details:</strong> Physical address and postal code for delivery.</li>
                        <li><strong>Transaction Data:</strong> We do NOT store your credit card or banking password. All payments are processed via Razorpay's secure, PCI-DSS compliant gateway.</li>
                    </ul>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">3. Usage of Information</h2>
                    <p className="opacity-80 leading-relaxed">
                        Your data is used solely for the purpose of fulfilling your orders, communicating shipment updates, and
                        improving your experience on our platform. We do not sell, trade, or rent your personal identity information
                        to any third party.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">4. Cookies & Tracking</h2>
                    <p className="opacity-80 leading-relaxed">
                        We use minimal cookies to maintain your session (e.g., keeping your cart active). We do not use intrusive
                        tracking mechanisms. Analytics are aggregated and anonymized to understand site performance.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif">5. Contact Officer</h2>
                    <p className="opacity-80 leading-relaxed">
                        For any privacy-related concerns or data deletion requests, please contact our Privacy Officer at:<br />
                        <strong>Email:</strong> support@htkenterprises.net<br />
                        <strong>Address:</strong> HTK Enterprises, Dindigul, TN, India, 624708.
                    </p>
                </section>

            </div>
        </LuxuryFrame>
    );
}
