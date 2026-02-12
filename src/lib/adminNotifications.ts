/**
 * Admin notification utility for HTK Enterprises.
 * Sends email notifications to support@htkenterprises.net for key events.
 */

const ADMIN_EMAIL = 'support@htkenterprises.net';

interface NotificationData {
    type: 'newsletter' | 'registration' | 'order' | 'review' | 'feedback';
    data: Record<string, unknown>;
}

/**
 * Send admin notification email for important events.
 * Non-blocking - failures are logged but don't throw.
 */
export async function sendAdminNotification(notification: NotificationData): Promise<void> {
    const { type, data } = notification;

    let subject = '';
    let html = '';

    switch (type) {
        case 'newsletter':
            subject = '🎉 New Inner Circle Member!';
            html = `
                <h2>New Newsletter Subscription</h2>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Coupon Code:</strong> ${data.couponCode}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            `;
            break;

        case 'registration':
            subject = '👤 New User Registration';
            html = `
                <h2>New User Registered</h2>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>User ID:</strong> ${data.userId}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            `;
            break;

        case 'order':
            subject = `🛒 New Order Received! #${data.paymentId}`;
            html = `
                <h2>New Order Placed</h2>
                <p><strong>Order ID:</strong> ${data.paymentId}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Amount:</strong> ₹${data.total}</p>
                <p><strong>Items:</strong> ${data.itemCount} items</p>
                <p><strong>Address:</strong> ${data.address}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            `;
            break;

        case 'review':
            subject = `⭐ New Review from ${data.name}`;
            html = `
                <h2>New Customer Review</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating as number)}</p>
                <p><strong>Review:</strong></p>
                <blockquote style="border-left: 3px solid #D4AF37; padding-left: 16px; margin: 16px 0; color: #555;">
                    ${data.text}
                </blockquote>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            `;
            break;

        case 'feedback':
            subject = `💬 New Feedback: ${data.type}`;
            html = `
                <h2>New Customer Feedback</h2>
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 3px solid #D4AF37; padding-left: 16px; margin: 16px 0; color: #555;">
                    ${data.message}
                </blockquote>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            `;
            break;
    }

    try {
        await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: ADMIN_EMAIL,
                subject: `[HTK Admin] ${subject}`,
                html: `
                    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #1F3D2B; margin: 0;">HTK Enterprises</h1>
                            <p style="color: #888; font-size: 12px; margin: 4px 0;">Admin Notification</p>
                        </div>
                        ${html}
                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                        <p style="color: #888; font-size: 11px; text-align: center;">
                            This is an automated notification from HTK Enterprises website.
                        </p>
                    </div>
                `
            })
        });
        console.log(`✅ Admin notification sent: ${type}`);
    } catch (error) {
        console.error(`❌ Failed to send admin notification: ${type}`, error);
        // Non-blocking - don't throw
    }
}
