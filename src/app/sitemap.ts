import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://htk-shop-2025.web.app';

    // Core Pages
    const routes = [
        '',
        '/shop',
        '/about',
        '/organic',
        '/corporate-gifting',
        '/enquiry',
        '/reviews',
        '/privacy-policy',
        '/terms-of-service',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
