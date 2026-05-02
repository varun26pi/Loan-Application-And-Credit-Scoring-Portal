'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { applicationsApi } from '@/lib/api-client';
import { CheckCircle2, Circle, Search, Loader2, AlertCircle } from 'lucide-react';

const TRACKER_STAGES = [
  { status: 'submitted', label: 'Application Submitted' },
  { status: 'verification', label: 'Documents Verification (Textract)' },
  { status: 'credit_check', label: 'Credit Score Calculated' },
  { status: 'approval', label: 'Approval Review' },
  { status: 'processing', label: 'Processing' },
  { status: 'disbursement', label: 'Disbursement' },
];

// FIX 17: Added 'under_review' to match the full status set from DynamoDB
function statusToStageIndex(status: string): number {
  switch (status) {
    case 'pending': return 0;
    case 'under_review': return 1;
    case 'conditional': return 3;
    case 'approved': return 4;
    case 'rejected': return 2;
    default: return 0;
  }
}

function TrackerContent() {
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get('id') ?? '');
  // FIX 15: phoneLast4 field added — Lambda validates this against the stored
  // phone number in finserve-applications for public (no-auth) tracker access.
  const [phoneLast4, setPhoneLast4] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const id = searchId.trim();
    const phone = phoneLast4.trim();

    // FIX: Validate both fields are filled before making API call
    if (!id) {
      setError('Please enter your Application ID.');
      setApplication(null);
      return;
    }

    if (!phone) {
      setError('Please enter the last 4 digits of your mobile number.');
      setApplication(null);
      return;
    }

    setLoading(true);
    setError('');
    setApplication(null);

    try {
      // POST /applications/track — public endpoint (no auth required per guide section 9.3)
      // Lambda queries finserve-applications by id, validates phoneLast4
      const data = await applicationsApi.track(id, phone);
      setApplication(data);
    } catch (err: any) {
      setError(err.message ?? 'Application not found. Please verify your Application ID and mobile number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // FIX: Only auto-search if both ID and phone are present in URL params
    const id = searchParams.get('id');
    if (id) {
      setSearchId(id);
      // Don't auto-call handleSearch - wait for user to provide phone number
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageIndex = application ? statusToStageIndex(application.status) : -1;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Track Your Application</h1>
          <p className="text-muted-foreground text-lg">
            Enter your application ID to check the real-time status
          </p>
        </div>

        <Card className="p-6 md:p-8 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Application ID (e.g. APP-1234567890-ABC123)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              {/* FIX 15: phoneLast4 field — required by the public tracker Lambda */}
              <Input
                placeholder="Last 4 digits of mobile"
                value={phoneLast4}
                onChange={(e) =>
                  setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                maxLength={4}
                className="sm:w-44"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the Application ID from your confirmation email and the last 4 digits of
              your registered mobile number.
            </p>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 self-start"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Track Application
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {application && (
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Application Status</h2>
                  <p className="text-sm text-muted-foreground">
                    ID: {application.id ?? application.applicationId}
                  </p>
                </div>
                <Badge
                  variant={
                    application.status === 'approved'
                      ? 'default'
                      : application.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-sm px-3 py-1 capitalize self-start"
                >
                  {application.status?.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Progress Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {TRACKER_STAGES.map((stage, idx) => {
                    const isCompleted = idx <= stageIndex;
                    const isCurrent = idx === stageIndex;
                    return (
                      <div key={stage.status} className="flex items-center gap-4 relative">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                            isCompleted
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-border text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {stage.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-accent font-medium mt-0.5">
                              Current stage
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Application Details */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Application Details</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Loan Type</p>
                  <p className="font-medium capitalize">{application.loanType} Loan</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requested Amount</p>
                  <p className="font-medium">
                    ₹{Number(application.requestedAmount).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="font-medium">{application.tenure} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Applied On</p>
                  <p className="font-medium">
                    {application.appliedAt
                      ? new Date(application.appliedAt).toLocaleDateString('en-IN')
                      : '—'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
