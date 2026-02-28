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
import { useRewards, rupeesToPoints, pointsToRupees } from '@/context/RewardsContext';

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
    const { points, canRedeem, addPoints } = useRewards();
    const [step, setStep] = React.useState('cart'); // 'cart' | 'address'
    const [loading, setLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [lastOrder, setLastOrder] = React.useState<any>(null);
    // Rewards redemption state
    const [redeemedPoints, setRedeemedPoints] = React.useState(0);
    const [redeemApplied, setRedeemApplied] = React.useState(false);
    const [earnedPointsThisOrder, setEarnedPointsThisOrder] = React.useState(0);

    // Bulk discount calculation
    const totalItemQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const bulkDiscountRate = totalItemQty >= 8 ? 0.12 : totalItemQty >= 5 ? 0.08 : totalItemQty >= 3 ? 0.05 : 0;
    const bulkDiscountLabel = totalItemQty >= 8 ? '12% — 8+ items' : totalItemQty >= 5 ? '8% — 5+ items' : totalItemQty >= 3 ? '5% — 3+ items' : '';
    const bulkDiscountAmount = Math.round(total * bulkDiscountRate);
    // Subtotal after bulk discount
    const subtotalAfterBulk = total - bulkDiscountAmount;
    // Coupon discount is applied on subtotalAfterBulk
    const couponDiscount = coupon
        ? coupon.type === 'percentage'
            ? Math.round(subtotalAfterBulk * coupon.value / 100)
            : coupon.value
        : 0;
    const subtotalAfterCoupon = Math.max(subtotalAfterBulk - couponDiscount, 0);

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

    // Saved address state
    const [savedAddress, setSavedAddress] = React.useState<any>(null);
    const [hasSavedAddress, setHasSavedAddress] = React.useState(false);
    const [loadingAddress, setLoadingAddress] = React.useState(false);
    const [saveAddressChecked, setSaveAddressChecked] = React.useState(true);
    // Controls whether the saved address banner is shown vs. editing a new address
    const [usingSavedAddress, setUsingSavedAddress] = React.useState(false);

    // Reset step when cart opens
    React.useEffect(() => {
        if (cartOpen) {
            setStep('cart');
            setShowSuccess(false);
            setRedeemedPoints(0);
            setRedeemApplied(false);
            setEarnedPointsThisOrder(0);
        }
    }, [cartOpen]);

    // Compute redeemable points (round down to nearest 100)
    const maxRedeemablePoints = Math.floor(points / 100) * 100;
    const pointsDiscount = redeemApplied ? pointsToRupees(redeemedPoints) : 0;
    // Final total: bulk discount first, then coupon, then points (points do NOT stack with bulk when redeemed)
    const finalTotal = Math.max(subtotalAfterCoupon - pointsDiscount, 0);

    const handleApplyRedemption = () => {
        // Redeem all available (rounded to 100) but cap so discount <= subtotalAfterCoupon
        const maxByTotal = Math.floor(subtotalAfterCoupon / 10) * 100; // 100pts = ₹10
        const toRedeem = Math.min(maxRedeemablePoints, maxByTotal);
        if (toRedeem >= 100) {
            setRedeemedPoints(toRedeem);
            setRedeemApplied(true);
        }
    };

    const handleRemoveRedemption = () => {
        setRedeemedPoints(0);
        setRedeemApplied(false);
    };

    if (!cartOpen) return null;

    const handleProceed = async () => {
        if (!auth.currentUser) {
            setCartOpen(false);
            router.push('/login');
            return;
        }
        // Fetch saved address from Firestore before showing address step
        try {
            setLoadingAddress(true);
            const uid = auth.currentUser.uid;
            const addrRef = doc(db, 'users', uid, 'addresses', 'default');
            const addrSnap = await getDoc(addrRef);
            if (addrSnap.exists()) {
                const saved = addrSnap.data();
                setSavedAddress(saved);
                setHasSavedAddress(true);
                setUsingSavedAddress(true);
                // Pre-fill address fields with saved data
                setAddress({
                    name: saved.name || '',
                    phone: saved.phone || '',
                    houseNumber: saved.houseNumber || '',
                    area: saved.area || '',
                    street: saved.street || '',
                    landmark: saved.landmark || '',
                    city: saved.city || '',
                    state: saved.state || 'Tamil Nadu',
                    pincode: saved.pincode || ''
                });
            } else {
                setSavedAddress(null);
                setHasSavedAddress(false);
                setUsingSavedAddress(false);
                // Reset address form for a fresh entry
                setAddress({ name: '', phone: '', houseNumber: '', area: '', street: '', landmark: '', city: '', state: 'Tamil Nadu', pincode: '' });
            }
        } catch (err) {
            console.error('Failed to fetch saved address:', err);
            setHasSavedAddress(false);
            setUsingSavedAddress(false);
        } finally {
            setLoadingAddress(false);
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
            amount: finalTotal * 100,
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
                        total: finalTotal,
                        originalTotal: total,
                        ...(bulkDiscountAmount > 0 ? { bulkDiscountAmount, bulkDiscountLabel } : {}),
                        ...(redeemApplied ? { redeemedPoints, pointsDiscount } : {}),
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

                    // 4. Award loyalty points (non-blocking)
                    const pointsEarned = rupeesToPoints(finalTotal);
                    if (pointsEarned > 0 && auth.currentUser) {
                        addPoints(pointsEarned, `Purchase: Order #${response.razorpay_payment_id.slice(-8)}`)
                            .catch(err => console.error('Points award failed:', err));
                    }
                    setEarnedPointsThisOrder(pointsEarned);

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
                            total: finalTotal,
                            itemCount: items.length,
                            address: `${address.houseNumber}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
                        }
                    });

                    // Send WhatsApp notification for new order
                    sendWhatsAppOrderNotification({
                        paymentId: response.razorpay_payment_id,
                        customerName: address.name,
                        phone: address.phone,
                        total: finalTotal,
                        itemCount: items.length,
                        items: items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
                        address: `${address.houseNumber}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`
                    });

                    console.log("Order saved.");

                    setLastOrder({ ...orderData, id: response.razorpay_payment_id });
                    setShowSuccess(true);
                    clearCart();

                    // Save address to Firestore if user opted in
                    if (saveAddressChecked && auth.currentUser) {
                        try {
                            const uid = auth.currentUser.uid;
                            await setDoc(doc(db, 'users', uid, 'addresses', 'default'), address);
                        } catch (addrSaveErr) {
                            console.error('Failed to save address:', addrSaveErr);
                            // Non-blocking — order already succeeded
                        }
                    }

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

    // Quick Pay: skip form, use saved address directly
    const handleQuickPay = async () => {
        if (!savedAddress) return;
        // Ensure address state is set from savedAddress
        const quickAddress = { ...savedAddress };
        setAddress(quickAddress);

        const isStockValid = await validateStock();
        if (!isStockValid) return;

        if (!window.Razorpay) {
            alert('Payment gateway failed.');
            return;
        }

        const options = {
            key: "rzp_live_RyH14ZV1BzEA8D",
            amount: finalTotal * 100,
            currency: "INR",
            name: "HTK Enterprises",
            description: "Organic Goods",
            image: "/logo.png",
            handler: async function (response: any) {
                setLoading(true);
                console.log("Quick Pay Success:", response);
                try {
                    const deliveryDays = quickAddress.state?.toLowerCase().includes('tamil') ? '2-3 Business Days' : '4-5 Business Days';

                    const orderData = {
                        userId: auth.currentUser?.uid || 'guest',
                        userPhone: auth.currentUser?.phoneNumber || quickAddress.phone,
                        items: items,
                        total: finalTotal,
                        originalTotal: total,
                        ...(bulkDiscountAmount > 0 ? { bulkDiscountAmount, bulkDiscountLabel } : {}),
                        ...(redeemApplied ? { redeemedPoints, pointsDiscount } : {}),
                        address: quickAddress,
                        paymentId: response.razorpay_payment_id,
                        status: 'paid',
                        deliveryEstimate: deliveryDays,
                        createdAt: serverTimestamp()
                    };

                    await setDoc(doc(db, 'orders', response.razorpay_payment_id), orderData);

                    try {
                        for (const item of items) {
                            const productRef = doc(db, 'products', item.id);
                            await updateDoc(productRef, {
                                stock: increment(-item.quantity)
                            });
                        }
                    } catch (inventoryError) {
                        console.error("Inventory Decrement Failed:", inventoryError);
                    }

                    // Award loyalty points (non-blocking)
                    const pointsEarned = rupeesToPoints(finalTotal);
                    if (pointsEarned > 0 && auth.currentUser) {
                        addPoints(pointsEarned, `Purchase: Order #${response.razorpay_payment_id.slice(-8)}`)
                            .catch(err => console.error('Points award failed:', err));
                    }
                    setEarnedPointsThisOrder(pointsEarned);

                    fetch('/api/email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: auth.currentUser?.email || quickAddress.name + "@example.com",
                            subject: `HTK Order Confirmation: ${response.razorpay_payment_id}`,
                            html: `<h1>Order Received</h1><p>Thank you, ${quickAddress.name}. Your order ID is ${response.razorpay_payment_id}.</p>`
                        })
                    }).catch(err => console.error("Email Trigger Failed", err));

                    sendAdminNotification({
                        type: 'order',
                        data: {
                            paymentId: response.razorpay_payment_id,
                            customerName: quickAddress.name,
                            phone: quickAddress.phone,
                            total: finalTotal,
                            itemCount: items.length,
                            address: `${quickAddress.houseNumber}, ${quickAddress.area}, ${quickAddress.city}, ${quickAddress.state} - ${quickAddress.pincode}`
                        }
                    });

                    sendWhatsAppOrderNotification({
                        paymentId: response.razorpay_payment_id,
                        customerName: quickAddress.name,
                        phone: quickAddress.phone,
                        total: finalTotal,
                        itemCount: items.length,
                        items: items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
                        address: `${quickAddress.houseNumber}, ${quickAddress.area}, ${quickAddress.city}, ${quickAddress.state} - ${quickAddress.pincode}`
                    });

                    setLastOrder({ ...orderData, id: response.razorpay_payment_id });
                    setShowSuccess(true);
                    clearCart();
                } catch (error) {
                    console.error("Quick Pay Handler Error:", error);
                    alert("Payment successful, but an error occurred. Please contact support with Payment ID: " + response.razorpay_payment_id);
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: quickAddress.name,
                contact: quickAddress.phone,
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

                    {/* Points earned badge */}
                    {earnedPointsThisOrder > 0 && auth.currentUser && (
                        <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-sm" style={{ background: '#FFFBEB', border: '1.5px solid #D4AF37' }}>
                            <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-5 h-5 flex-shrink-0">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                            </svg>
                            <span className="text-sm font-medium" style={{ color: '#92400E' }}>
                                You earned <strong style={{ color: '#D4AF37' }}>+{earnedPointsThisOrder} HTK Points</strong>!
                            </span>
                        </div>
                    )}

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

                                        {/* Bulk Discount Progress Hint */}
                                        {totalItemQty === 2 && (
                                            <div className="text-xs text-center py-2 px-3 rounded-sm" style={{ background: '#FFFBEB', border: '1px solid #D4AF37', color: '#92400E' }}>
                                                Add 1 more item for <strong style={{ color: '#D4AF37' }}>5% bulk discount!</strong>
                                            </div>
                                        )}

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

                                        {/* Subtotal line */}
                                        <div className="flex justify-between text-sm opacity-60">
                                            <span>Subtotal</span>
                                            <span>₹{total}.00</span>
                                        </div>

                                        {/* Bulk Discount line */}
                                        {bulkDiscountAmount > 0 && (
                                            <div className="flex justify-between text-sm" style={{ color: '#D4AF37' }}>
                                                <span>Bulk Discount ({bulkDiscountLabel})</span>
                                                <span>-₹{bulkDiscountAmount}.00</span>
                                            </div>
                                        )}

                                        {coupon && (
                                            <div className="flex justify-between text-sm text-[var(--color-primary)]">
                                                <span>Coupon ({coupon.code}) <button onClick={removeCoupon} className="text-red-500 ml-2 text-xs hover:underline">(Remove)</button></span>
                                                <span>-₹{couponDiscount}.00</span>
                                            </div>
                                        )}

                                        {/* Rewards Points Redemption */}
                                        {auth.currentUser && maxRedeemablePoints >= 100 && (
                                            <div className="p-3 rounded-sm" style={{ background: '#FFFBEB', border: '1px solid #D4AF37' }}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-4 h-4 flex-shrink-0">
                                                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                                                        </svg>
                                                        <span className="text-xs truncate" style={{ color: '#92400E' }}>
                                                            {redeemApplied
                                                                ? <><strong style={{ color: '#D4AF37' }}>-₹{pointsDiscount}</strong> applied ({redeemedPoints} pts)</>  
                                                                : <><strong>{points}</strong> pts available (₹{pointsToRupees(maxRedeemablePoints)} value)</>}
                                                        </span>
                                                    </div>
                                                    {redeemApplied ? (
                                                        <button
                                                            onClick={handleRemoveRedemption}
                                                            className="text-[10px] px-2 py-1 border flex-shrink-0 transition-colors hover:opacity-70"
                                                            style={{ borderColor: '#D4AF37', color: '#92400E' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={handleApplyRedemption}
                                                            className="text-[10px] px-2 py-1 flex-shrink-0 font-medium transition-colors"
                                                            style={{ background: '#D4AF37', color: 'white' }}
                                                        >
                                                            Redeem Points
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {redeemApplied && (
                                            <div className="flex justify-between text-sm" style={{ color: '#D4AF37' }}>
                                                <span>Points Discount</span>
                                                <span>-₹{pointsDiscount}.00</span>
                                            </div>
                                        )}

                                        {/* Savings Summary */}
                                        {bulkDiscountAmount > 0 && (
                                            <div className="text-xs text-center py-2 px-3 rounded-sm" style={{ background: '#F0FDF4', border: '1px solid #1F3D2B40', color: '#1F3D2B' }}>
                                                You're saving <strong style={{ color: '#D4AF37' }}>₹{bulkDiscountAmount + couponDiscount + pointsDiscount}</strong> on this order!
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xl font-serif pt-2 border-t border-dashed border-[var(--color-primary)]/20">
                                            <span>Total</span>
                                            <span>₹{finalTotal}.00</span>
                                        </div>

                                        <button onClick={handleProceed} disabled={loadingAddress} className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-xs hover:opacity-90 mt-4 font-medium disabled:opacity-60">
                                            {loadingAddress ? 'Loading...' : auth.currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
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

                                {/* Saved Address Banner — shown when user has a saved address */}
                                {hasSavedAddress && savedAddress && (
                                    <div className="border border-[#D4AF37] bg-[#D4AF37]/8 p-4 space-y-3 rounded-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium tracking-widest text-[#D4AF37] uppercase">Saved Address</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block"></span>
                                                </div>
                                                <p className="text-sm font-serif text-[var(--color-primary)] font-semibold">{savedAddress.name}</p>
                                                <p className="text-xs opacity-70 leading-relaxed">
                                                    {savedAddress.houseNumber}, {savedAddress.area}{savedAddress.street ? `, ${savedAddress.street}` : ''}{savedAddress.landmark ? ` (${savedAddress.landmark})` : ''}<br />
                                                    {savedAddress.city}, {savedAddress.state} — {savedAddress.pincode}
                                                </p>
                                                <p className="text-xs opacity-60">{savedAddress.phone}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUsingSavedAddress(false);
                                                    setAddress({ name: '', phone: '', houseNumber: '', area: '', street: '', landmark: '', city: '', state: 'Tamil Nadu', pincode: '' });
                                                }}
                                                className="text-[10px] border border-[var(--color-primary)]/30 px-3 py-1.5 hover:bg-[var(--color-primary)] hover:text-white transition-colors font-medium text-[var(--color-primary)] flex-shrink-0"
                                            >
                                                Change
                                            </button>
                                        </div>

                                        {/* Quick Pay Button */}
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleQuickPay}
                                            className="w-full py-3.5 bg-[#D4AF37] text-white text-xs font-medium hover:bg-[#BFA76A] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {loading ? 'Processing...' : `Quick Pay  ₹${finalTotal}.00`}
                                        </button>

                                        <p className="text-[10px] opacity-50 text-center">Or fill the form below to use a different address</p>
                                    </div>
                                )}

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

                                    {/* Save address checkbox */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={saveAddressChecked}
                                            onChange={e => setSaveAddressChecked(e.target.checked)}
                                            className="w-4 h-4 accent-[#1F3D2B] cursor-pointer"
                                        />
                                        <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                            Save this address for faster checkout
                                        </span>
                                    </label>
                                </div>

                                <button type="submit" disabled={loading} className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-background)] text-xs hover:opacity-90 mt-8 font-medium disabled:opacity-60">
                                    {loading ? 'Processing...' : `Pay ₹${finalTotal}.00`}
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
