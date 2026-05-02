/**
 * GET /api/admin/applications
 * Route stub — production: API Gateway → finserve-admin Lambda.
 * Auth: Cognito authorizer — admins and loan-officers group only.
 * Query: ?status=pending|approved|rejected|conditional (optional)
 *
 * Lambda queries finserve-applications using status-createdAt-index GSI.
 * Returns a plain array (not {items:[]}).
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-admin Lambda' },
    { status: 501 }
  );
}
