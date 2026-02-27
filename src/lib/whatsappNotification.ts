/**
 * WhatsApp notification utility for HTK Enterprises.
 * Sends order notifications to the admin WhatsApp number.
 * 
 * Uses GREEN-API (free Developer plan — unlimited messages, 3 chats).
 * 
 * SETUP (one-time):
 * 1. Go to https://green-api.com and create a free account
 * 2. Create an instance (choose "Developer" free plan)
 * 3. Link your WhatsApp by scanning the QR code
 * 4. Copy idInstance and apiTokenInstance from your dashboard
 * 5. Update GREEN_API_INSTANCE_ID and GREEN_API_TOKEN below
 */

const ADMIN_WHATSAPP_CHAT_ID = '918838660900@c.us';

// Set these after completing GREEN-API one-time setup
// Get them from: https://console.green-api.com/
const GREEN_API_INSTANCE_ID = '7103532530';
const GREEN_API_TOKEN = '260e97b1ce234eb6bad14939a64370bff2000506007441a590';

interface OrderNotification {
    paymentId: string;
    customerName: string;
    phone: string;
    total: number;
    itemCount: number;
    items: string;
    address: string;
}

/**
 * Format the WhatsApp message for an order notification
 */
function formatOrderMessage(order: OrderNotification): string {
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return [
        `🛒 *NEW ORDER RECEIVED*`,
        ``,
        `*Order ID:* ${order.paymentId}`,
        `*Customer:* ${order.customerName}`,
        `*Phone:* ${order.phone}`,
        `*Amount:* ₹${order.total}`,
        `*Items (${order.itemCount}):* ${order.items}`,
        `*Address:* ${order.address}`,
        `*Time:* ${time}`,
        ``,
        `— HTK Enterprises`
    ].join('\n');
}

/**
 * Send WhatsApp notification for a new order via GREEN-API.
 * Non-blocking — failures are logged but don't throw.
 */
export async function sendWhatsAppOrderNotification(order: OrderNotification): Promise<void> {
    const message = formatOrderMessage(order);

    if (!GREEN_API_INSTANCE_ID || !GREEN_API_TOKEN) {
        console.warn('⚠️ GREEN-API credentials not configured. WhatsApp notification skipped.');
        console.log('Order notification message:', message);
        return;
    }

    try {
        const url = `https://api.green-api.com/waInstance${GREEN_API_INSTANCE_ID}/sendMessage/${GREEN_API_TOKEN}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: ADMIN_WHATSAPP_CHAT_ID,
                message: message,
            }),
        });

        if (response.ok) {
            console.log('✅ WhatsApp notification sent via GREEN-API');
        } else {
            const errorText = await response.text();
            console.error('❌ GREEN-API response error:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ WhatsApp notification failed:', error);
    }
}
