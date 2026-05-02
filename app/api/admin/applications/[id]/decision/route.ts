/**
 * POST /api/admin/applications/[id]/decision
 * Route stub — production: API Gateway → finserve-admin Lambda.
 *
 * Body: {
 *   decision: 'approved' | 'rejected' | 'conditional'
 *   reason?: string
 *   conditions?: string[]        (conditional only)
 *   approvedAmount?: number      (approved only — SES template variable)
 *   interestRate?: number        (approved only — SES template variable)
 *   tenure?: number              (approved only — Lambda computes EMI)
 * }
 *
 * Lambda flow:
 *   1. Updates application status in finserve-applications DynamoDB
 *   2. Writes tamper-proof entry to finserve-audit-logs (immutable per IAM deny policy)
 *   3. Publishes to finserve-app-updates SNS topic
 *   4. finserve-notifications Lambda fires → sends SES email + SNS SMS to applicant
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-admin Lambda' },
    { status: 501 }
  );
}
