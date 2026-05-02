/**
 * GET /api/documents/[id]/status
 * Route stub — production: API Gateway → finserve-documents Lambda.
 * Returns: { status: 'pending' | 'processing' | 'extracted' | 'failed', extractedData? }
 * Frontend polls this until status === 'extracted'.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-documents Lambda' },
    { status: 501 }
  );
}
