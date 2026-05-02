'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StepIndicator } from '@/components/ui/step-indicator';
import { loanProducts, calculateEMI } from '@/lib/mock-data';
import { applicationsApi, documentsApi } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import {
  Loader2, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Upload, X, File
} from 'lucide-react';

const steps = [
  { id: '1', label: 'Loan Type',         description: 'Choose your loan' },
  { id: '2', label: 'Amount & Tenure',   description: 'Loan details' },
  { id: '3', label: 'Personal Info',     description: 'Your details' },
  { id: '4', label: 'Employment & Docs', description: 'Work info + upload' },
];

const BASE_DOCUMENT_TYPES = [
  { value: 'aadhar',         label: 'Aadhaar Card' },
  { value: 'pan',            label: 'PAN Card' },
  { value: 'salary_slip',    label: 'Salary Slip' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'itr',            label: 'Income Tax Return (ITR)' },
  { value: 'form16',         label: 'Form 16' },
];

const EDUCATION_DOCUMENT_TYPES = [
  { value: 'marks_list',     label: 'Marks List' },
  { value: 'admission_letter', label: 'Admission Letter' },
];

// Helper function to get available document types based on loan type
const getAvailableDocumentTypes = (loanType: string) => {
  const documents = [...BASE_DOCUMENT_TYPES];
  if (loanType.startsWith('education')) {
    documents.push(...EDUCATION_DOCUMENT_TYPES);
  }
  return documents;
};

