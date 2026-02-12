import React from 'react';
import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[var(--color-bg-warm)] z-[9999] flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 animate-pulse">
                <Image
                    src="/logo.png"
                    alt="Loading..."
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                />
            </div>
            <p className="mt-8 text-[var(--color-primary)] uppercase tracking-[0.2em] text-xs opacity-60 animate-bounce">
                Gathering...
            </p>
        </div>
    );
}
