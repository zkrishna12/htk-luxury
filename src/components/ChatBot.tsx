'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'bot' | 'user';
    text: string;
    isWhatsApp?: boolean;
}

// ─── FAQ Engine ───────────────────────────────────────────────────────────────

const WHATSAPP_URL = 'https://wa.me/918838660900?text=' + encodeURIComponent('Hello HTK Enterprises! I need some help.');

interface FAQEntry {
    keywords: string[];
    response: string;
    isWhatsApp?: boolean;
}

const FAQ: FAQEntry[] = [
    {
        keywords: ['shipping', 'delivery', 'deliver', 'ship', 'dispatch'],
        response: 'We deliver across India. Tamil Nadu: 2–3 business days. Other states: 4–5 business days. Free shipping on orders above ₹999.',
    },
    {
        keywords: ['return', 'refund', 'exchange', 'replace'],
        response: 'We offer hassle-free returns within 7 days. Contact us via WhatsApp or email for return requests.',
    },
    {
        keywords: ['payment', 'pay', 'upi', 'card', 'razorpay', 'net banking', 'wallet'],
        response: 'We accept all major payment methods via Razorpay — UPI, credit/debit cards, net banking, and wallets.',
    },
    {
        keywords: ['organic', 'natural', 'chemical', 'preservative', 'farm'],
        response: 'All HTK products are 100% organic, sourced directly from farms in Tamil Nadu. No chemicals, no preservatives.',
    },
    {
        keywords: ['honey', 'mountain honey', 'small bee', 'bee honey'],
        response: 'Our Mountain Honey and Small Bee Honey are raw, unfiltered, and sourced from the Thandikudi hills.',
    },
    {
        keywords: ['turmeric', 'manjal', 'kasturi', 'haldi'],
        response: 'Our Kasturi Manjal is premium wild turmeric, perfect for skincare. Our Culinary Turmeric is farm-fresh for cooking.',
    },
    {
        keywords: ['order', 'track', 'tracking', 'my order', 'where is my', 'status'],
        response: 'You can track your orders on the Orders page after logging in. Go to Menu → My Orders.',
    },
    {
        keywords: ['contact', 'help', 'support', 'reach', 'customer care', 'service'],
        response: 'Reach us on WhatsApp: +91 8838660900 or email: htkenterprises.net@gmail.com',
    },
    {
        keywords: ['price', 'cost', 'rate', 'how much', 'pricing'],
        response: 'Check our Shop page for current prices. We offer competitive rates for premium organic products.',
    },
];

const QUICK_REPLIES = [
    { label: 'Shipping Info', query: 'shipping' },
    { label: 'Our Products', query: 'organic' },
    { label: 'Payment Options', query: 'payment' },
    { label: 'Contact Us', query: 'contact' },
];

const GREETING: Message = {
    id: 'greeting',
    role: 'bot',
    text: 'Hello! 👋 I\'m the HTK Assistant. How can I help you today?',
};

function getBotResponse(input: string): { text: string; isWhatsApp?: boolean } {
    const lower = input.toLowerCase();
    for (const entry of FAQ) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return { text: entry.response, isWhatsApp: entry.isWhatsApp };
        }
    }
    return {
        text: "I'm not sure about that. Would you like to chat with our team on WhatsApp?",
        isWhatsApp: true,
    };
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2 mb-3">
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ background: 'var(--color-primary)' }}
            >
                H
            </div>
            <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm flex items-center gap-1">
                <span
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                    style={{ animation: 'typingBounce 1.2s ease-in-out infinite 0ms' }}
                />
                <span
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                    style={{ animation: 'typingBounce 1.2s ease-in-out infinite 200ms' }}
                />
                <span
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                    style={{ animation: 'typingBounce 1.2s ease-in-out infinite 400ms' }}
                />
            </div>
        </div>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    const isBot = message.role === 'bot';

    return (
        <div className={`flex items-end gap-2 mb-3 ${isBot ? '' : 'flex-row-reverse'}`}>
            {isBot && (
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: 'var(--color-primary)' }}
                >
                    H
                </div>
            )}
            <div
                className={`
                    max-w-[78%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isBot
                        ? 'rounded-bl-sm bg-white border border-gray-100 text-gray-800'
                        : 'rounded-br-sm text-white'
                    }
                `}
                style={!isBot ? { background: 'var(--color-primary)' } : undefined}
            >
                {message.text}
                {message.isWhatsApp && (
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 mt-2 text-xs font-semibold underline"
                        style={{ color: '#25D366' }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Chat on WhatsApp
                    </a>
                )}
            </div>
        </div>
    );
}

