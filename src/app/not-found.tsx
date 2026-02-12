import Link from 'next/link';
import LuxuryFrame from '@/components/LuxuryFrame';

export default function NotFound() {
    return (
        <LuxuryFrame className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-9xl font-serif text-[var(--color-primary)] opacity-10">404</h1>
            <h2 className="text-3xl md:text-5xl font-serif text-[var(--color-primary)] mt-8 mb-6">
                You have wandered off the path.
            </h2>
            <p className="max-w-md mx-auto text-[var(--color-primary)] opacity-60 leading-relaxed font-sans mb-12">
                Even in the wilderness, one can find their way back. The garden is just a step away.
            </p>
            <Link
                href="/"
                className="px-8 py-3 bg-[var(--color-primary)] text-[var(--color-background)] uppercase tracking-widest text-xs hover:bg-[var(--color-accent)] transition-colors"
            >
                Return Home
            </Link>
        </LuxuryFrame>
    );
}
