/**
 * POST /api/auth/verify-otp
 * Production: API Gateway → finserve-auth Lambda → DynamoDB lookup + Cognito ConfirmSignUp.
 *
 * Lambda flow (guide section 8.2):
 *   1. Fetch OTP from finserve-otp-store by identifier
 *   2. Check TTL and code match
 *   3. Delete record (one-time use)
 *   4. Call Cognito ConfirmSignUp if this is a registration confirmation
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { identifier, otp } = await req.json();

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: 'Identifier and OTP are required' },
        { status: 400 }
      );
    }

    // Production: handled by finserve-auth Lambda.
    // For local dev, AuthContext uses Amplify confirmSignUp() directly.
    return NextResponse.json(
      { error: 'Use Amplify client-side auth in development' },
      { status: 501 }
    );
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err);
    return NextResponse.json({ error: 'Internal server error', verified: false }, { status: 500 });
  }
}
