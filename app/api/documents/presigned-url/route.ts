/**
 * POST /api/documents/presigned-url
 * Route stub — production: API Gateway → finserve-documents Lambda.
 *
 * Body: { fileName, fileType, applicationId, documentType }
 * documentType is required — Lambda uses it to:
 *   1. Set the S3 object metadata
 *   2. Choose the correct Textract job type in /documents/confirm
 *
 * Returns: { uploadUrl: string, s3Key: string, documentId: string }
 * Browser uploads directly to S3 using the presigned PUT URL — Lambda is not in the upload path.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-documents Lambda' },
    { status: 501 }
  );
}
