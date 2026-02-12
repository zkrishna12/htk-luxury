import Script from 'next/script';

/**
 * Structured Data component for SEO.
 * Provides JSON-LD schema for Organization.
 */
export default function StructuredData() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'HTK Enterprises',
        url: 'https://www.htkenterprises.net',
        logo: 'https://www.htkenterprises.net/logo.png',
        description: 'Premium organic products and corporate gifting solutions from India',
        foundingDate: '2023',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Dindigul',
            addressRegion: 'Tamil Nadu',
            postalCode: '624708',
            addressCountry: 'IN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-8438380900',
            contactType: 'customer service',
            email: 'support@htkenterprises.net',
            availableLanguage: ['English', 'Hindi', 'Tamil'],
        },
        sameAs: [
            'https://www.instagram.com/naturesorganichoney',
        ],
    };

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'HTK Enterprises',
        image: 'https://www.htkenterprises.net/logo.png',
        priceRange: '₹₹',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Dindigul',
            addressLocality: 'Dindigul',
            addressRegion: 'Tamil Nadu',
            postalCode: '624708',
            addressCountry: 'IN',
        },
        telephone: '+91-8438380900',
        openingHours: 'Mo-Sa 09:00-18:00',
    };

    return (
        <>
            <Script
                id="organization-schema"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            <Script
                id="local-business-schema"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
        </>
    );
}
