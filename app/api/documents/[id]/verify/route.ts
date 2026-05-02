/**
 * PATCH /api/documents/[id]/verify
 * Route stub — production: API Gateway → finserve-documents Lambda.
 * Body: { verified: boolean, reason?: string }
 * Loan officer marks a document as verified or flags it for re-upload.
 * Lambda writes the verification decision to finserve-documents DynamoDB and
 * appends an entry to finserve-audit-logs.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-documents Lambda' },
    { status: 501 }
  );
}
