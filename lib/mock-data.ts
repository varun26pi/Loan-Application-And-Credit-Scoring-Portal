/**
 * mock-data.ts
 * Static reference data only — loan product definitions and pure calculation helpers.
 * All dynamic data (applications, documents, credit scores) is now fetched from
 * DynamoDB via API Gateway → Lambda. No mock applications remain.
 */

import { LoanProduct, CreditScoreBreakdown } from '@/types';

// ── Loan Products ─────────────────────────────────────────────────────────────
// These are static config values that match what the Lambda uses for rate calculations.
export const loanProducts: LoanProduct[] = [
  {
    id: 'personal-1',
    name: 'Personal Loan',
    description: 'Quick personal loans up to ₹50 lakhs with flexible tenure',
    minAmount: 10000,
    maxAmount: 5000000,
    minTenure: 12,
    maxTenure: 84,
    baseRate: 8.5,
    processingFeePercent: 1.5,
    eligibility: 'Min 21 years, salaried or self-employed',
  },
  {
    id: 'home-1',
    name: 'Home Loan',
    description: 'Affordable home loans up to ₹5 crores',
    minAmount: 500000,
    maxAmount: 50000000,
    minTenure: 60,
    maxTenure: 360,
    baseRate: 6.5,
    processingFeePercent: 0.5,
    eligibility: 'Min 25 years, co-applicant can be spouse',
  },
  {
    id: 'auto-1',
    name: 'Auto Loan',
    description: 'Easy vehicle financing for new and used cars',
    minAmount: 100000,
    maxAmount: 5000000,
    minTenure: 24,
    maxTenure: 84,
    baseRate: 7.5,
    processingFeePercent: 1.0,
    eligibility: 'Min 21 years, valid driving license required',
  },
  {
    id: 'education-1',
    name: 'Education Loan',
    description: 'Finance your education with minimal documentation',
    minAmount: 50000,
    maxAmount: 2000000,
    minTenure: 12,
    maxTenure: 180,
    baseRate: 9.0,
    processingFeePercent: 1.0,
    eligibility: 'For students pursuing higher education',
  },
];

// ── EMI Calculator (pure function — no AWS dependency) ────────────────────────
export function calculateEMI(
  principal: number,
  rateOfInterest: number,
  tenureMonths: number
): { monthlyEMI: number; totalInterest: number; totalAmount: number } {
  const monthlyRate = rateOfInterest / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  const monthlyEMI = Math.round(numerator / denominator);
  const totalAmount = monthlyEMI * tenureMonths;
  const totalInterest = totalAmount - principal;
  return { monthlyEMI, totalInterest, totalAmount };
}

// ── Tracker Stage Labels ──────────────────────────────────────────────────────
export const loanTrackerStatuses = [
  { status: 'submitted',    label: 'Application Submitted' },
  { status: 'verification', label: 'Documents Verification (Textract)' },
  { status: 'credit_check', label: 'Credit Score Calculated' },
  { status: 'approval',     label: 'Approval Review' },
  { status: 'processing',   label: 'Processing' },
  { status: 'disbursement', label: 'Disbursement' },
];
