/**
 * POST /api/auth/register
 * Next.js route stub. Production: API Gateway → finserve-auth Lambda → Cognito SignUp.
 * Lambda also creates DynamoDB record in finserve-users table and sends welcome SES email.
 *
 * Required body fields (matching Cognito user pool attributes from guide section 4.1):
 *   email, password, firstName, lastName, phone (+91XXXXXXXXXX format)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json();

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, firstName, lastName, phone' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with a number and special character' },
        { status: 400 }
      );
    }

    // In production this route is never reached — API Gateway intercepts it.
    // For local dev, AuthContext.tsx calls Amplify signUp() directly.
    return NextResponse.json(
      { error: 'Use Amplify client-side auth in development' },
      { status: 501 }
    );
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
