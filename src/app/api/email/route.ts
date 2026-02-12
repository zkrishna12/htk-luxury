import { NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client with credentials from environment variables
const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@htkenterprises.net';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, html } = body;

        // 1. Validation
        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Check for AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.warn("⚠️ Mock Email Sent (No AWS Credentials):", { to, subject });
            return NextResponse.json({ success: true, mode: 'mock', message: 'Email simulated (Credentials missing)' });
        }

        // 3. Send email via Amazon SES
        const command = new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: html,
                    },
                },
            },
        });

        const result = await sesClient.send(command);
        console.log("📨 Email Sent via Amazon SES:", { to, subject, messageId: result.MessageId });

        return NextResponse.json({
            success: true,
            message: 'Email dispatched via Amazon SES',
            messageId: result.MessageId
        });

    } catch (error: any) {
        console.error("Email Error:", error);

        // Provide helpful error messages for common SES issues
        if (error.name === 'MessageRejected') {
            return NextResponse.json({
                error: 'Email rejected by SES. Verify sender/recipient email in SES console.',
                details: error.message
            }, { status: 400 });
        }

        if (error.name === 'AccessDeniedException' || error.name === 'InvalidClientTokenId') {
            return NextResponse.json({
                error: 'AWS credentials are invalid. Check your Access Key and Secret.',
                details: error.message
            }, { status: 403 });
        }

        return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
    }
}
