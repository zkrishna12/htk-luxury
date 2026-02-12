import ProductShowcase from '@/components/ProductShowcase';

export const metadata = {
    title: 'Featured Products | HTK Enterprises',
    description: 'Discover our premium organic products - Wild Honey, Culinary Turmeric, and Country Sugar from Tamil Nadu.',
};

export default function FeaturedPage() {
    return (
        <main>
            <ProductShowcase />
        </main>
    );
}
