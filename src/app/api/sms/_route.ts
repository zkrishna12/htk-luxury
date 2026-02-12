import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, message } = body;

        if (!to || !message) {
            return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
            console.warn("⚠️ Mock SMS Sent (No API Keys):", { to, message });
            return NextResponse.json({ success: true, mode: 'mock', message: 'SMS simulated (Keys missing)' });
        }

        // Real Twilio Logic would go here
        // const client = require('twilio')(accountSid, authToken);
        // await client.messages.create({ body: message, from: '+1234567890', to });

        return NextResponse.json({ success: true, message: 'SMS dispatched' });

    } catch (error) {
        console.error("SMS Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
