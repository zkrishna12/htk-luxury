import React from 'react';

interface LuxuryFrameProps {
    children: React.ReactNode;
    className?: string; // Allow passing extra classes like padding or layout specific
}

/**
 * LuxuryFrame Component
 * Wraps content in the "Heritage Frame" (Double border + Corner Accents)
 * Ensures consistent premium branding across all pages.
 */
export default function LuxuryFrame({ children, className = '' }: LuxuryFrameProps) {
    return (
        <div className={`relative min-h-screen luxury-frame ${className}`}>
            {/* Corner Accents - Fixed to the frame container */}
            <div className="corner-accent corner-tl"></div>
            <div className="corner-accent corner-tr"></div>
            <div className="corner-accent corner-bl"></div>
            <div className="corner-accent corner-br"></div>

            {/* Content Injection */}
            {children}
        </div>
    );
}
