/**
 * /api/applications
 * Route stub — in production, API Gateway intercepts this path and routes to
 * finserve-applications Lambda (guide section 9.3).
 *
 * GET  → Lambda queries finserve-applications DynamoDB using userId-index GSI.
 *        Returns a plain array (not {items:[]}).
 * POST → Lambda creates a new application record and returns { id: string }.
 *
 * Auth: Cognito ID token in Authorization header (raw token, no Bearer prefix).
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-applications Lambda' },
    { status: 501 }
  );
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-applications Lambda' },
    { status: 501 }
  );
}
