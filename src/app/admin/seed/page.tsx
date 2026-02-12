'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { products } from '@/lib/products';
import { CommerceProduct } from '@/types/commerce';

export default function SeedPage() {
    const [status, setStatus] = useState<string>('Ready to seed.');
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        if (!confirm('This will overwrite existing products in Firestore. Continue?')) return;

        setLoading(true);
        setStatus('Starting migration...');

        try {
            let count = 0;
            for (const product of products) {
                // Map static product to new Schema
                const newProduct: CommerceProduct = {
                    id: product.id,
                    sku: `SKU-${product.id.toUpperCase().replace('-', '')}`,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    mrp: product.mrp,
                    currency: 'INR',

                    stock: 50, // Default stock
                    stockStatus: 'instock',
                    lowStockThreshold: 5,
                    allowBackorder: false,

                    weight: parseInt(product.weight.replace('g', '')) || 500,

                    images: [product.image], // Convert single image to array
                    thumbnail: product.image,

                    category: ['Organic', 'General'],
                    tags: product.tag ? [product.tag] : [],
                    isActive: true,
                    taxClass: 'standard',

                    advantages: product.advantages || [],
                    howToUse: product.howToUse || [],

                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                };

                await setDoc(doc(db, 'products', product.id), newProduct);
                count++;
                setStatus(`Migrated ${count} / ${products.length}: ${product.name}`);
            }
            setStatus(`Success! Migrated ${count} products.`);
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-12 font-mono">
            <h1 className="text-2xl font-bold mb-4">Database Migration Tool</h1>
            <div className="bg-gray-100 p-4 border rounded shadow mb-8">
                <p>Source: src/lib/products.ts</p>
                <p>Target: Firestore /products</p>
                <p>Schema: CommerceProduct (v2)</p>
            </div>

            <button
                onClick={handleSeed}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Run Migration'}
            </button>

            <div className="mt-8 p-4 border border-gray-300 rounded min-h-[100px]">
                <p className="font-bold">Status Log:</p>
                <pre className="mt-2 text-sm">{status}</pre>
            </div>
        </div>
    );
}