// ─── ChatBot Component ────────────────────────────────────────────────────────

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([GREETING]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Show button after 2s delay (after WhatsApp button)
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            text: text.trim(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setShowQuickReplies(false);
        setIsTyping(true);

        // Simulate typing delay for natural feel
        setTimeout(() => {
            const { text: responseText, isWhatsApp } = getBotResponse(text);
            const botMsg: Message = {
                id: `b-${Date.now()}`,
                role: 'bot',
                text: responseText,
                isWhatsApp,
            };
            setIsTyping(false);
            setMessages(prev => [...prev, botMsg]);
        }, 300 + Math.random() * 400);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (query: string) => {
        sendMessage(query);
    };

    return (
        <>
            {/* Keyframe styles */}
            <style>{`
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-5px); opacity: 1; }
                }
                @keyframes chatPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(31,61,43,0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(31,61,43,0); }
                }
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(12px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chatSlideDown {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(12px) scale(0.96); }
                }
            `}</style>

            {/* Chat window */}
            {isOpen && (
                <div
                    className="fixed z-[60] bottom-24 right-6 w-[22rem] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                    style={{
                        animation: 'chatSlideUp 0.25s ease-out forwards',
                        maxHeight: '80vh',
                    }}
                    role="dialog"
                    aria-label="HTK Assistant chat"
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                        style={{ background: 'var(--color-primary)' }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                H
                            </div>
                            <div>
                                <div className="text-white font-semibold text-sm leading-tight">HTK Assistant</div>
                                <div className="text-white/60 text-[10px] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                    Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Close chat"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages area */}
                    <div
                        className="flex-1 overflow-y-auto px-3 py-4"
                        style={{ background: '#F6F4F0', minHeight: 260, maxHeight: 340 }}
                    >
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}

                        {/* Quick reply chips — shown after greeting only */}
                        {showQuickReplies && messages.length === 1 && (
                            <div className="flex flex-wrap gap-1.5 mt-1 mb-3 pl-9">
                                {QUICK_REPLIES.map(qr => (
                                    <button
                                        key={qr.label}
                                        onClick={() => handleQuickReply(qr.query)}
                                        className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 active:scale-95"
                                        style={{
                                            borderColor: 'var(--color-primary)',
                                            color: 'var(--color-primary)',
                                            background: 'white',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
                                            (e.currentTarget as HTMLButtonElement).style.color = 'white';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'white';
                                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
                                        }}
                                    >
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-200 bg-white flex-shrink-0"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me anything…"
                            className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 transition-colors"
                            maxLength={300}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 flex-shrink-0"
                            style={{ background: 'var(--color-primary)' }}
                            aria-label="Send message"
                        >
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating chat button — positioned above WhatsApp (bottom-24) */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                aria-label={isOpen ? 'Close chat' : 'Open HTK Assistant chat'}
                className={`
                    fixed z-[60] bottom-24 right-6
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    text-white shadow-lg
                    transition-all duration-500
                    hover:scale-110 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}
                `}
                style={{
                    background: 'var(--color-primary)',
                    animation: isVisible && !isOpen ? 'chatPulse 2.5s ease-out infinite' : undefined,
                    focusRingColor: 'var(--color-primary)',
                    // Move button up when chat is open
                    bottom: isOpen ? '26.5rem' : undefined,
                } as React.CSSProperties}
            >
                {isOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>
        </>
    );
}
