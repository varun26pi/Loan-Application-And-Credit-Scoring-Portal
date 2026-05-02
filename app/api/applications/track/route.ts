/**
 * POST /api/applications/track
 * Route stub — production: API Gateway → finserve-applications Lambda.
 * Public endpoint — NO Cognito authorizer (guide section 9.3).
 *
 * Body: { applicationId: string, phoneLast4: string }
 * Lambda validates phoneLast4 against the stored phone number before returning status.
 * Returns: application status + timeline without sensitive personal details.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-applications Lambda' },
    { status: 501 }
  );
}
