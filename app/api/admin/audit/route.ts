/**
 * GET /api/admin/audit
 * Route stub — production: API Gateway → finserve-audit Lambda.
 * Auth: Cognito authorizer — admins group only.
 * Query: ?startDate=ISO8601&endDate=ISO8601 (optional)
 *
 * Lambda queries finserve-audit-logs DynamoDB (sort key: timestamp).
 * Audit logs are immutable — IAM deny policy prevents DeleteItem/UpdateItem.
 * Returns a plain array (not {items:[]}).
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-audit Lambda' },
    { status: 501 }
  );
}
