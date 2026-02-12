import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'HTK Enterprises - Organic Luxury',
        short_name: 'HTK',
        description: 'Premium organic honey, turmeric, and country sugar. Corporate gifting solutions from Dindigul, India.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8F6F2',
        theme_color: '#1F3D2B',
        orientation: 'portrait-primary',
        categories: ['shopping', 'food', 'lifestyle'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}

