/**
 * lib/auth.ts
 * Shared validation helpers only.
 * All actual auth operations go through context/AuthContext.tsx (Amplify)
 * or lib/api-client.ts (API Gateway → Lambda → Cognito).
 */

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  // Guide requires: min 8 chars, numbers, special characters
  if (password.length < 8) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  return true;
}

export function validatePhone(phone: string): boolean {
  // Indian phone numbers: +91 followed by 10 digits
  return /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return phone;
}
