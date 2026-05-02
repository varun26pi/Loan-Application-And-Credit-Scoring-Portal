/**
 * POST /api/auth/login
 * Next.js route stub — in production this path is handled by API Gateway
 * routing to the finserve-auth Lambda (see guide Phase 8 / section 9.3).
 *
 * In local development (npm run dev), this stub proxies to Cognito via
 * the Amplify SDK so you can test auth without deploying Lambda.
 *
 * PRODUCTION: API Gateway → finserve-auth Lambda → Cognito InitiateAuth
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In production this route is never reached — API Gateway intercepts it.
    // For local dev, the client-side AuthContext.tsx uses Amplify signIn() directly.
    return NextResponse.json(
      { error: 'Use Amplify client-side auth in development' },
      { status: 501 }
    );
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
