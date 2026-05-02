/**
 * POST /api/auth/send-otp
 * Production: API Gateway → finserve-auth Lambda → SNS SMS + DynamoDB OTP store.
 *
 * Lambda flow (guide section 8.2, 10.1):
 *   1. Generate 6-digit OTP
 *   2. Store in finserve-otp-store DynamoDB with TTL expiresAt = now + 300s
 *   3. Publish SMS via SNS_OTP_TOPIC
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();
    const identifier = phone || email;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Phone number or email is required' },
        { status: 400 }
      );
    }

    // Production: handled by finserve-auth Lambda via API Gateway.
    // For Cognito signup flow, Cognito sends the OTP automatically.
    return NextResponse.json(
      { error: 'Use Amplify client-side auth in development' },
      { status: 501 }
    );
  } catch (err) {
    console.error('[POST /api/auth/send-otp]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