const INDIAN_STATES = [
  { value: '', label: 'Select a state' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
];

interface UploadedDoc {
  documentId: string;
  s3Key: string;
  fileName: string;
  fileType: string;
  documentType: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  file: File;
}

export default function LoanApplicationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [currentStep, setCurrentStep]           = useState(0);
  const [submitting, setSubmitting]             = useState(false);
  const [error, setError]                       = useState('');
  const [errorField, setErrorField]             = useState<string | null>(null);
  const [previewDoc, setPreviewDoc]             = useState<UploadedDoc | null>(null);
  const [previewUrl, setPreviewUrl]             = useState<string | null>(null);
  const [applicationId, setApplicationId]       = useState('');
  const [uploadedDocs, setUploadedDocs]         = useState<UploadedDoc[]>([]);
  const [uploadingFiles, setUploadingFiles]     = useState(false);
  const [selectedDocType, setSelectedDocType]   = useState('aadhar');

  // FIX: prevents double-submit when button is clicked rapidly
  const isSubmittingRef = useRef(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, isLoading, router]);

  const [formData, setFormData] = useState({
    loanType:          'personal-1',
    loanAmount:        500000,
    tenure:            36,
    firstName:         user?.firstName   ?? '',
    lastName:          user?.lastName    ?? '',
    dateOfBirth:       '',
    phoneNumber:       user?.phoneNumber ?? '',
    email:             user?.email       ?? '',
    address:           '',
    city:              '',
    state:             '',
    pincode:           '',
    aadharNumber:      '',
    panNumber:         '',
    maritalStatus:     'single',
    dependents:        '0',
    employmentType:    'salaried',
    companyName:       '',
    jobTitle:          '',
    yearsOfExperience: '',
    monthlyIncome:     '',
    additionalIncome:  '',  // empty string → 0 at payload; negatives blocked in handler
    university:        '',
    course:            '',
  });

  // ✅ REMOVED: Early application create
  // We now create the application only on final submit with isFinalSubmit=true
  // This prevents duplicate applications and ensures email is sent immediately

  // ── Input handler ──────────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'monthlyIncome' || name === 'yearsOfExperience') {
      // Ensure numeric fields are properly captured as strings for validation,
      // converted to numbers during payload building
      const num = Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(num) || num < 0 ? '' : value,
      }));
      return;
    }

    if (name === 'additionalIncome') {
      const num = Number(value);
      setFormData((prev) => ({
        ...prev,
        additionalIncome: isNaN(num) || num < 0 ? '' : value,
      }));
      return;
    }

    if (name === 'firstName' || name === 'lastName') {
      // Only allow alphabets and spaces
      const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: alphabetsOnly,
      }));
      // Clear error highlighting when user starts typing in error field
      if (errorField === name) setErrorField(null);
      return;
    }

    if (name === 'pincode') {
      // Only allow digits, max 6
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        pincode: digitsOnly,
      }));
      // Clear error highlighting when user starts typing in error field
      if (errorField === name) setErrorField(null);
      return;
    }

    if (name === 'aadharNumber') {
      // Only allow digits, format as XXXX-XXXX-XXXX, max 12 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 12);
      const formatted = digitsOnly
        .replace(/(\d{4})(?=\d)/g, '$1-')
        .slice(0, 14); // XXXX-XXXX-XXXX = 14 chars max
      setFormData((prev) => ({
        ...prev,
        aadharNumber: formatted,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error highlighting when user starts typing in error field
    if (errorField === name) setErrorField(null);
  };

  // ── Map error message to field name for highlighting ─────────────────────
  const getErrorField = (message: string): string | null => {
    if (message.includes('First name')) return 'firstName';
    if (message.includes('Last name')) return 'lastName';
    if (message.includes('Date of birth')) return 'dateOfBirth';
    if (message.includes('Phone number')) return 'phoneNumber';
    if (message.includes('Email')) return 'email';
    if (message.includes('Aadhar')) return 'aadharNumber';
    if (message.includes('PAN')) return 'panNumber';
    if (message.includes('Address')) return 'address';
    if (message.includes('City')) return 'city';
    if (message.includes('State')) return 'state';
    if (message.includes('Pincode')) return 'pincode';
    if (message.includes('Company name')) return 'companyName';
    if (message.includes('Monthly income')) return 'monthlyIncome';
    if (message.includes('Loan amount')) return 'loanAmount';
    if (message.includes('Tenure')) return 'tenure';
    return null;
  };

  // ── File preview handler ──────────────────────────────────────────────────
  const handlePreviewFile = async (doc: UploadedDoc) => {
    setPreviewDoc(doc);
    setPreviewUrl(null);

    if (doc.status === 'pending') {
      // For pending files: Use FileReader to create data URL from File object
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
      };
      reader.readAsDataURL(doc.file);
    } else if (doc.status === 'uploaded' && doc.s3Key) {
      // For uploaded files: Construct CloudFront URL
      const cloudFrontUrl = `https://d1a4o1u09j3suo.cloudfront.net/${doc.s3Key}`;
      setPreviewUrl(cloudFrontUrl);
    }
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  // ── Per-step validation ────────────────────────────────────────────────────
  const validateStep = (): string | null => {
    if (currentStep === 1) {
      const minAmount = selectedProduct?.minAmount ?? 10000;
      const maxAmount = selectedProduct?.maxAmount ?? 5000000;
      const minTenure = selectedProduct?.minTenure ?? 12;
      const maxTenure = selectedProduct?.maxTenure ?? 84;
      
      if (formData.loanAmount < minAmount || formData.loanAmount > maxAmount)
        return `Loan amount must be between ₹${minAmount.toLocaleString('en-IN')} and ₹${maxAmount.toLocaleString('en-IN')}`;
      if (formData.tenure < minTenure || formData.tenure > maxTenure)
        return `Tenure must be between ${minTenure} and ${maxTenure} months`;
    }
    if (currentStep === 2) {
      if (!formData.firstName.trim())    return 'First name is required';
      if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim()))
        return 'First name can only contain alphabets and spaces';
      
      if (!formData.lastName.trim())     return 'Last name is required';
      if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim()))
        return 'Last name can only contain alphabets and spaces';
      
      if (!formData.dateOfBirth)         return 'Date of birth is required';
      
      // Validate dateOfBirth is not in the future
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob > today) return 'Date of birth cannot be in the future';
      
      // Validate age is at least 18 years
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      // If birthday hasn't occurred yet this year, subtract 1 from age
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) return 'You must be at least 18 years old';
      
      if (!formData.phoneNumber.trim())  return 'Phone number is required';
      if (!formData.email.trim())        return 'Email is required';
      if (!formData.aadharNumber.trim()) return 'Aadhaar number is required';
      
      // Validate aadhar format: must be exactly 14 chars (XXXX-XXXX-XXXX)
      if (formData.aadharNumber.replace(/\D/g, '').length !== 12) 
        return 'Aadhaar number must be 12 digits';
      
      if (!formData.panNumber.trim())    return 'PAN number is required';
      if (!formData.address.trim())      return 'Address is required';
      if (!formData.city.trim())         return 'City is required';
      if (!formData.state.trim())        return 'State is required';
      if (!formData.pincode.trim())      return 'Pincode is required';
      if (!/^\d{6}$/.test(formData.pincode))
        return 'Pincode must be exactly 6 digits';
    }
    if (currentStep === 3 && !formData.loanType.startsWith('education')) {
      if (!formData.companyName.trim())  return 'Company name is required';
      if (!formData.monthlyIncome)       return 'Monthly income is required';
    }
    return null;
  };

  // ── Build payload and POST to backend ─────────────────────────────────────
  const handleSaveApplication = async (isFinalSubmit: boolean = false): Promise<string> => {
    const selectedProduct = loanProducts.find((p) => p.id === formData.loanType);
    const emi = calculateEMI(
      formData.loanAmount,
      selectedProduct?.baseRate ?? 9,
      formData.tenure
    );

    // DEBUG: Log form data for employment fields
    console.log('📋 Form employment data:', {
      yearsOfExperience: formData.yearsOfExperience,
      monthlyIncome: formData.monthlyIncome,
      additionalIncome: formData.additionalIncome,
      companyName: formData.companyName,
      loanType: formData.loanType,
    });

    const payload = {
      loanType:        formData.loanType.replace(/-\d+$/, ''),
      requestedAmount: Number(formData.loanAmount),
      tenure:          Number(formData.tenure),
      personalDetails: {
        firstName:     formData.firstName,
        lastName:      formData.lastName,
        dateOfBirth:   formData.dateOfBirth,
        phoneNumber:   formData.phoneNumber,
        email:         formData.email,
        address:       formData.address,
        city:          formData.city,
        state:         formData.state,
        pincode:       formData.pincode,
        aadharNumber:  formData.aadharNumber,
        panNumber:     formData.panNumber.toUpperCase(),
        maritalStatus: formData.maritalStatus,
        dependents:    Number(formData.dependents),
      },
      employmentDetails: {
        employmentType:    formData.loanType.startsWith('education') ? 'student' : formData.employmentType,
        companyName: formData.companyName || 'N/A',
        jobTitle: formData.jobTitle || 'N/A',
        yearsOfExperience: formData.yearsOfExperience !== '' ? Number(formData.yearsOfExperience) : 0,
        monthlyIncome: formData.monthlyIncome !== '' ? Number(formData.monthlyIncome) : 0,
        additionalIncome:  Math.max(0, Number(formData.additionalIncome) || 0),
        ...(formData.loanType.startsWith('education') && {
          university: formData.university,
          course:     formData.course,
        }),
      },
      repaymentDetails: {
        monthlyEMI:     emi.monthlyEMI,
        totalInterest:  emi.totalInterest,
        totalAmount:    emi.totalAmount,
        rateOfInterest: selectedProduct?.baseRate ?? 9,
      },
      isFinalSubmit,  // TRUE on final submit (triggers Lambda SNS → SES email), FALSE on early create
    };

    console.log('📤 Application payload:', JSON.stringify(payload, null, 2));

    const result = await applicationsApi.create(payload);

    console.log('📥 applicationsApi.create result:', JSON.stringify(result));

    const id = result?.applicationId || result?.id;

    if (!id) {
      throw new Error(
        `Application ID missing. API returned: ${JSON.stringify(result)}`
      );
    }

    return id;
  };

  // ── File picker ────────────────────────────────────────────────────────────
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name} exceeds the 5MB limit.`);
      return;
    }

    setUploadedDocs((prev) => [
      ...prev,
      {
        documentId: '', s3Key: '',
        fileName: file.name, fileType: file.type,
        documentType: selectedDocType,
        status: 'pending', file,
      },
    ]);
    e.target.value = '';
  };

  // ── Upload one doc via presigned URL ───────────────────────────────────────
  const uploadDoc = async (appId: string, doc: UploadedDoc) => {
    if (!appId) throw new Error('applicationId missing before upload');

    setUploadedDocs((prev) =>
      prev.map((d) =>
        d.fileName === doc.fileName && d.documentType === doc.documentType
          ? { ...d, status: 'uploading' } : d
      )
    );

    try {
      const res = await documentsApi.getPresignedUrl(
        doc.fileName, doc.fileType, appId, doc.documentType, doc.file.size
      );

      console.log('📥 Presigned URL response:', res);

      const { uploadUrl, s3Key, documentId } = res;
      if (!uploadUrl) throw new Error('uploadUrl missing from presigned-url response');

      await documentsApi.uploadToS3(uploadUrl, doc.file);
      await documentsApi.confirmUpload(documentId, s3Key, appId, doc.fileName, doc.fileType, doc.documentType);

      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.fileName === doc.fileName && d.documentType === doc.documentType
            ? { ...d, documentId, s3Key, status: 'uploaded' } : d
        )
      );
    } catch (err: any) {
      setUploadedDocs((prev) =>
        prev.map((d) =>
          d.fileName === doc.fileName && d.documentType === doc.documentType
            ? { ...d, status: 'error' } : d
        )
      );
      throw err;
    }
  };

  // ── Trigger email notification ────────────────────────────────────────────
  // Called after all documents are uploaded to send confirmation email
  const triggerEmailNotification = async (appId: string): Promise<void> => {
    try {
      console.log('📧 Email notification already triggered during application creation');
    } catch (err: any) {
      console.warn('⚠️ Email trigger failed (application still saved):', err);
      // Don't block the flow even if email fails
    }
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (isSubmittingRef.current) return; // FIX: hard guard against double-submit

    const validationError = validateStep();
    if (validationError) { setError(validationError); return; }

    if (uploadedDocs.length === 0) {
      setError('Please add at least one document before submitting.');
      return;
    }

    setError('');
    setSubmitting(true);
    isSubmittingRef.current = true;

    try {
      // ✅ ALWAYS create application on final submit with isFinalSubmit=true
      // This ensures: 1 application + email sent immediately
      console.log('📋 Creating application with isFinalSubmit=true (email will be triggered)');
      const appId = await handleSaveApplication(true);
      setApplicationId(appId);

      setUploadingFiles(true);
      // All docs should be pending since we just created the app
      const pending = uploadedDocs.filter((d) => d.status === 'pending' || d.status === 'error');

      for (const doc of pending) {
        await uploadDoc(appId, doc);
      }

      setUploadingFiles(false);

      router.push(`/apply/success?id=${appId}`);
    } catch (err: any) {
      console.error('❌ Submit failed:', err);
      setError(err.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
      isSubmittingRef.current = false;
    }
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      const field = getErrorField(validationError);
      setErrorField(field);
      
      // Scroll to and focus on the error field
      if (field) {
        setTimeout(() => {
          const input = document.querySelector(`input[name="${field}"], select[name="${field}"]`) as HTMLElement;
          if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
          }
        }, 0);
      }
      return;
    }
    setError('');
    setErrorField(null);
    setCurrentStep((s) => s + 1);
  };

  const removeDoc = (index: number) =>
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedProduct = loanProducts.find((p) => p.id === formData.loanType);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Apply for a Loan</h1>
          <p className="text-muted-foreground">Complete this form to apply for your desired loan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <Card className="mb-8 p-6 md:p-8">
          <div className="mb-8">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={(index) => {
                if (index < currentStep) { setError(''); setCurrentStep(index); }
              }}
            />
          </div>

          <div className="min-h-96">

            {/* ── Step 1: Loan Type ──────────────────────────────────────── */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Select Loan Type</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {loanProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setFormData((prev) => ({ ...prev, loanType: product.id }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.loanType === product.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <h3 className="font-bold text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <p className="text-xs text-accent font-semibold">Rate: {product.baseRate}% p.a.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(product.minAmount / 100000).toFixed(0)}L – ₹{(product.maxAmount / 100000).toFixed(0)}L
                        · {product.minTenure}–{product.maxTenure} months
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Amount & Tenure ────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Loan Amount &amp; Tenure</h2>
                
                {/* Loan Amount Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Loan Amount: ₹{Number(formData.loanAmount).toLocaleString('en-IN')}
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input 
                      type="number" 
                      value={formData.loanAmount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || '';
                        setFormData((prev) => ({ ...prev, loanAmount: val === '' ? 0 : val }));
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Enter amount"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">₹</span>
                  </div>
                  <input type="range" name="loanAmount"
                    min={selectedProduct?.minAmount ?? 10000}
                    max={selectedProduct?.maxAmount ?? 5000000}
                    step="10000" value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>₹{((selectedProduct?.minAmount ?? 10000) / 100000).toFixed(1)}L</span>
                    <span>₹{((selectedProduct?.maxAmount ?? 5000000) / 100000).toFixed(0)}L</span>
                  </div>
                </div>
                
                {/* Tenure Section */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Tenure: {formData.tenure} months ({(Number(formData.tenure) / 12).toFixed(1)} years)
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input 
                      type="number" 
                      value={formData.tenure}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || '';
                        setFormData((prev) => ({ ...prev, tenure: val === '' ? 0 : val }));
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Enter months"
                    />
                    <span className="flex items-center text-sm text-muted-foreground">months</span>
                  </div>
                  <input type="range" name="tenure"
                    min={selectedProduct?.minTenure ?? 12}
                    max={selectedProduct?.maxTenure ?? 84}
                    step="1" value={formData.tenure}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{selectedProduct?.minTenure ?? 12} months</span>
                    <span>{selectedProduct?.maxTenure ?? 84} months</span>
                  </div>
                </div>
                {(() => {
                  const emi = calculateEMI(formData.loanAmount, selectedProduct?.baseRate ?? 9, formData.tenure);
                  return (
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Estimated Monthly EMI</p>
                      <p className="text-2xl font-bold text-accent">₹{emi.monthlyEMI.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Interest Rate: <span className="font-semibold">{selectedProduct?.baseRate ?? 9}% p.a.</span> · 
                        Total Interest: ₹{emi.totalInterest.toLocaleString('en-IN')} ·
                        Total Amount: ₹{emi.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Step 3: Personal Info ──────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={errorField === 'firstName' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="First Name"    name="firstName"    value={formData.firstName}    onChange={handleInputChange} placeholder="varun" />
                  </div>
                  <div className={errorField === 'lastName' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Last Name"     name="lastName"     value={formData.lastName}     onChange={handleInputChange} placeholder="goli" />
                  </div>
                  <div className={errorField === 'dateOfBirth' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Date of Birth" name="dateOfBirth"  type="date" value={formData.dateOfBirth} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className={errorField === 'phoneNumber' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Phone Number"  name="phoneNumber"  value={formData.phoneNumber}  onChange={handleInputChange} placeholder="9876543210" />
                  </div>
                  <div className={errorField === 'email' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Email"         name="email"        type="email" value={formData.email} onChange={handleInputChange} placeholder="varun@example.com" />
                  </div>
                  <div className={errorField === 'aadharNumber' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} placeholder="1234-5678-9012" maxLength={14} />
                  </div>
                  <div className={errorField === 'panNumber' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input
                      label="PAN Number" name="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                      placeholder="ABCDE1234F" maxLength={10}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}
                      className="px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  <div className={errorField === 'address' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street" />
                  </div>
                  <div className={errorField === 'city' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="City"    name="city"    value={formData.city}    onChange={handleInputChange} placeholder="Bangalore" />
                  </div>
                  <div className={errorField === 'state' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">State</label>
                      <select name="state" value={formData.state} onChange={handleInputChange}
                        className="px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                        {INDIAN_STATES.map((st) => (
                          <option key={st.value} value={st.value}>{st.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={errorField === 'pincode' ? 'p-1 border-2 border-red-500 rounded-lg' : ''}>
                    <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="560001" maxLength={6} inputMode="numeric" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Employment + Documents ────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Employment Details</h2>
                  {formData.loanType.startsWith('education') ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input label="University / Institution" name="university" value={formData.university} onChange={handleInputChange} placeholder="e.g. IIT Bombay" />
                      <Input label="Course Name"              name="course"     value={formData.course}     onChange={handleInputChange} placeholder="e.g. B.Tech Computer Science" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Employment Type</label>
                        <select name="employmentType" value={formData.employmentType} onChange={handleInputChange}
                          className="px-3 py-2 border border-border rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                          <option value="salaried">Salaried</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="business">Business</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Company Name"        name="companyName"       value={formData.companyName}       onChange={handleInputChange} placeholder="ABC Corporation" />
                        <Input label="Job Title"           name="jobTitle"          value={formData.jobTitle}          onChange={handleInputChange} placeholder="Senior Developer" />
                        <Input label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleInputChange} placeholder="5" />
                        <Input label="Monthly Income (₹)"  name="monthlyIncome"     type="number" value={formData.monthlyIncome}     onChange={handleInputChange} placeholder="75000" />
                      </div>
                      <Input
                        label="Additional Income (₹, optional)"
                        name="additionalIncome" type="number" min="0"
                        value={formData.additionalIncome}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-8 space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Upload Documents</h2>
                  <p className="text-muted-foreground text-sm">
                    Add your documents below, then click <strong>Submit Application</strong>.
                    Supported: PDF, JPG, PNG · max 5MB each.
                  </p>

                  <div className="p-4 border-2 border-dashed border-border rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Document Type</label>
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {getAvailableDocumentTypes(formData.loanType).map((dt) => (
                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="cursor-pointer">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelected} />
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            <Upload className="w-4 h-4" /> Add File
                          </span>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select the document type, then click <strong>Add File</strong>. Repeat for each document.
                    </p>
                  </div>

                  {uploadedDocs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Documents to submit ({uploadedDocs.length}):</p>
                      {uploadedDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handlePreviewFile(doc)}>
                          {doc.status === 'pending'   && <File        className="w-4 h-4 text-muted-foreground shrink-0" />}
                          {doc.status === 'uploading' && <Loader2     className="w-4 h-4 animate-spin text-blue-500 shrink-0" />}
                          {doc.status === 'uploaded'  && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          {doc.status === 'error'     && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {getAvailableDocumentTypes(formData.loanType).find((d) => d.value === doc.documentType)?.label ?? doc.documentType}
                              {' · '}{(doc.file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {doc.status === 'pending'   ? 'Ready'        :
                             doc.status === 'uploading' ? 'Uploading...' :
                             doc.status === 'uploaded'  ? '✓ Done'       : 'Failed'}
                          </span>
                          {(doc.status === 'pending' || doc.status === 'uploaded' || doc.status === 'error') && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeDoc(i); }} 
                              className={`p-1 rounded transition-colors ${
                                doc.status === 'error' 
                                  ? 'hover:bg-red-100' 
                                  : 'hover:bg-red-100'
                              }`}
                              title={doc.status === 'error' ? 'Remove failed file and try again' : 'Remove file'}
                            >
                              <X className={`w-4 h-4 ${
                                doc.status === 'error'
                                  ? 'text-red-500 hover:text-red-700'
                                  : 'text-red-500 hover:text-red-700'
                              }`} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedDocs.length === 0 && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      Add at least one document (Aadhaar or PAN recommended) before submitting.
                    </p>
                  )}

                  {uploadedDocs.some((doc) => doc.status === 'error') && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-medium mb-2">⚠️ Upload failed for {uploadedDocs.filter((doc) => doc.status === 'error').length} file(s):</p>
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {uploadedDocs.filter((doc) => doc.status === 'error').map((doc, i) => (
                          <li key={i} className="text-sm">{doc.fileName} <span className="text-xs text-red-600">({(doc.file.size / 1024).toFixed(0)} KB)</span></li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-600 bg-red-100 p-2 rounded">Possible reasons: File exceeds 5MB or unsupported format (supported: PDF, JPG, PNG). Remove the file(s) using the X button and try again.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <div className="mt-8 flex gap-3 justify-between">
            <Button
              onClick={() => { setError(''); setCurrentStep((s) => s - 1); }}
              variant="outline"
              disabled={currentStep === 0 || submitting}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={submitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting || uploadingFiles || uploadedDocs.length === 0}
                className="gap-2 bg-green-600 text-white hover:bg-green-700 ml-auto"
              >
                {submitting || uploadingFiles ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadingFiles ? 'Uploading documents...' : 'Saving application...'}
                  </>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Application</>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* ── File Preview Modal ────────────────────────────────────────────────── */}
      {previewDoc && previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{previewDoc.fileName}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewDoc.fileType === 'application/pdf' ? 'PDF Document' : 'Image'} · {(previewDoc.file.size / 1024).toFixed(0)} KB · {previewDoc.status === 'uploaded' ? '✓ Uploaded' : 'Pending upload'}
                </p>
              </div>
              <button 
                onClick={closePreview}
                className="p-2 hover:bg-border rounded transition-colors ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 bg-black/5">
              {previewDoc.fileType === 'application/pdf' ? (
                <div className="bg-white border rounded">
                  <iframe
                    src={`${previewUrl}#toolbar=1`}
                    className="w-full"
                    style={{ height: '60vh' }}
                    title={previewDoc.fileName}
                  />
                </div>
              ) : previewDoc.fileType.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt={previewDoc.fileName}
                    className="max-w-full max-h-[60vh] rounded border bg-white"
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded border">
                  <File className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  <p className="text-xs text-muted-foreground mt-2">{previewDoc.fileType}</p>
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <Button
                onClick={closePreview}
                variant="outline"
                className="gap-2"
              >
                Close <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}