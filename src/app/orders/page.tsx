'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import LuxuryFrame from '@/components/LuxuryFrame';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', user.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const ordersData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Sort locally - Handle pending writes (null createdAt) by treating them as 'now' (Infinity or current timestamp)
                    ordersData.sort((a: any, b: any) => {
                        const timeA = a.createdAt?.seconds || Date.now() / 1000;
                        const timeB = b.createdAt?.seconds || Date.now() / 1000;
                        return timeB - timeA;
                    });

                    setOrders(ordersData);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <LuxuryFrame className="pt-32 pb-24 px-8 flex flex-col items-center">

            <div className="luxury-container w-full max-w-4xl space-y-12 animate-fade-in text-[var(--color-primary)]">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-serif">Your Collection</h1>
                    <p className="opacity-60 font-sans text-sm tracking-widest uppercase">Past Harvests & Acquisitions</p>
                </div>

                {loading ? (
                    <div className="text-center py-24 opacity-60 animate-pulse">Gathering history...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 border border-[var(--color-primary)]/10 bg-[var(--color-background)] space-y-6 p-8">
                        <p className="text-xl font-serif">No archives found.</p>
                        <p className="opacity-60 max-w-md mx-auto">
                            It seems your journey has just begun.
                            If you have recently placed an order, it might be taking a moment to appear.
                        </p>
                        <a href="/shop" className="inline-block border-b border-[var(--color-primary)] pb-1 uppercase tracking-widest text-xs hover:text-[var(--color-accent)]">
                            Visit Collection
                        </a>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border border-[var(--color-primary)]/10 p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-gray-100 pb-4">
                                    <div className="space-y-1">
                                        <div className="text-xs uppercase tracking-widest opacity-50">Order ID</div>
                                        <div className="font-mono text-sm">{order.paymentId || order.id}</div>
                                    </div>
                                    <div className="space-y-1 md:text-right">
                                        <div className="text-xs uppercase tracking-widest opacity-50">Date</div>
                                        <div>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</div>
                                    </div>
                                    <div className="space-y-1 md:text-right">
                                        <div className="text-xs uppercase tracking-widest opacity-50">Status</div>
                                        <span className="inline-block px-3 py-1 bg-green-50 text-green-800 text-[10px] uppercase font-bold tracking-widest border border-green-100 rounded-full">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full opacity-50"></div>
                                                <span>{item.name} <span className="opacity-50">x {item.quantity}</span></span>
                                            </div>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-xs opacity-60">Delivered to: {order.address.city}, {order.address.state}</div>
                                    <div className="font-serif text-xl">Total: ₹{order.total}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </LuxuryFrame>
    );
}
