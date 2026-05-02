/**
 * /api/applications/[id]
 * Route stub — production: API Gateway → finserve-applications Lambda.
 *
 * GET   → Returns full application record from DynamoDB.
 * PATCH → Updates application status/fields. Used by admin decisions.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-applications Lambda' },
    { status: 501 }
  );
}

export async function PATCH(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-applications Lambda' },
    { status: 501 }
  );
}
