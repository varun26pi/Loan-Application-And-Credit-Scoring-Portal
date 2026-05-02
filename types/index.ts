// FIX 17: Added 'under_review' to LoanApplication.status union — this status is
// written by the finserve-applications Lambda when documents are being verified
// by Textract (between 'pending' and a final decision). Without it, TypeScript
// would error and the tracker page's statusToStageIndex would silently fall through.

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  aadharNumber?: string;
  panNumber?: string;
  createdAt: Date;
}

export interface LoanApplication {
  id: string;
  userId: string;
  loanType: 'personal' | 'home' | 'auto' | 'education';
  requestedAmount: number;
  tenure: number; // in months
  monthlyIncome: number;
  // FIX 17: 'under_review' added — set by Lambda when Textract doc processing is active
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'conditional';
  creditScore?: number;
  documents: Document[];
  personalDetails: PersonalDetails;
  employmentDetails: EmploymentDetails;
  repaymentDetails?: RepaymentDetails;
  // Populated by finserve-admin Lambda on approval (used by SES LOAN_APPROVED template)
  approvedAmount?: number;
  interestRate?: number;
  decisionReason?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadharNumber: string;
  panNumber: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
}

export interface EmploymentDetails {
  employmentType: 'salaried' | 'self_employed' | 'business' | 'retired' | 'student';
  companyName: string;
  jobTitle: string;
  yearsOfExperience: number;
  monthlyIncome: number;
  additionalIncome?: number;
  employerPhoneNumber?: string;
  university?: string;
  course?: string;
}

export interface RepaymentDetails {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  rateOfInterest: number;
}

export interface Document {
  id: string;
  applicationId: string;
  name: string;
  // FIX 4 & 5: Added 'itr' | 'form16' to match the documentType values sent in API calls
  type: 'aadhar' | 'pan' | 'salary_slip' | 'bank_statement' | 'itr' | 'form16' | 'photo' | 'other';
  s3Key: string;
  fileUrl: string;
  uploadedAt: Date;
  verified?: boolean;
  // Set by finserve-textract-parser Lambda after Textract job completes
  status?: 'pending' | 'processing' | 'extracted' | 'failed';
  extractedData?: Record<string, any>;
  aiSummary?: string;
}

export interface AdminReview {
  applicationId: string;
  decision: 'approved' | 'rejected' | 'conditional';
  reason?: string;
  reviewedAt: Date;
  reviewedBy: string;
  conditions?: string[];
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number;
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  baseRate: number;
  processingFeePercent: number;
  eligibility: string;
}

export interface CreditScoreBreakdown {
  score: number;
  paymentHistory: number;
  creditUtilization: number;
  creditAge: number;
  creditMix: number;
  newCreditInquiries: number;
}
