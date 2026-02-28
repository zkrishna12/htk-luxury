'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { products as staticProducts } from '@/lib/products'; // Direct Static Import
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { CommerceProduct } from '@/types/commerce';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import RecentlyViewed, { trackProductView } from '@/components/RecentlyViewed';

interface ProductRating {
    avg: number;
    count: number;
}

export default function ShopPage() {
    const { addToCart, items, removeFromCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, removeFromCompare, isInCompare, compareCount } = useCompare();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    // Initialize with Static Data immediately (Instant Load)
    const [products, setProducts] = useState<any[]>(staticProducts);
    const [productRatings, setProductRatings] = useState<Record<string, ProductRating>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Stock alert state: { [productId]: 'idle' | 'entering_email' | 'submitting' | 'subscribed' }
    const [alertState, setAlertState] = useState<Record<string, string>>({});
    const [alertEmail, setAlertEmail] = useState<Record<string, string>>({});

    const isOutOfStock = (product: any) =>
        product.stock !== undefined && product.stock <= 0;

    const handleNotifyClick = (product: any) => {
        if (auth.currentUser) {
            // Logged in: save directly
            handleSubscribeAlert(product, auth.currentUser.email || '');
        } else {
            setAlertState(s => ({ ...s, [product.id]: 'entering_email' }));
        }
    };

    const handleSubscribeAlert = async (product: any, email: string) => {
        if (!email.trim()) return;
        setAlertState(s => ({ ...s, [product.id]: 'submitting' }));
        try {
            await addDoc(collection(db, 'stock_alerts'), {
                productId: product.id,
                productName: product.name,
                userId: auth.currentUser?.uid || null,
                email: email.trim(),
                createdAt: serverTimestamp(),
                notified: false,
            });
            setAlertState(s => ({ ...s, [product.id]: 'subscribed' }));
        } catch (err) {
            console.error('Stock alert subscription failed:', err);
            setAlertState(s => ({ ...s, [product.id]: 'idle' }));
            alert('Failed to subscribe. Please try again.');
        }
    };

    const CATEGORIES = ['All', 'Honey', 'Sugar', 'Turmeric', 'Coffee'];

    const getProductCategory = (productId: string): string => {
        const id = productId.toLowerCase();
        if (id.includes('honey')) return 'Honey';
        if (id.includes('sugar')) return 'Sugar';
        if (id.includes('manjal') || id.includes('turmeric')) return 'Turmeric';
        if (id.includes('coffee')) return 'Coffee';
        return 'Other';
    };

    const activeProducts = products.filter(p => p.isActive !== false || isOutOfStock(p));
    // For display, a product is effectively out of stock if stock<=0 or isActive===false
    const isProductOutOfStock = (p: any) => p.isActive === false || isOutOfStock(p);
    const filteredProducts = activeProducts.filter(product => {
        const matchesSearch = searchQuery.trim() === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || getProductCategory(product.id) === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleShare = (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        const shareUrl = 'https://htkenterprises.net/shop/';
        const shareText = `Check out ${product.name} from HTK Enterprises! ${shareUrl}`;
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
            (navigator as any).share({ title: product.name, text: shareText, url: shareUrl }).catch(() => {});
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
        }
    };

    // Background Data Refresh (Stock/Price/Active)
    useEffect(() => {
        const refreshProducts = async () => {
            try {
                // Fetch fresh data quietly
                const q = query(collection(db, 'products'));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const freshData: any[] = [];
                    querySnapshot.forEach((doc) => {
                        freshData.push({ id: doc.id, ...doc.data() });
                    });

                    // Merge strategy: Update existing static items with fresh DB data
                    setProducts(current => {
                        return current.map(staticItem => {
                            const match = freshData.find(f => f.id === staticItem.id);
                            // If DB has update, use it, else keep static
                            if (match) {
                                return {
                                    ...staticItem,
                                    ...match,
                                    // Ensure image is robust (use DB image if present, else fallback)
                                    image: match.thumbnail || match.images?.[0] || staticItem.image
                                };
                            }
                            return staticItem;
                        });
                    });
                }
            } catch (err) {
                console.error("Background sync failed (using static data):", err);
            }
        };
        refreshProducts();
    }, []);

    // Fetch reviews and compute per-product ratings
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                const ratingsMap: Record<string, { sum: number; count: number }> = {};
                snap.forEach((doc) => {
                    const d = doc.data();
                    const pid: string | undefined = d.productId;
                    if (pid) {
                        if (!ratingsMap[pid]) ratingsMap[pid] = { sum: 0, count: 0 };
                        ratingsMap[pid].sum += Number(d.rating) || 0;
                        ratingsMap[pid].count += 1;
                    }
                });
                const computed: Record<string, ProductRating> = {};
                for (const pid in ratingsMap) {
                    computed[pid] = {
                        avg: ratingsMap[pid].sum / ratingsMap[pid].count,
                        count: ratingsMap[pid].count,
                    };
                }
                setProductRatings(computed);
            } catch (err) {
                console.error('Failed to fetch product ratings:', err);
            }
        };
        fetchRatings();
    }, []);

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    };

    const handleViewProduct = (product: any) => {
        trackProductView({
            id: product.id,
            name: product.name,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            weight: product.weight,
            description: product.description,
        });
        setSelectedProduct(product);
    };

    return (
        <LuxuryFrame className="text-[var(--color-primary)] pt-32 pb-24">
            <Navigation />
            <CartDrawer />
            <div className="luxury-container text-center mb-16 space-y-4">
                {/* Luxury Vector Icon - Leaf/Nature Ornament */}
                <div className="flex justify-center opacity-80">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--color-accent)]">
                        <path d="M12 21C12 21 17 19 19 14C21 9 19 5 19 5C19 5 15 3 10 5C5 7 3 13 3 13C3 13 8 11 12 21Z" />
                        <path d="M12 21C12 21 7 19 5 14C3 9 5 5 5 5 9 3 14 5C19 7 21 13 21 13C21 13 16 11 12 21Z" />
                    </svg>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif">The Collection</h1>
                <p className="opacity-60 max-w-2xl mx-auto font-sans tracking-wide">
                    Pure, untouched, and harvested with integrity.
                </p>
            </div>

            {/* Search & Category Filter — sticky below header */}
            <div className="sticky top-0 z-30 bg-[var(--color-background)] border-b border-[var(--color-primary)]/10 shadow-sm">
                <div className="luxury-container py-4 space-y-3">
                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-40 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search products…"
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-[var(--color-primary)]/15 text-[var(--color-primary)] text-sm placeholder:opacity-35 focus:outline-none focus:border-[var(--color-primary)]/40 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-40 hover:opacity-80 transition-opacity text-lg leading-none"
                                aria-label="Clear search"
                            >&times;</button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 text-xs font-medium border transition-all duration-200 ${
                                    activeCategory === cat
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                        : 'bg-transparent text-[var(--color-primary)] border-[var(--color-primary)]/25 hover:border-[var(--color-primary)]/60'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Results count */}
                    <p className="text-[10px] text-center opacity-40 font-medium tracking-wide">
                        Showing {filteredProducts.length} of {activeProducts.length} products
                    </p>
                </div>
            </div>

            {/* Content Always Visible (No Spinner) */}
            <div className="luxury-container mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-24 space-y-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-[var(--color-accent)] opacity-40">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p className="font-serif text-xl opacity-50">No products found</p>
                        <p className="text-xs opacity-35">Try a different search or category</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            className="mt-2 px-6 py-2.5 border border-[var(--color-primary)]/30 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
                {filteredProducts.map(product => {
                    const existing = items.find(i => i.id === product.id);
                    const qty = existing ? existing.quantity : 0;

                    return (
                        <div key={product.id} className="group relative bg-white border border-[var(--color-primary)]/5 hover:border-[var(--color-accent)]/30 transition-all duration-500 flex flex-col">
                            {/* Image Container - Click to View Details */}
                            <div
                                className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)] cursor-pointer"
                                onClick={() => handleViewProduct(product)}
                            >
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    unoptimized
                                />
                                {/* Logo Overlay */}
                                <div className="absolute top-4 left-4 w-8 h-8 opacity-80 z-10 pointer-events-none">
                                    <Image
                                        src="/logo.png"
                                        alt="HTK Logo"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                {product.tag && (
                                    <span className="absolute top-4 right-4 bg-[var(--color-primary)] text-[var(--color-background)] text-[10px] px-3 py-1 font-medium">
                                        {product.tag}
                                    </span>
                                )}

                                {/* Sold Out Badge */}
                                {isProductOutOfStock(product) && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                        <div className="bg-black/60 backdrop-blur-[2px] px-5 py-2 rotate-[-8deg]">
                                            <span className="text-white font-serif text-lg tracking-widest uppercase">Sold Out</span>
                                        </div>
                                    </div>
                                )}

                                {/* Share + Compare Buttons */}
                                <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                                    <button
                                        onClick={(e) => handleShare(e, product)}
                                        title="Share this product"
                                        aria-label="Share product"
                                        className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
                                            <circle cx="18" cy="5" r="3" />
                                            <circle cx="6" cy="12" r="3" />
                                            <circle cx="18" cy="19" r="3" />
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                        </svg>
                                    </button>
                                    {/* Compare Toggle Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            isInCompare(product.id)
                                                ? removeFromCompare(product.id)
                                                : addToCompare(product.id);
                                        }}
                                        title={isInCompare(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                                        aria-label={isInCompare(product.id) ? 'Remove from compare' : 'Add to compare'}
                                        className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                                    >
                                        {/* Scale / Balance icon */}
                                        <svg
                                            width="17"
                                            height="17"
                                            viewBox="0 0 24 24"
                                            fill={isInCompare(product.id) ? '#D4AF37' : 'none'}
                                            stroke={isInCompare(product.id) ? '#D4AF37' : 'currentColor'}
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={isInCompare(product.id) ? '' : 'text-[var(--color-primary)]'}
                                        >
                                            <line x1="12" y1="3" x2="12" y2="20" />
                                            <path d="M3 9l9-6 9 6" />
                                            <path d="M5 9a4 4 0 0 0 8 0" />
                                            <path d="M11 9a4 4 0 0 0 8 0" />
                                            <line x1="4" y1="20" x2="20" y2="20" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Wishlist Heart Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        isInWishlist(product.id)
                                            ? removeFromWishlist(product.id)
                                            : addToWishlist(product);
                                    }}
                                    title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    className="absolute bottom-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className={isInWishlist(product.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'}
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>

                                {/* Hover Overlay - View Details */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/90 text-[var(--color-primary)] px-4 py-2 text-xs font-medium backdrop-blur-sm">View Details</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 text-center space-y-3 flex-1 flex flex-col justify-end">
                                <h3
                                    className="font-serif text-xl group-hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                                    onClick={() => handleViewProduct(product)}
                                >
                                    {product.name}
                                </h3>
                                {product.description && <p className="text-[10px] opacity-70 px-2 leading-relaxed line-clamp-2">{product.description}</p>}
                                <div className="text-xs opacity-50">{product.weight}</div>

                                {/* Ratings */}
                                {(() => {
                                    const pr = productRatings[product.id];
                                    if (pr) {
                                        return (
                                            <div className="flex justify-center items-center gap-1">
                                                {[1,2,3,4,5].map((s) => (
                                                    <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M12 2L14.39 8.26L21 9.27L16.5 14.14L17.77 21L12 17.77L6.23 21L7.5 14.14L3 9.27L9.61 8.26L12 2Z"
                                                            fill={s <= Math.round(pr.avg) ? '#D4AF37' : 'none'}
                                                            stroke={s <= Math.round(pr.avg) ? '#D4AF37' : '#1F3D2B'}
                                                            strokeOpacity={s <= Math.round(pr.avg) ? '1' : '0.2'}
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                ))}
                                                <span className="text-[10px] opacity-40 ml-1">({pr.count})</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <p className="text-[10px] opacity-35 text-center">No reviews yet</p>
                                    );
                                })()}

                                <div className="flex items-center justify-center gap-4 text-sm font-medium py-2">
                                    <span>₹{product.price.toFixed(2)}</span>
                                    {product.mrp && <span className="opacity-40 line-through">₹{product.mrp}.00</span>}
                                </div>

                                {qty === 0 ? (
                                    isProductOutOfStock(product) ? (
                                        // Out-of-stock: show notification UI
                                        <div className="space-y-2 mt-2">
                                            {alertState[product.id] === 'subscribed' ? (
                                                <div className="w-full py-3 text-xs text-center font-medium" style={{ background: '#F0FDF4', border: '1px solid #1F3D2B40', color: '#1F3D2B' }}>
                                                    ✓ You'll be notified!
                                                </div>
                                            ) : alertState[product.id] === 'entering_email' ? (
                                                <div className="flex gap-1">
                                                    <input
                                                        type="email"
                                                        placeholder="Your email"
                                                        value={alertEmail[product.id] || ''}
                                                        onChange={e => setAlertEmail(s => ({ ...s, [product.id]: e.target.value }))}
                                                        className="flex-1 px-2 py-1.5 border border-[#D4AF37]/50 text-xs focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => handleSubscribeAlert(product, alertEmail[product.id] || '')}
                                                        disabled={alertState[product.id] === 'submitting'}
                                                        className="px-3 py-1.5 text-white text-xs font-medium disabled:opacity-60"
                                                        style={{ background: '#D4AF37' }}
                                                    >
                                                        Notify
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleNotifyClick(product)}
                                                    disabled={alertState[product.id] === 'submitting'}
                                                    className="w-full py-3 text-xs font-medium transition-all disabled:opacity-60"
                                                    style={{ border: '1px solid #D4AF37', background: '#FFFBEB', color: '#92400E' }}
                                                >
                                                    {alertState[product.id] === 'submitting' ? 'Subscribing…' : 'Notify When Available'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full py-3 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-white transition-all text-xs mt-2 font-medium"
                                        >
                                            Add to Cart
                                        </button>
                                    )
                                ) : (
                                    <div className="flex items-center justify-center gap-4 w-full py-3 border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 mt-2">
                                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center hover:bg-white">-</button>
                                        <span className="text-sm font-medium">{qty}</span>
                                        <button onClick={() => handleAddToCart(product)} className="w-8 h-8 flex items-center justify-center hover:bg-white">+</button>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleViewProduct(product)}
                                    className="text-[10px] opacity-50 hover:opacity-100 border-b border-transparent hover:border-[var(--color-primary)] transition-all pb-0.5 w-max mx-auto font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quote / Divider */}
            <div className="luxury-container text-center mt-32 mb-16 opacity-60">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-4 text-[var(--color-accent)]">
                    <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
                </svg>
                <p className="font-serif italic text-2xl">&quot;Nature does not hurry, yet everything is accomplished.&quot;</p>
            </div>

            {/* Personalized Recommendations — only when products are found */}
            {filteredProducts.length > 0 && (
                <section className="border-t border-[var(--color-primary)]/5 pt-16 pb-8">
                    <div className="luxury-container">
                        <div className="mb-8">
                            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--color-accent)] mb-2">Curated for You</p>
                            <h2 className="font-serif text-2xl text-[var(--color-primary)] font-semibold">You Might Also Like</h2>
                        </div>
                        <PersonalizedRecommendations />
                    </div>
                </section>
            )}

            {/* Recently Viewed Products */}
            <RecentlyViewed />

            {/* Contact & Support Section */}
            <section className="mt-32 border-t border-[var(--color-primary)] border-opacity-10 pt-24 text-center space-y-12">
                <h2 className="text-3xl font-serif">Contact & Support</h2>
                <div className="space-y-4 opacity-80 font-sans">
                    <p>WhatsApp: <span className="font-medium">8438380900 / 8838660900</span></p>
                    <p>Email: <a href="mailto:support@htkenterprises.net" className="underline hover:opacity-50">support@htkenterprises.net</a></p>
                </div>

                <div className="flex justify-center pt-8">
                    <a href="https://www.instagram.com/naturesorganichoney?igsh=b2Fib3ltanZjNm90&utm_source=qr" target="_blank" className="block w-48 h-48 relative border border-[var(--color-accent)] p-2 hover:opacity-80 transition-opacity">
                        <Image
                            src="/insta-qr.jpg"
                            alt="Instagram QR"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </a>
                </div>
                <p className="text-xs opacity-50 font-medium">Scan to follow us on Instagram</p>
            </section>

            {/* Floating Compare Bar */}
            {compareCount >= 2 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-4 bg-[var(--color-primary)] text-white px-6 py-3.5 shadow-2xl">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 shrink-0">
                            <line x1="12" y1="3" x2="12" y2="20" />
                            <path d="M3 9l9-6 9 6" />
                            <path d="M5 9a4 4 0 0 0 8 0" />
                            <path d="M11 9a4 4 0 0 0 8 0" />
                            <line x1="4" y1="20" x2="20" y2="20" />
                        </svg>
                        <span className="text-sm font-medium">
                            {compareCount} products selected
                        </span>
                        <a
                            href="/compare"
                            className="ml-2 px-5 py-2 bg-[#D4AF37] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#B8960C] transition-colors"
                        >
                            Compare Now
                        </a>
                    </div>
                </div>
            )}

            {/* Modal */}
            <ProductDetailsModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
            />

        </LuxuryFrame>
    );
}
