/**
 * GET /api/documents/[id]/extracted
 * Route stub — production: API Gateway → finserve-documents Lambda.
 * Returns the full extracted data from Textract + Comprehend AI summary.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-documents Lambda' },
    { status: 501 }
  );
}
