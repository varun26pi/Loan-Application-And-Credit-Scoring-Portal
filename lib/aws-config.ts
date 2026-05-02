// Centralized AWS resource constants and environment variable mapping
// FIX 13: Removed COGNITO_DOMAIN — Hosted UI is disabled (guide section 4.1: "Do NOT enable")
// FIX 11: Removed API_STAGE — not needed client-side; stage is baked into API_GATEWAY_URL

export const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
export const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!;
export const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL!;
export const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET!;
export const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;

// Server-side only — Lambda environment variables (never in .env.local / never exposed to browser)
export const DYNAMODB_USERS_TABLE = process.env.DYNAMODB_USERS_TABLE!;
export const DYNAMODB_APPLICATIONS_TABLE = process.env.DYNAMODB_APPLICATIONS_TABLE!;
export const DYNAMODB_DOCUMENTS_TABLE = process.env.DYNAMODB_DOCUMENTS_TABLE!;
export const DYNAMODB_AUDIT_TABLE = process.env.DYNAMODB_AUDIT_TABLE!;
export const DYNAMODB_OTP_TABLE = process.env.DYNAMODB_OTP_TABLE!;
export const SNS_APPLICATION_UPDATES_TOPIC = process.env.SNS_APPLICATION_UPDATES_TOPIC!;
export const SNS_OTP_TOPIC = process.env.SNS_OTP_TOPIC!;
export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL!;
export const SES_REPLY_TO = process.env.SES_REPLY_TO!;
export const CLOUDTRAIL_BUCKET = process.env.CLOUDTRAIL_BUCKET!;

export function getDocumentUrl(key: string) {
  // Use CloudFront for previews if available (guide section 14.1)
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${key}`;
  }
  // Fallback to S3 direct URL (private bucket — use presigned URL in production)
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}
