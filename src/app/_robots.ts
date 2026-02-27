import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/private/'],
        },
        sitemap: 'https://htk-shop-2025.web.app/sitemap.xml',
    };
}
