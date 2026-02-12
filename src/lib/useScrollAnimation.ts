'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll-triggered animations using Intersection Observer.
 * Elements with the 'scroll-animate' class will get 'visible' added when in view.
 * 
 * @param options - IntersectionObserver options
 * @returns ref to attach to a container element
 */
export function useScrollAnimation(options?: IntersectionObserverInit) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Respect user's reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Make all elements visible immediately
            const elements = containerRef.current?.querySelectorAll('.scroll-animate');
            elements?.forEach(el => el.classList.add('visible'));
            return;
        }

        const observerOptions: IntersectionObserverInit = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px',
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation to save resources
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = containerRef.current?.querySelectorAll('.scroll-animate');
        elements?.forEach(el => observer.observe(el));

        return () => {
            elements?.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }, [options]);

    return containerRef;
}

/**
 * Standalone function to initialize scroll animations on the page.
 * Use this for global scroll animations outside of React components.
 */
export function initScrollAnimations(selector = '.scroll-animate') {
    if (typeof window === 'undefined') return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll(selector).forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
}
