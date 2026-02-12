import { Timestamp } from 'firebase/firestore';

export type ProductStatus = 'active' | 'draft' | 'archived';
export type StockStatus = 'instock' | 'lowstock' | 'outstock';

export interface CommerceProduct {
    id: string; // Firestore Doc ID (usually slug or auto-id)
    sku: string; // Unique SKU
    name: string;
    description: string;
    price: number;
    mrp: number; // For strikethrough
    currency: string;

    // Inventory
    stock: number;
    stockStatus: StockStatus;
    lowStockThreshold: number;
    allowBackorder: boolean;

    // Dimensions for Shipping
    weight: number; // in grams
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'in';
    };

    // Media
    images: string[];
    thumbnail: string;

    // Organization
    category: string[];
    tags: string[];
    isActive: boolean;
    taxClass: 'standard' | 'reduced' | 'zero';

    // Metadata
    seoTitle?: string;
    seoDescription?: string;

    // Content
    advantages: string[];
    howToUse: string[];

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CommerceUser {
    uid: string;
    email: string;
    displayName: string;
    phone?: string;

    role: 'customer' | 'admin';

    wishlist: string[]; // List of Product IDs
    savedAddresses: SavedAddress[];

    walletBalance: number;
    loyaltyPoints: number;

    preferences: {
        emailMarketing: boolean;
        smsNotifications: boolean;
    };

    createdAt: Timestamp;
    lastLogin: Timestamp;
}

export interface SavedAddress {
    id: string;
    label: string; // "Home", "Work"
    name: string;
    phone: string;
    houseNumber: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
}

export interface Coupon {
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    minOrderValue: number;
    maxDiscount?: number;
    expiryDate: Timestamp;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
}
