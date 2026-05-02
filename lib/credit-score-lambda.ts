/**
 * lib/credit-score-lambda.ts
 * Calls the finserve-credit-score Lambda via API Gateway.
 * Credit score is calculated server-side using applicant data.
 */

import { API_GATEWAY_URL } from '@/lib/aws-config';
import { fetchAuthSession } from '@aws-amplify/auth';

export async function getCreditScore(applicationId: string): Promise<number | null> {
  try {
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString();

    const res = await fetch(`${API_GATEWAY_URL}/applications/${applicationId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.creditScore ?? null;
  } catch {
    return null;
  }
}
