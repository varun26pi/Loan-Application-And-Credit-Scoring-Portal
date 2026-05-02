/**
 * GET /api/admin/reports
 * Route stub — production: API Gateway → finserve-admin Lambda.
 * Auth: Cognito authorizer — admins and loan-officers group only.
 *
 * Lambda aggregates portfolio metrics from DynamoDB:
 * total applications, approval rate, avg credit score, loan type distribution,
 * avg decision time. Publishes custom CloudWatch metrics for the dashboard.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-admin Lambda' },
    { status: 501 }
  );
}
