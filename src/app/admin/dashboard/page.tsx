'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import LuxuryFrame from '@/components/LuxuryFrame';
import { CommerceUser } from '@/types/commerce';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory'

    const fetchData = async () => {
        // Fetch Orders
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const fetchedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }

        // Fetch Products
        try {
            const qP = query(collection(db, 'products'), orderBy('name'));
            const snapP = await getDocs(qP);
            const fetchedProducts = snapP.docs.map(d => ({ id: d.id, ...d.data() }));
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // 1. Admin Verification
    useEffect(() => {
        const checkAdmin = async () => {
            if (!auth.currentUser) {
                router.push('/login');
                return;
            }

            // Temp: Allow a specific email hardcoded for emergency access if role isn't set yet during transition
            const isHardcodedAdmin = auth.currentUser.email === 'htk@admin.com' || auth.currentUser.phoneNumber === '+918438380900';

            try {
                // Determine Admin Status
                let authorized = false;
                if (isHardcodedAdmin) authorized = true;

                if (!authorized) {
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as CommerceUser;
                        if (userData.role === 'admin') authorized = true;
                    }
                }

                if (authorized) {
                    setIsAdmin(true);
                    fetchData(); // Proceed to load data
                } else {
                    alert("Access Denied. Admins only.");
                    router.push('/');
                }
            } catch (error) {
                console.error("Admin check failed", error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!confirm(`Mark order as ${newStatus}?`)) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const updateStock = async (productId: string, val: number, isAbsolute = false) => {
        try {
            const productRef = doc(db, 'products', productId);
            if (isAbsolute) {
                await updateDoc(productRef, { stock: val });
                // Optimistic update already done in UI via onChange, but ensuring sync
                const updated = await getDoc(productRef);
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: updated.data()?.stock } : p));
            } else {
                // relative update
                // Not currently used in UI (hidden buttons)
                const product = products.find(p => p.id === productId);
                if (product) {
                    const newStock = (product.stock || 0) + val;
                    if (newStock < 0) return;
                    await updateDoc(productRef, { stock: newStock });
                    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
                }
            }
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update stock.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying Access...</div>;
    if (!isAdmin) return null;

    return (
        <LuxuryFrame className="pt-32 pb-12 min-h-screen bg-[var(--color-bg-warm)]">
            <div className="luxury-container">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-serif text-[var(--color-primary)]">Command Center</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2 uppercase tracking-widest text-xs border border-[var(--color-primary)] transition-all ${activeTab === 'orders' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-primary)]/10'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2 uppercase tracking-widest text-xs border border-[var(--color-primary)] transition-all ${activeTab === 'inventory' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-primary)]/10'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`px-6 py-2 uppercase tracking-widest text-xs border border-[var(--color-primary)] transition-all ${activeTab === 'coupons' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-primary)]/10'}`}
                        >
                            Coupons
                        </button>
                    </div>
                </div>

                {activeTab === 'orders' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Recent Orders</h2>
                            <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                        </div>
                        <div className="space-y-4">
                            {orders.map((order: any) => (
                                <div key={order.id} className="border-b border-[var(--color-bg-neutral)] pb-6 last:border-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="font-mono text-xs opacity-50 uppercase block mb-1">ID: {order.paymentId || order.id}</span>
                                            <h3 className="font-bold text-[var(--color-primary)]">₹{order.total} <span className="font-normal opacity-60">via {order.userPhone || 'Guest'}</span></h3>
                                            <p className="text-sm opacity-80 mt-1">{order.address?.name}, {order.address?.city}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'paid' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                    className="text-[10px] underline hover:text-[var(--color-accent)]"
                                                >
                                                    Mark Shipped
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-[var(--color-background)] p-3 text-xs font-mono opacity-70">
                                        Items: {order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && <p className="opacity-50 text-center py-12">No orders found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Inventory Management</h2>
                            <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                        </div>

                        <div className="grid gap-4">
                            {products.map((product: any) => (
                                <div key={product.id} className="flex items-center justify-between p-4 border border-[var(--color-bg-neutral)] bg-[var(--color-background)]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white relative border border-gray-100">
                                            <img src={product.image || product.thumbnail || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif text-lg">{product.name}</h4>
                                            <div className="text-xs opacity-50 uppercase tracking-widest">{product.sku || 'No SKU'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="block text-xs uppercase opacity-50">Price</span>
                                            <span className="font-mono">₹{product.price}</span>
                                        </div>
                                        <div className="text-right pl-6 border-l border-gray-200">
                                            <span className="block text-xs uppercase opacity-50 mb-1">Stock</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateStock(product.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-500"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="w-16 p-2 text-center text-lg font-bold bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                                    value={product.stock}
                                                    onChange={(e) => {
                                                        const newVal = parseInt(e.target.value);
                                                        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: isNaN(newVal) ? 0 : newVal } : p));
                                                    }}
                                                    onBlur={(e) => {
                                                        const newVal = parseInt(e.target.value);
                                                        updateStock(product.id, newVal, true);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => updateStock(product.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-500"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'coupons' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Active Coupons</h2>
                            <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                        </div>
                        <div className="mb-8 p-4 bg-[var(--color-background)] border border-[var(--color-bg-neutral)]">
                            <h3 className="font-bold text-sm mb-4">Create New Coupon</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const codeInput = form.elements.namedItem('code') as HTMLInputElement;
                                const discountInput = form.elements.namedItem('discount') as HTMLInputElement;
                                const code = codeInput.value;
                                const discount = parseFloat(discountInput.value);

                                if (!code || !discount) return;

                                try {
                                    await setDoc(doc(db, 'coupons', code.toUpperCase()), {
                                        code: code.toUpperCase(),
                                        type: 'percentage',
                                        value: discount,
                                        minOrderValue: 0,
                                        isActive: true,
                                        createdAt: new Date(),
                                        usageLimit: 100,
                                        usedCount: 0
                                    });
                                    alert('Coupon Created!');
                                    fetchData();
                                    form.reset();
                                } catch (err) {
                                    console.error(err);
                                    alert('Error creating coupon.');
                                }
                            }} className="flex gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-1">Code</label>
                                    <input name="code" type="text" placeholder="WELCOME20" className="p-2 border border-gray-300 w-32 font-mono uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-1">Discount %</label>
                                    <input name="discount" type="number" placeholder="10" className="p-2 border border-gray-300 w-20" />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs uppercase tracking-widest">Create</button>
                            </form>
                        </div>

                        <div className="space-y-2">
                            {/* Coupon List Placeholder - would map 'coupons' state here */}
                            <p className="text-xs opacity-50">created coupons will appear here (requires fetching 'coupons' collection)</p>
                        </div>
                    </div>
                )}
            </div>
        </LuxuryFrame>
    );
}
