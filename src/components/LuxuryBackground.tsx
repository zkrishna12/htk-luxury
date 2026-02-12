'use client';

import React, { useEffect, useRef } from 'react';

/**
 * LuxuryBackground Component
 * Renders a subtle "Gold Dust" particle effect on a HTML5 Canvas.
 * Designed for performance (GPU) and aesthetics (Ivory + Gold Theme).
 */
export default function LuxuryBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Configuration
        const PARTICLE_COUNT = 80; // More visible stars
        const COLOR_ACCENT = '191, 167, 106'; // #BFA76A in RGB (Muted Gold)
        const COLOR_BRIGHT = '255, 223, 128'; // #FFDF80 in RGB (Bright Gold)

        // Resize Handler
        const handleResize = () => {
            if (!canvas) return;
            // Handle High DPI Displays
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);

            // Set logic dimensions for styling
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Reset particles on substantial resize
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;
            pulseSpeed: number;
            pulseOffset: number;
            isShiny: boolean;

            constructor() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;

                // Randomly assign "Shiny" status (~30%)
                this.isShiny = Math.random() < 0.3;

                // Much Larger Stars
                this.size = Math.random() * 3.0 + 3.0;
                // Slow upward float (bubbles/pollen)
                this.speedY = Math.random() * 0.2 + 0.05;
                // Reduced Opacity (max 50%)
                this.opacity = Math.random() * 0.3 + 0.2;

                // Twinkle effect
                // Shiny particles pulse much faster
                this.pulseSpeed = this.isShiny
                    ? Math.random() * 0.05 + 0.03  // Fast shine
                    : Math.random() * 0.02 + 0.005; // Normal pulse

                this.pulseOffset = Math.random() * Math.PI * 2;
            }

            update() {
                // Move Up
                this.y -= this.speedY;

                // Reset to bottom if off screen
                if (this.y < -10) {
                    this.y = window.innerHeight + 10;
                    this.x = Math.random() * window.innerWidth;
                }

                // Twinkle
                this.pulseOffset += this.pulseSpeed;
            }

            draw() {
                if (!ctx) return;

                // Calculate current opacity based on pulse
                let currentOpacity;
                let currentColor = COLOR_ACCENT;

                if (this.isShiny) {
                    // Sharp Blink Effect: Use Power function for "spiky" pulse
                    // Ranges from 0 to 1 very sharply
                    const pulse = (Math.sin(this.pulseOffset) + 1) / 2; // 0 to 1
                    const sharpPulse = Math.pow(pulse, 6); // Sharp peak

                    currentOpacity = 0.1 + (sharpPulse * 0.4); // Min 0.1, Max 0.5
                    currentColor = COLOR_BRIGHT; // Brighter Gold
                } else {
                    // Standard subtle pulse
                    currentOpacity = this.opacity + Math.sin(this.pulseOffset) * 0.1;
                }

                ctx.beginPath();
                // Draw Star
                // x, y, spikes(4), outerRadius(size), innerRadius(size/2)
                drawStar(ctx, this.x, this.y, 4, this.size, this.size / 2);
                ctx.fillStyle = `rgba(${currentColor}, ${currentOpacity})`;
                ctx.fill();
            }
        }

        const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        };

        const render = () => {
            if (!canvas || !ctx) return;

            // Clear canvas (Transparent)
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Update & Draw
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        // Initialize
        handleResize();
        window.addEventListener('resize', handleResize);

        // Start Loop (Check reduced motion preference)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            render();
        } else {
            // Render once for static decoration
            initParticles();
            particles.forEach(p => p.draw());
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
