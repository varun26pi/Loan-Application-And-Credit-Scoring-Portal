/**
 * POST /api/documents/confirm
 * Route stub — production: API Gateway → finserve-documents Lambda.
 *
 * Body: { documentId, s3Key, applicationId, fileName, fileType, documentType }
 * Lambda writes the document record to finserve-documents DynamoDB table and
 * starts the appropriate Textract async job:
 *   aadhar | pan           → StartDocumentTextDetection
 *   salary_slip | bank_statement | itr | form16 → StartDocumentAnalysis (FORMS + TABLES)
 *   other                  → StartDocumentTextDetection
 *
 * Textract publishes to finserve-textract-complete SNS when done →
 * triggers finserve-textract-parser Lambda → writes extractedData to DynamoDB.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'In production this route is handled by API Gateway → finserve-documents Lambda' },
    { status: 501 }
  );
}
