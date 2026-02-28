'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
    doc, getDoc, collection, query, orderBy, limit,
    getDocs, updateDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import LuxuryFrame from '@/components/LuxuryFrame';
import { CommerceUser } from '@/types/commerce';

type TabType = 'orders' | 'inventory' | 'coupons' | 'analytics' | 'returns' | 'customers' | 'abandoned';

const STATUS_FLOW: string[] = ['paid', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'confirmed': return 'bg-teal-100 text-teal-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-purple-100 text-purple-800';
        case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
        case 'delivered': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function returnStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'under_review': return 'bg-blue-100 text-blue-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'refund_processed': return 'bg-[#D4AF37]/20 text-[#7a6010]';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
    }
}

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [returnRequests, setReturnRequests] = useState<any[]>([]);
    const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    // Orders tab state
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

    const fetchData = async () => {
        // Fetch Orders
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const fetchedOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }

        // Fetch Products
        try {
            const qP = query(collection(db, 'products'), orderBy('name'));
            const snapP = await getDocs(qP);
            const fetchedProducts = snapP.docs.map(d => ({ id: d.id, ...d.data() }));
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        }

        // Fetch Coupons
        try {
            const qC = query(collection(db, 'coupons'));
            const snapC = await getDocs(qC);
            const fetchedCoupons = snapC.docs.map(d => ({ id: d.id, ...d.data() }));
            setCoupons(fetchedCoupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }

        // Fetch Return Requests
        try {
            const qR = query(collection(db, 'return_requests'), orderBy('createdAt', 'desc'));
            const snapR = await getDocs(qR);
            const fetchedReturns = snapR.docs.map(d => ({ id: d.id, ...d.data() }));
            setReturnRequests(fetchedReturns);
        } catch (error) {
            console.error('Error fetching return requests:', error);
        }

        // Fetch Abandoned Carts
        try {
            const qA = query(collection(db, 'abandoned_carts'), orderBy('triggeredAt', 'desc'));
            const snapA = await getDocs(qA);
            const fetchedAbandoned = snapA.docs.map(d => ({ id: d.id, ...d.data() }));
            setAbandonedCarts(fetchedAbandoned);
        } catch (error) {
            console.error('Error fetching abandoned carts:', error);
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
            const isHardcodedAdmin =
                auth.currentUser.email === 'htk@admin.com' ||
                auth.currentUser.phoneNumber === '+918438380900';

            try {
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
                    fetchData();
                } else {
                    alert('Access Denied. Admins only.');
                    router.push('/');
                }
            } catch (error) {
                console.error('Admin check failed', error);
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
            const orderRef = doc(db, 'orders', orderId);
            const currentOrder = orders.find(o => o.id === orderId);
            const existingHistory: any[] = currentOrder?.statusHistory || [];
            const newHistoryEntry = {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin',
            };
            await updateDoc(orderRef, {
                status: newStatus,
                statusHistory: [...existingHistory, newHistoryEntry],
            });
            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId
                        ? { ...o, status: newStatus, statusHistory: [...existingHistory, newHistoryEntry] }
                        : o
                )
            );
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const updateStock = async (productId: string, val: number, isAbsolute = false) => {
        try {
            const productRef = doc(db, 'products', productId);
            if (isAbsolute) {
                await updateDoc(productRef, { stock: val });
                const updated = await getDoc(productRef);
                setProducts(prev =>
                    prev.map(p => (p.id === productId ? { ...p, stock: updated.data()?.stock } : p))
                );
            } else {
                const product = products.find(p => p.id === productId);
                if (product) {
                    const newStock = (product.stock || 0) + val;
                    if (newStock < 0) return;
                    await updateDoc(productRef, { stock: newStock });
                    setProducts(prev =>
                        prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
                    );
                }
            }
        } catch (error) {
            console.error('Update failed', error);
            alert('Failed to update stock.');
        }
    };

    const toggleCoupon = async (couponId: string, currentActive: boolean) => {
        try {
            await updateDoc(doc(db, 'coupons', couponId), { isActive: !currentActive });
            setCoupons(prev =>
                prev.map(c => (c.id === couponId ? { ...c, isActive: !currentActive } : c))
            );
        } catch (error) {
            alert('Failed to update coupon.');
        }
    };

    const deleteCoupon = async (couponId: string) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await deleteDoc(doc(db, 'coupons', couponId));
            setCoupons(prev => prev.filter(c => c.id !== couponId));
        } catch (error) {
            alert('Failed to delete coupon.');
        }
    };

    const updateReturnStatus = async (returnId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'return_requests', returnId), { status: newStatus });
            setReturnRequests(prev =>
                prev.map(r => (r.id === returnId ? { ...r, status: newStatus } : r))
            );
        } catch (error) {
            alert('Failed to update return status.');
        }
    };

    // Analytics computed from orders
    const analytics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const uniqueCustomers = new Set(orders.map(o => o.userId).filter(Boolean)).size;

        // Revenue by product
        const productRevMap: Record<string, { name: string; revenue: number; qty: number }> = {};
        orders.forEach(order => {
            (order.items || []).forEach((item: any) => {
                const key = item.productId || item.name || 'Unknown';
                if (!productRevMap[key]) productRevMap[key] = { name: item.name || key, revenue: 0, qty: 0 };
                productRevMap[key].revenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
                productRevMap[key].qty += item.quantity || 1;
            });
        });
        const productRevenue = Object.values(productRevMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        // Orders by status
        const statusCounts: Record<string, number> = {};
        orders.forEach(o => {
            const s = o.status || 'unknown';
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        const recentOrders = orders.slice(0, 7);

        return { totalRevenue, totalOrders, avgOrderValue, uniqueCustomers, productRevenue, statusCounts, recentOrders };
    }, [orders]);

    // Customers derived from orders
    const customers = useMemo(() => {
        const map: Record<string, { userId: string; name: string; phone: string; email: string; orderCount: number; totalSpent: number; orders: any[] }> = {};
        orders.forEach(order => {
            const uid = order.userId || order.userPhone || order.id;
            if (!map[uid]) {
                map[uid] = {
                    userId: uid,
                    name: order.address?.name || 'Unknown',
                    phone: order.userPhone || order.address?.phone || '-',
                    email: order.userEmail || '-',
                    orderCount: 0,
                    totalSpent: 0,
                    orders: [],
                };
            }
            map[uid].orderCount += 1;
            map[uid].totalSpent += parseFloat(order.total) || 0;
            map[uid].orders.push(order);
        });
        return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [orders]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        let result = orders;
        if (orderStatusFilter !== 'all') {
            result = result.filter(o => o.status === orderStatusFilter);
        }
        if (orderSearch.trim()) {
            const s = orderSearch.toLowerCase();
            result = result.filter(
                o =>
                    (o.id || '').toLowerCase().includes(s) ||
                    (o.paymentId || '').toLowerCase().includes(s) ||
                    (o.address?.name || '').toLowerCase().includes(s) ||
                    (o.userPhone || '').toLowerCase().includes(s)
            );
        }
        return result;
    }, [orders, orderSearch, orderStatusFilter]);

    // Status counts for filter pills
    const statusCounts = useMemo(() => {
        const map: Record<string, number> = { all: orders.length };
        orders.forEach(o => {
            const s = o.status || 'unknown';
            map[s] = (map[s] || 0) + 1;
        });
        return map;
    }, [orders]);

    const TABS: { id: TabType; label: string }[] = [
        { id: 'orders', label: 'Orders' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'coupons', label: 'Coupons' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'returns', label: 'Returns' },
        { id: 'customers', label: 'Customers' },
        { id: 'abandoned', label: 'Abandoned' },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying Access...</div>;
    if (!isAdmin) return null;

    return (
        <LuxuryFrame className="pt-32 pb-12 min-h-screen bg-[var(--color-bg-warm)]">
            <div className="luxury-container">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-4xl font-serif text-[var(--color-primary)]">Command Center</h1>
                    <button onClick={fetchData} className="text-[10px] uppercase tracking-widest border border-[var(--color-primary)]/40 px-4 py-2 hover:bg-[var(--color-primary)]/10 transition-all">
                        Refresh All
                    </button>
                </div>

                {/* Tab Bar — scrollable on mobile */}
                <div className="overflow-x-auto mb-8">
                    <div className="flex gap-2 min-w-max">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2 uppercase tracking-widest text-xs border border-[var(--color-primary)] transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'hover:bg-[var(--color-primary)]/10'
                                }`}
                            >
                                {tab.label}
                                {tab.id === 'orders' && orders.length > 0 && (
                                    <span className="ml-1.5 opacity-70">({orders.length})</span>
                                )}
                                {tab.id === 'returns' && returnRequests.length > 0 && (
                                    <span className="ml-1.5 opacity-70">({returnRequests.length})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== ORDERS TAB ===== */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-in space-y-4">
                        {/* Search & Filter */}
                        <div className="bg-white p-5 shadow-sm border border-[var(--color-primary)]/10">
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by order ID, name, or phone..."
                                    value={orderSearch}
                                    onChange={e => setOrderSearch(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-primary)]/40"
                                />
                                <span className="text-xs self-center opacity-50">{filteredOrders.length} orders</span>
                            </div>
                            {/* Status filter pills */}
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'paid', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setOrderStatusFilter(s)}
                                        className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border transition-all ${
                                            orderStatusFilter === s
                                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                                : 'border-gray-200 hover:border-[var(--color-primary)]/40'
                                        }`}
                                    >
                                        {s === 'out_for_delivery' ? 'Out for Delivery' : s} {statusCounts[s] !== undefined ? `(${statusCounts[s]})` : '(0)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10">
                            <h2 className="font-serif text-2xl mb-6">Orders</h2>
                            <div className="space-y-4">
                                {filteredOrders.map((order: any) => {
                                    const currentIdx = STATUS_FLOW.indexOf(order.status);
                                    const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
                                        ? STATUS_FLOW[currentIdx + 1]
                                        : null;

                                    return (
                                        <div key={order.id} className="border-b border-[var(--color-bg-neutral)] pb-6 last:border-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="font-mono text-xs opacity-50 uppercase block mb-1">
                                                        ID: {order.paymentId || order.id}
                                                    </span>
                                                    <h3 className="font-bold text-[var(--color-primary)]">
                                                        ₹{order.total}{' '}
                                                        <span className="font-normal opacity-60">via {order.userPhone || 'Guest'}</span>
                                                    </h3>
                                                    <p className="text-sm opacity-80 mt-1">
                                                        {order.address?.name}, {order.address?.city}
                                                    </p>
                                                    <p className="text-xs opacity-50 mt-0.5">
                                                        {order.createdAt?.toDate
                                                            ? order.createdAt.toDate().toLocaleDateString('en-IN')
                                                            : typeof order.createdAt === 'string'
                                                            ? new Date(order.createdAt).toLocaleDateString('en-IN')
                                                            : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${statusBadgeClass(order.status)}`}>
                                                        {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                                                    </span>
                                                    {nextStatus && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                                                            className="text-[10px] underline hover:text-[var(--color-accent)]"
                                                        >
                                                            Mark as {nextStatus === 'out_for_delivery' ? 'Out for Delivery' : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                                        </button>
                                                    )}
                                                    {/* Full status dropdown */}
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                        className="text-[10px] border border-gray-200 px-2 py-1 focus:outline-none bg-white"
                                                    >
                                                        {STATUS_FLOW.map(s => (
                                                            <option key={s} value={s}>{s === 'out_for_delivery' ? 'Out for Delivery' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                        ))}
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="bg-[var(--color-background)] p-3 text-xs font-mono opacity-70">
                                                Items: {order.items?.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredOrders.length === 0 && (
                                    <p className="opacity-50 text-center py-12">No orders found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== INVENTORY TAB ===== */}
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
                                            <img
                                                src={product.image || product.thumbnail || product.images?.[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
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
                                                    onChange={e => {
                                                        const newVal = parseInt(e.target.value);
                                                        setProducts(prev =>
                                                            prev.map(p =>
                                                                p.id === product.id ? { ...p, stock: isNaN(newVal) ? 0 : newVal } : p
                                                            )
                                                        );
                                                    }}
                                                    onBlur={e => {
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

                {/* ===== COUPONS TAB ===== */}
                {activeTab === 'coupons' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Coupons</h2>
                            <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                        </div>

                        {/* Create coupon form */}
                        <div className="mb-8 p-4 bg-[var(--color-background)] border border-[var(--color-bg-neutral)]">
                            <h3 className="font-bold text-sm mb-4">Create New Coupon</h3>
                            <form
                                onSubmit={async e => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const codeInput = form.elements.namedItem('code') as HTMLInputElement;
                                    const discountInput = form.elements.namedItem('discount') as HTMLInputElement;
                                    const code = codeInput.value;
                                    const discount = parseFloat(discountInput.value);
                                    if (!code || !discount) return;
                                    try {
                                        const newCoupon = {
                                            code: code.toUpperCase(),
                                            type: 'percentage',
                                            value: discount,
                                            minOrderValue: 0,
                                            isActive: true,
                                            createdAt: new Date(),
                                            usageLimit: 100,
                                            usedCount: 0,
                                        };
                                        await setDoc(doc(db, 'coupons', code.toUpperCase()), newCoupon);
                                        alert('Coupon Created!');
                                        fetchData();
                                        form.reset();
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error creating coupon.');
                                    }
                                }}
                                className="flex flex-wrap gap-4 items-end"
                            >
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-1">Code</label>
                                    <input name="code" type="text" placeholder="WELCOME20" className="p-2 border border-gray-300 w-32 font-mono uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest mb-1">Discount %</label>
                                    <input name="discount" type="number" placeholder="10" className="p-2 border border-gray-300 w-20" />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs uppercase tracking-widest">
                                    Create
                                </button>
                            </form>
                        </div>

                        {/* Coupon list */}
                        <div className="space-y-3">
                            {coupons.length === 0 && (
                                <p className="text-xs opacity-50 text-center py-8">No coupons found.</p>
                            )}
                            {coupons.map(coupon => (
                                <div
                                    key={coupon.id}
                                    className="flex flex-wrap items-center justify-between gap-3 p-4 border border-gray-100 bg-[var(--color-background)] rounded"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-[var(--color-primary)] text-sm tracking-widest">
                                            {coupon.code}
                                        </span>
                                        <span className="text-xs opacity-60">{coupon.value}% off</span>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-full ${
                                                coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs opacity-50">
                                            Used: {coupon.usedCount || 0}/{coupon.usageLimit || '∞'}
                                        </span>
                                        <button
                                            onClick={() => toggleCoupon(coupon.id, coupon.isActive)}
                                            className="text-[10px] uppercase tracking-widest border border-[var(--color-primary)]/30 px-3 py-1 hover:bg-[var(--color-primary)]/10 transition-all"
                                        >
                                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => deleteCoupon(coupon.id)}
                                            className="text-[10px] uppercase tracking-widest border border-red-200 text-red-500 px-3 py-1 hover:bg-red-50 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== ANALYTICS TAB ===== */}
                {activeTab === 'analytics' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                                { label: 'Total Orders', value: analytics.totalOrders },
                                { label: 'Avg Order Value', value: `₹${analytics.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                                { label: 'Total Customers', value: analytics.uniqueCustomers },
                            ].map(card => (
                                <div key={card.label} className="bg-white border border-[var(--color-primary)]/10 shadow-sm p-6">
                                    <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{card.label}</p>
                                    <p className="text-2xl font-bold text-[var(--color-primary)]">{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Revenue by Product */}
                            <div className="bg-white border border-[var(--color-primary)]/10 shadow-sm p-6">
                                <h3 className="font-serif text-lg mb-4">Top Products by Revenue</h3>
                                {analytics.productRevenue.length === 0 && (
                                    <p className="text-xs opacity-50 py-6 text-center">No data yet.</p>
                                )}
                                <div className="space-y-3">
                                    {analytics.productRevenue.map((p, i) => {
                                        const maxRev = analytics.productRevenue[0]?.revenue || 1;
                                        const pct = Math.round((p.revenue / maxRev) * 100);
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="truncate max-w-[60%]">{p.name}</span>
                                                    <span className="font-mono opacity-70">₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[var(--color-primary)]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Orders by Status */}
                            <div className="bg-white border border-[var(--color-primary)]/10 shadow-sm p-6">
                                <h3 className="font-serif text-lg mb-4">Orders by Status</h3>
                                {Object.keys(analytics.statusCounts).length === 0 && (
                                    <p className="text-xs opacity-50 py-6 text-center">No data yet.</p>
                                )}
                                <div className="space-y-3">
                                    {Object.entries(analytics.statusCounts).map(([status, count]) => {
                                        const maxCount = Math.max(...Object.values(analytics.statusCounts));
                                        const pct = Math.round((count / maxCount) * 100);
                                        return (
                                            <div key={status}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusBadgeClass(status)}`}>{status}</span>
                                                    </span>
                                                    <span className="font-mono opacity-70">{count}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#D4AF37]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Timeline */}
                        <div className="bg-white border border-[var(--color-primary)]/10 shadow-sm p-6">
                            <h3 className="font-serif text-lg mb-4">Recent Orders Timeline</h3>
                            <div className="space-y-3">
                                {analytics.recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center gap-4 text-sm border-b border-gray-50 pb-3 last:border-0">
                                        <span className="font-mono text-xs opacity-40 w-24 shrink-0">
                                            {order.createdAt?.toDate
                                                ? order.createdAt.toDate().toLocaleDateString('en-IN')
                                                : typeof order.createdAt === 'string'
                                                ? new Date(order.createdAt).toLocaleDateString('en-IN')
                                                : '-'}
                                        </span>
                                        <span className="flex-1 truncate">{order.address?.name || 'Guest'}</span>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase rounded-full shrink-0 ${statusBadgeClass(order.status)}`}>{order.status}</span>
                                        <span className="font-mono font-bold text-[var(--color-primary)] shrink-0">₹{order.total}</span>
                                    </div>
                                ))}
                                {analytics.recentOrders.length === 0 && (
                                    <p className="text-xs opacity-50 text-center py-4">No orders yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== RETURNS TAB ===== */}
                {activeTab === 'returns' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Return Requests</h2>
                            <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                        </div>

                        {returnRequests.length === 0 && (
                            <p className="text-xs opacity-50 text-center py-12">No return requests found.</p>
                        )}

                        <div className="space-y-4">
                            {returnRequests.map(ret => (
                                <div key={ret.id} className="border border-gray-100 p-5 rounded">
                                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                        <div>
                                            <span className="font-mono text-xs opacity-50 block mb-1">Order: {ret.orderId || ret.id}</span>
                                            <p className="font-semibold text-[var(--color-primary)]">{ret.reason || 'No reason provided'}</p>
                                            {ret.description && <p className="text-sm opacity-70 mt-1">{ret.description}</p>}
                                            <div className="text-xs opacity-50 mt-1">
                                                {ret.createdAt?.toDate
                                                    ? ret.createdAt.toDate().toLocaleDateString('en-IN')
                                                    : typeof ret.createdAt === 'string'
                                                    ? new Date(ret.createdAt).toLocaleDateString('en-IN')
                                                    : '-'}
                                                {ret.customerPhone && ` · ${ret.customerPhone}`}
                                                {ret.customerEmail && ` · ${ret.customerEmail}`}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${returnStatusBadgeClass(ret.status || 'pending')}`}>
                                                {(ret.status || 'pending').replace('_', ' ')}
                                            </span>
                                            <select
                                                value={ret.status || 'pending'}
                                                onChange={e => updateReturnStatus(ret.id, e.target.value)}
                                                className="text-[10px] border border-gray-200 px-2 py-1 focus:outline-none bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="under_review">Under Review</option>
                                                <option value="approved">Approved</option>
                                                <option value="refund_processed">Refund Processed</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== CUSTOMERS TAB ===== */}
                {activeTab === 'customers' && (
                    <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl">Customers</h2>
                            <span className="text-xs opacity-50">{customers.length} customers</span>
                        </div>

                        {customers.length === 0 && (
                            <p className="text-xs opacity-50 text-center py-12">No customer data found.</p>
                        )}

                        <div className="space-y-3">
                            {customers.map(customer => (
                                <div key={customer.userId} className="border border-gray-100 rounded overflow-hidden">
                                    <div
                                        className="flex flex-wrap justify-between items-center p-4 cursor-pointer hover:bg-[var(--color-background)] transition-colors gap-3"
                                        onClick={() =>
                                            setExpandedCustomer(
                                                expandedCustomer === customer.userId ? null : customer.userId
                                            )
                                        }
                                    >
                                        <div>
                                            <p className="font-semibold text-[var(--color-primary)]">{customer.name}</p>
                                            <p className="text-xs opacity-60">{customer.phone} {customer.email !== '-' && `· ${customer.email}`}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs opacity-50 uppercase tracking-widest">Orders</p>
                                                <p className="font-bold">{customer.orderCount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs opacity-50 uppercase tracking-widest">Spent</p>
                                                <p className="font-bold font-mono text-[var(--color-primary)]">
                                                    ₹{customer.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </p>
                                            </div>
                                            <span className="text-gray-400 text-sm">{expandedCustomer === customer.userId ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {expandedCustomer === customer.userId && (
                                        <div className="border-t border-gray-100 bg-[var(--color-background)] p-4">
                                            <p className="text-xs uppercase tracking-widest opacity-50 mb-3">Order History</p>
                                            <div className="space-y-2">
                                                {customer.orders.map((order: any) => (
                                                    <div key={order.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0">
                                                        <span className="font-mono opacity-50">{order.paymentId || order.id}</span>
                                                        <span className={`px-2 py-0.5 rounded-full ${statusBadgeClass(order.status)}`}>{order.status}</span>
                                                        <span className="font-mono font-bold">₹{order.total}</span>
                                                        <span className="opacity-40">
                                                            {order.createdAt?.toDate
                                                                ? order.createdAt.toDate().toLocaleDateString('en-IN')
                                                                : typeof order.createdAt === 'string'
                                                                ? new Date(order.createdAt).toLocaleDateString('en-IN')
                                                                : '-'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== ABANDONED CARTS TAB ===== */}
                {activeTab === 'abandoned' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Stats */}
                        {(() => {
                            const total = abandonedCarts.length;
                            const recovered = abandonedCarts.filter(c => c.recovered === true).length;
                            const rate = total > 0 ? Math.round((recovered / total) * 100) : 0;
                            return (
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Total Abandoned', value: total },
                                        { label: 'Recovered', value: recovered },
                                        { label: 'Recovery Rate', value: `${rate}%` },
                                    ].map(card => (
                                        <div key={card.label} className="bg-white border border-[var(--color-primary)]/10 shadow-sm p-6">
                                            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{card.label}</p>
                                            <p className="text-2xl font-bold text-[var(--color-primary)]">{card.value}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        <div className="bg-white p-8 shadow-sm border border-[var(--color-primary)]/10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-serif text-2xl">Abandoned Carts</h2>
                                <button onClick={fetchData} className="text-[10px] uppercase tracking-widest hover:opacity-50">Refresh</button>
                            </div>

                            {abandonedCarts.length === 0 && (
                                <p className="text-xs opacity-50 text-center py-12">No abandoned carts found.</p>
                            )}

                            <div className="space-y-3">
                                {abandonedCarts.map(cart => (
                                    <div
                                        key={cart.id}
                                        className={`p-4 border rounded transition-colors ${
                                            cart.recovered
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-100 bg-red-50/40'
                                        }`}
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-3">
                                            <div>
                                                <div className="text-xs opacity-50 mb-1">
                                                    {cart.triggeredAt?.toDate
                                                        ? cart.triggeredAt.toDate().toLocaleDateString('en-IN')
                                                        : typeof cart.triggeredAt === 'string'
                                                        ? new Date(cart.triggeredAt).toLocaleDateString('en-IN')
                                                        : '-'}
                                                </div>
                                                <p className="text-sm font-mono opacity-70">
                                                    {cart.items?.map((i: any) => `${i.name} (x${i.quantity || 1})`).join(', ') || 'No items'}
                                                </p>
                                                {cart.userPhone && <p className="text-xs opacity-50 mt-1">{cart.userPhone}</p>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-bold text-[var(--color-primary)]">
                                                    ₹{cart.total || '-'}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${
                                                        cart.recovered
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {cart.recovered ? 'Recovered' : 'Not Recovered'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LuxuryFrame>
    );
}
