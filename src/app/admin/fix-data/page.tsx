'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { products } from '@/lib/products';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';

export default function FixDataPage() {
    const [status, setStatus] = useState('Idle');
    const [dbProducts, setDbProducts] = useState<any[]>([]);

    useEffect(() => {
        // List existence check
        getDocs(collection(db, 'products')).then(snap => {
            setDbProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    const fixHoney = async () => {
        setStatus('Processing...');
        try {
            // Target specific ID
            const targetId = 'honey-small-bee';
            const docRef = doc(db, 'products', targetId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setStatus('Product missing in DB. Creating it from Static Data...');
                // Find static data
                const staticData = products.find(p => p.id === targetId);
                if (!staticData) throw new Error("Static data for honey-small-bee not found!");

                // Create with 500g override
                await setDoc(docRef, {
                    ...staticData,
                    weight: '500g'
                });
                setStatus('Success: Created "Small Bee Honey" (500g) in Database.');
            } else {
                setStatus('Product found. Updating weight...');
                await setDoc(docRef, { weight: '500g' }, { merge: true });
                setStatus('Success: Updated "Small Bee Honey" to 500g.');
            }

            // Refresh list
            getDocs(collection(db, 'products')).then(snap => {
                setDbProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });

        } catch (err: any) {
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <div className="p-12 font-sans">
            <h1 className="text-2xl font-bold mb-4 font-serif text-[var(--color-primary)]">Database Repair</h1>

            <div className="mb-8">
                <button onClick={fixHoney} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded shadow hover:scale-105 transition-transform">
                    Repair "Small Bee Honey" (500g)
                </button>
                <div className="mt-4 p-4 bg-gray-100 font-mono text-sm border-l-4 border-[var(--color-primary)]">
                    Status: {status}
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4 border-b pb-2">Current Database Products ({dbProducts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbProducts.map(p => (
                    <div key={p.id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-[var(--color-primary)]">{p.name}</h4>
                            <p className="text-xs opacity-60">ID: {p.id}</p>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-lg">{p.weight}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">₹{p.price}</span>
                        </div>
                    </div>
                ))}
            </div>
            {dbProducts.length === 0 && <p className="opacity-50 italic">No products found in Firestore (Using Fallback?).</p>}
        </div>
    );
}
