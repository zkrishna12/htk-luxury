'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function InvoiceContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('order_id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching invoice:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-12 text-center animate-pulse">Gathering details...</div>;
    if (!order) return <div className="p-12 text-center text-red-500">Invoice Not Found. Invalid Order ID.</div>;

    // Helper for currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Date formatting (handle Firestore Timestamp or direct Date)
    const orderDate = order.createdAt?.seconds
        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN'); // Fallback

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center print:p-0 print:bg-white text-black">
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none p-12 text-sm font-sans relative">

                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-[var(--color-primary)] pb-8 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24">
                            <Image src="/logo.png" alt="HTK" fill className="object-contain" unoptimized />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-[var(--color-primary)] font-bold">HTK Enterprises</h1>
                            <p className="opacity-70 max-w-xs text-xs mt-1">
                                33B, Alagarmayakkampatti, Sempatti, Dindigul - 624708
                            </p>
                            <p className="text-xs font-bold mt-2">GSTIN: 33BFCPK4245R2Z4</p>
                            <p className="text-xs">State: 33-Tamil Nadu</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-serif text-[var(--color-primary)] opacity-20 uppercase tracking-widest">Tax Invoice</h2>
                        <div className="mt-4 space-y-1">
                            <p><span className="font-bold">Invoice No:</span> INV-{order.id.slice(-6).toUpperCase()}</p>
                            <p><span className="font-bold">Date:</span> {orderDate}</p>
                            <p><span className="font-bold">Order ID:</span> {order.id}</p>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8">
                    <h3 className="text-[var(--color-primary)] font-bold border-b border-gray-200 pb-1 mb-2 uppercase text-xs tracking-widest">Bill To</h3>
                    <div className="text-base font-bold">{order.address.name}</div>
                    <div className="opacity-80">
                        {order.address.houseNumber}, {order.address.street}<br />
                        {order.address.area}, {order.address.city}<br />
                        {order.address.state} - {order.address.pincode}
                    </div>
                    <div className="mt-2 text-xs">Ph: {order.address.phone}</div>
                </div>

                {/* Table */}
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-[var(--color-primary)] text-white text-xs uppercase tracking-wider text-left">
                            <th className="p-3 rounded-tl-lg">#</th>
                            <th className="p-3">Item Name</th>
                            <th className="p-3 text-right">Qty</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-right rounded-tr-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {order.items.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="p-3 opacity-50">{index + 1}</td>
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3 text-right">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                <td className="p-3 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-2 text-xs">
                        <div className="flex justify-between pt-2">
                            <span className="opacity-60">Sub Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 text-[var(--color-primary)] font-bold text-lg">
                            <span>Grand Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="text-right text-[10px] opacity-50 italic">
                            (Inclusive of all Taxes)
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-12 left-12 right-12">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[var(--color-primary)] font-bold text-xs uppercase mb-2">Terms & Conditions</h4>
                            <p className="text-[10px] opacity-60 leading-relaxed">
                                1. Goods once sold will not be taken back.<br />
                                2. Interest @18% p.a. will be charged if payment is not made within due date.<br />
                                3. Subject to Dindigul Jurisdiction only.
                            </p>
                            <div className="mt-4 p-4 border border-[var(--color-primary)] inline-block rounded-lg">
                                <p className="text-xs font-serif italic text-[var(--color-primary)]">
                                    "Nature's Honest Yield."
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-end items-end">
                            <div className="h-16 w-32 border-b border-black mb-2"></div>
                            <p className="font-bold text-xs">For HTK Enterprises</p>
                            <p className="text-[10px] opacity-60">Authorized Signatory</p>
                        </div>
                    </div>

                    <div className="bg-[var(--color-primary)] text-white text-center py-2 text-[10px] uppercase tracking-widest mt-8 rounded-b-lg print:rounded-none">
                        Thank you for your business
                    </div>
                </div>

                {/* Print Fab */}
                <button
                    onClick={() => window.print()}
                    className="fixed bottom-8 right-8 bg-[var(--color-primary)] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform print:hidden z-50 flex items-center gap-2 cursor-pointer"
                >
                    <span className="text-xl">🖨️</span>
                    <span className="text-xs uppercase tracking-widest font-bold">Print</span>
                </button>

            </div>
        </div>
    );
}

export default function InvoicePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading Invoice...</div>}>
            <InvoiceContent />
        </Suspense>
    );
}
