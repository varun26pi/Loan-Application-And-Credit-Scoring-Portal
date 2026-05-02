/**
 * api-client.ts
 * Centralized API client — all calls go through API Gateway.
 */

import { fetchAuthSession } from '@aws-amplify/auth';
import { API_GATEWAY_URL } from '@/lib/aws-config';

export const BY_USER_ID = 'userId-index';
export const BY_STATUS  = 'status-createdAt-index';

async function getAuthToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) headers['Authorization'] = token;
  }

  const res = await fetch(`${API_GATEWAY_URL}${path}`, {
    ...options,
    headers,
  });

  // FIX: log the raw error body before throwing so it's visible in the browser console
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    console.error('🔥 API error response:', JSON.stringify(err), '| HTTP status:', res.status, '| path:', path);
    throw new Error((err as any).error || (err as any).detail || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // FIX: log every successful response so we can verify the shape
  console.log('🔥 RAW API response from', path, ':', JSON.stringify(data));

  // Handle API Gateway non-proxy mode where Lambda response is wrapped in { statusCode, body }
  if (data && typeof data.body === 'string') {
    const parsed = JSON.parse(data.body);
    console.log('🔥 Parsed body:', JSON.stringify(parsed));
    return parsed;
  }

  return data;
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }, false),

  sendOtp: (phone: string, email?: string) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone, email }) }, false),

  verifyOtp: (identifier: string, otp: string) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    }, false),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),
};

// ── Applications API ──────────────────────────────────────────────────────────
export const applicationsApi = {
  list: () =>
    request<any[]>('/applications'),

  create: (data: Record<string, unknown>) =>
    request<{ applicationId: string; id?: string; status: string; message: string }>(
      '/applications',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  get: (id: string) =>
    request<any>(`/applications/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    request(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  track: (applicationId: string, phoneLast4: string = '0000') =>
    request<any>('/applications/track', {
      method: 'POST',
      body: JSON.stringify({ applicationId, phoneLast4 }),
    }, false),
};

// ── Documents API ─────────────────────────────────────────────────────────────
export const documentsApi = {
  getPresignedUrl: (
    fileName: string,
    fileType: string,
    applicationId: string,
    documentType: string = 'other',
    fileSize: number
  ) =>
    request<{ uploadUrl: string; s3Key: string; documentId: string }>(
      '/documents/presigned-url',
      {
        method: 'POST',
        body: JSON.stringify({ fileName, fileType, applicationId, documentType, fileSize }),
      }
    ),

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!res.ok) throw new Error(`S3 upload failed: HTTP ${res.status}`);
  },

  confirmUpload: (
    documentId: string,
    s3Key: string,
    applicationId: string,
    fileName: string,
    fileType: string,
    documentType: string = 'other'
  ) =>
    request('/documents/confirm', {
      method: 'POST',
      body: JSON.stringify({ documentId, s3Key, applicationId, fileName, fileType, documentType }),
    }),

  getStatus: (id: string) =>
    request<{ status: string; extractedData?: any }>(`/documents/${id}/status`),

  getExtractedData: (id: string) =>
    request<{ extractedData: any }>(`/documents/${id}/extracted`),

  verify: (id: string, verified: boolean, reason?: string) =>
    request(`/documents/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified, reason: reason ?? '' }),
    }),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  listApplications: (status?: string) =>
    request<any[]>(`/admin/applications${status ? `?status=${status}` : ''}`),

  submitDecision: (
    applicationId: string,
    decision: string,
    reason?: string,
    conditions?: string,
    approvedAmount?: number,
    interestRate?: number,
    tenure?: number
  ) =>
    request(`/admin/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        reason: reason ?? '',
        conditions: conditions ? [conditions] : [],
        approvedAmount: approvedAmount ?? 0,
        interestRate: interestRate ?? 0,
        tenure: tenure ?? 0,
      }),
    }),

  getAuditLogs: (startDate?: string, endDate?: string) =>
    request<any[]>(
      `/admin/audit${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`
    ),

  getReports: () =>
    request<any>('/admin/reports'),
};