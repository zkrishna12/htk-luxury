'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Script from 'next/script';
import { products } from '@/lib/products';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { sendAdminNotification } from '@/lib/adminNotifications';
import { sendWhatsAppOrderNotification } from '@/lib/whatsappNotification';

export default function CartDrawer() {
    const {
        items,
        removeFromCart,
        cartOpen,
        setCartOpen,
        cartTotal: total,
        addToCart,
        clearCart,
        updateQuantity,
        coupon,
        applyCoupon,
        removeCoupon
    } = useCart();
    const router = useRouter();
    const [step, setStep] = React.useState('cart'); // 'cart' | 'address'
    const [loading, setLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [lastOrder, setLastOrder] = React.useState<any>(null);

    const [address, setAddress] = React.useState({
        name: '',
        phone: '',
        houseNumber: '',
        area: '',
        street: '',
        landmark: '',
        city: '',
        state: 'Tamil Nadu', // Default
        pincode: ''
    });

    // Reset step when cart opens
    React.useEffect(() => {
        if (cartOpen) {
            setStep('cart');
            setShowSuccess(false);
        }
    }, [cartOpen]);

    if (!cartOpen) return null;

    const handleProceed = () => {
        if (!auth.currentUser) {
            setCartOpen(false);
            router.push('/login');
            return;
        }
        setStep('address');
    };

    const validateStock = async () => {
        try {
            setLoading(true);
            const stockErrors: string[] = [];

            for (const item of items) {
                // Check Firestore for current stock
                const productRef = await getDoc(doc(db, 'products', item.id));

                if (productRef.exists()) {
                    const data = productRef.data();
                    if (data.stock < item.quantity) {
                        stockErrors.push(`${item.name} (Only ${data.stock} left)`);
                    }
                }
            }

            if (stockErrors.length > 0) {
                alert(`Cannot proceed. Some items are out of stock:\n${stockErrors.join('\n')}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error("Stock check failed", error);
            alert("Unable to verify inventory. Please try again.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleFinalPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate Stock Before Payment
        const isStockValid = await validateStock();
        if (!isStockValid) return;

        if (!window.Razorpay) {
            alert('Payment gateway failed.');
            return;
        }

        const options = {
            key: "rzp_live_RyH14ZV1BzEA8D",
            amount: total * 100,
            currency: "INR",
            name: "HTK Enterprises",
            description: "Organic Goods",
            image: "/logo.png",
            handler: async function (response: any) {
                setLoading(true);
                console.log("Payment Success Callback Received:", response);

                try {
                    const deliveryDays = address.state.toLowerCase().includes('tamil') ? '2-3 Business Days' : '4-5 Business Days';

                    // Prepare Order Data
                    const orderData = {
                        userId: auth.currentUser?.uid || 'guest',
                        userPhone: auth.currentUser?.phoneNumber || address.phone,
                        items: items,
                        total: total,
                        address: address,
                        paymentId: response.razorpay_payment_id,
                        status: 'paid',
                        deliveryEstimate: deliveryDays,
                        createdAt: serverTimestamp()
                    };

                    console.log("Attempting to save order to Firestore...", orderData);

                    // Robust DB Save with Timeout Race
                    // 2. Decrement Stock & Save Order

                    await setDoc(doc(db, 'orders', response.razorpay_payment_id), orderData);

                    // 3. Update Inventory (Quiet Fail)
                    try {
                        for (const item of items) {
                            const productRef = doc(db, 'products', item.id);
                            await updateDoc(productRef, {
                                stock: increment(-item.quantity)
                            });
                        }
                    } catch (inventoryError) {
                        console.error("Inventory Decrement Failed (Order was successful):", inventoryError);
                        // We do NOT block the success screen for this.
                    }

                    // Trigger Email API (Non-blocking)
                    fetch('/api/email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: auth.currentUser?.email || address.name + "@example.com", // Fallback if no email
                            subject: `HTK Order Confirmation: ${response.razorpay_payment_id}`,
                            html: `<h1>Order Received</h1><p>Thank you, ${address.name}. Your order ID is ${response.razorpay_payment_id}.</p>`
                        })
                    }).catch(err => console.error("Email Trigger Failed", err));

                    // Send admin notification for new order (email)
                    sendAdminNotification({
                        type: 'order',
                        data: {
                            paymentId: response.razorpay_payment_id,
                            customerName: address.name,
                            phone: address.phone,
                            total: total,
                            itemCount: items.length,
                            address: `${address.houseNumber}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
                        }
                    });

                    // Send WhatsApp notification for new order
                    sendWhatsAppOrderNotification({
                        paymentId: response.razorpay_payment_id,
                        customerName: address.name,
                        phone: address.phone,
                        total: total,
                        itemCount: items.length,
                        items: items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
                        address: `${address.houseNumber}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
                    });

                    console.log("Order saved.");

                    setLastOrder({ ...orderData, id: response.razorpay_payment_id });
                    setShowSuccess(true);
                    clearCart();

                } catch (error) {
                    console.error("Critical Payment Handler Error:", error);
                    alert("Payment successful, but an error occurred processing the receipt. Please contact support with Payment ID: " + response.razorpay_payment_id);
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: address.name,
                contact: address.phone,
                email: auth.currentUser?.email || "guest@htk.com"
            },
            theme: { color: "var(--color-primary)" }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.error("Payment Failed:", response.error);
                alert("Payment Failed: " + response.error.description);
                setLoading(false);
            });
            rzp1.open();
        } catch (err) {
            console.error("Razorpay Initialization Failed", err);
            alert("Could not load payment gateway. Please check connection.");
            setLoading(false);
        }
    };

    if (showSuccess && lastOrder) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full p-8 animate-fade-in text-center space-y-6 border-4 border-[var(--color-primary)] double-border">
                    <div className="text-6xl">✨</div>
                    <h2 className="text-3xl font-serif text-[var(--color-primary)]">Payment Successful</h2>
                    <p className="opacity-60">Your pure organic harvest is secured.</p>

                    <div className="bg-[var(--color-background)] p-6 text-left space-y-2 text-sm font-sans border border-[var(--color-primary)]/10" id="receipt-content">
                        <div className="flex justify-between border-b border-black/10 pb-2 mb-2">
                            <span>Order ID</span>
                            <span className="font-bold">{lastOrder.paymentId.slice(0, 10)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Amount Paid</span>
                            <span>₹{lastOrder.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery To</span>
                            <span>{lastOrder.address.city}, {lastOrder.address.state}</span>
                        </div>
                        <div className="flex justify-between text-[var(--color-primary)] font-bold pt-2">
                            <span>Estimated Delivery</span>
                            <span>{lastOrder.deliveryEstimate}</span>
                        </div>
                    </div>

                    <p className="text-xs opacity-50">
                        Please save this receipt. (Automatic email delivery is currently inactive).
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => window.open(`/invoice?order_id=${lastOrder.paymentId}`, '_blank')}
                            className="py-3 border border-[var(--color-primary)] text-[var(--color-primary)] text-xs hover:bg-[var(--color-primary)] hover:text-white transition-colors font-medium"
                        >
                            Download Invoice
                        </button>
                        <a
                            href={`mailto:?subject=HTK Order Receipt ${lastOrder.paymentId}&body=Order ID: ${lastOrder.paymentId}%0D%0AAmount: ₹${lastOrder.total}%0D%0AItems: ${lastOrder.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}`}
                            className="py-3 border border-[var(--color-primary)] text-[var(--color-primary)] text-xs hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center justify-center font-medium"
                        >
                            Email Copy
                        </a>
                    </div>

                    <button
                        onClick={() => setCartOpen(false)}
                        className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-xs hover:opacity-90 font-medium"
                    >
                        Close & Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={() => setCartOpen(false)}
            />

            {/* Modal Container - Centered */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">

                {/* Modal Content - Clickable */}
                <div className="bg-[var(--color-background)] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl flex flex-col pointer-events-auto animate-fade-in border border-[var(--color-primary)]/10">

                    <div className="flex justify-between items-center p-8 pb-4 border-b border-[var(--color-primary)]/10">
                        <h2 className="font-serif text-3xl">{step === 'cart' ? 'Your Selection' : 'Shipping Details'}</h2>
                        <button onClick={() => setCartOpen(false)} className="opacity-50 hover:opacity-100 text-2xl p-2">✕</button>
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar">

                        {step === 'cart' ? (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-6">
                                    {items.length === 0 ? (
                                        <p className="opacity-50 text-center mt-12">Your cart is empty.</p>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className="flex gap-4 items-center">
                                                <div className="relative w-20 h-20 bg-white flex-shrink-0">
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-serif text-lg leading-tight">{item.name}</h4>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-[var(--color-primary)]/20">
                                                            <button
                                                                onClick={() => {
                                                                    if (item.quantity > 1) updateQuantity(item.id, -1);
                                                                    else removeFromCart(item.id);
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-sans">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-sm opacity-60">× ₹{item.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {items.length > 0 && (
                                    <div className="border-t border-[var(--color-primary)]/10 pt-6 mt-6 space-y-4">

                                        {/* Coupon Input */}
                                        <div className="flex gap-2">
                                            <input
                                                placeholder="Coupon Code"
                                                className="flex-1 p-2 border border-[var(--color-primary)]/20 text-sm focus:outline-none"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const target = e.target as HTMLInputElement;
                                                        applyCoupon(target.value).then(res => alert(res.message));
                                                    }
                                                }}
                                                id="coupon-input"
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById('coupon-input') as HTMLInputElement;
                                                    if (input.value) applyCoupon(input.value).then(res => alert(res.message));
                                                }}
                                                className="px-4 bg-[var(--color-bg-warm)] text-[var(--color-primary)] text-xs hover:bg-[var(--color-primary)] hover:text-white transition-colors font-medium"
                                            >
                                                Apply
                                            </button>
                                        </div>

                                        {coupon && (
                                            <div className="flex justify-between text-sm text-[var(--color-primary)]">
                                                <span>Discount ({coupon.code}) <button onClick={removeCoupon} className="text-red-500 ml-2 text-xs hover:underline">(Remove)</button></span>
                                                <span>- ₹{(total * 100 / (100 - (coupon.type === 'percentage' ? coupon.value : 0))) - total}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xl font-serif pt-2 border-t border-dashed border-[var(--color-primary)]/20">
                                            <span>Total</span>
                                            <span>₹{total}.00</span>
                                        </div>

                                        <button onClick={handleProceed} className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-xs hover:opacity-90 mt-4 font-medium">
                                            {auth.currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
                                        </button>
                                    </div>
                                )}

                                {/* Suggestions */}
                                <div className="mt-8 pt-6 border-t border-[var(--color-primary)]/10">
                                    <h4 className="font-serif text-sm mb-4 opacity-70">You might also like</h4>
                                    <div className="space-y-4">
                                        {products.filter(p => !items.find(i => i.id === p.id)).slice(0, 2).map(product => (
                                            <div key={product.id} className="flex gap-4 items-center bg-white p-2">
                                                <div className="relative w-12 h-12 bg-[var(--color-bg-warm)] flex-shrink-0">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-serif text-sm">{product.name}</h4>
                                                    <p className="opacity-60 text-xs">₹{product.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => addToCart({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.image,
                                                        quantity: 1
                                                    })}
                                                    className="text-[10px] border border-[var(--color-primary)]/20 px-3 py-1 hover:bg-[var(--color-primary)] hover:text-white transition-colors font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleFinalPayment} className="space-y-6 animate-fade-in">
                                <div className="space-y-4">
                                    <input required placeholder="Full Name" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                        value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} />

                                    <input required placeholder="Phone Number" type="tel" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                        value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="House No. / Flat No." className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                            value={address.houseNumber} onChange={e => setAddress({ ...address, houseNumber: e.target.value })} />
                                        <input required placeholder="Area / Locality" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                            value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} />
                                    </div>

                                    <input placeholder="Landmark (Optional)" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                        value={address.landmark} onChange={e => setAddress({ ...address, landmark: e.target.value })} />

                                    <input required placeholder="Street / Road Name" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                        value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="City" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                            value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                                        <input required placeholder="Pincode" className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                            value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
                                    </div>

                                    {/* State Selector */}
                                    <div className="space-y-1">
                                        <label className="text-xs opacity-60">State</label>
                                        <select
                                            className="w-full p-4 bg-white border border-[var(--color-primary)]/20 focus:outline-none"
                                            value={address.state}
                                            onChange={e => setAddress({ ...address, state: e.target.value })}
                                        >
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-xs hover:opacity-90 mt-8 font-medium">
                                    {loading ? 'Processing...' : `Pay ₹${total}.00`}
                                </button>
                                <button type="button" onClick={() => setStep('cart')} className="w-full text-xs underline opacity-50 hover:opacity-100">
                                    Back to Cart
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
