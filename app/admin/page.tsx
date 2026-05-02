'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreditScoreRing } from '@/components/ui/credit-score-ring';
import { adminApi } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Filter,
  BarChart3,
  Loader2,
} from 'lucide-react';

type DecisionType = 'approved' | 'rejected' | 'conditional' | null;

export default function AdminPanel() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  // FIX 7: Lambda returns a plain array — was previously expecting {items:[]}
  const [applications, setApplications] = useState<any[]>([]);
  const [fetchingApps, setFetchingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [decision, setDecision] = useState<DecisionType>(null);
  const [reason, setReason] = useState('');
  const [conditions, setConditions] = useState('');
  // FIX 18: approval-specific fields required by SES LOAN_APPROVED template
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [approvalTenure, setApprovalTenure] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'conditional'
  >('all');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user && user.role !== 'admin' && user.role !== 'loan-officer') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setFetchingApps(true);
    (async () => {
      try {
        // GET /admin/applications → finserve-admin Lambda → DynamoDB status-createdAt-index GSI
        // Returns a plain array (not {items:[]})
        const data = await adminApi.listApplications(
          statusFilter === 'all' ? undefined : statusFilter
        );
        setApplications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load applications:', err);
      } finally {
        setFetchingApps(false);
      }
    })();
  }, [isAuthenticated, statusFilter]);

  const filteredApplications =
    statusFilter === 'all'
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  /**
   * FIX 18: Decision submission now passes approvedAmount, interestRate, tenure
   * for approved decisions — required by the LOAN_APPROVED SES email template
   * (guide section 11.2: {{approvedAmount}}, {{interestRate}}, {{emi}}).
   * Lambda computes EMI = approvedAmount × rate / (1 - (1+rate)^-tenure).
   *
   * POST /admin/applications/{id}/decision → finserve-admin Lambda
   * Lambda writes to DynamoDB, publishes to SNS finserve-app-updates topic →
   * finserve-notifications Lambda → SES email + SNS SMS.
   * CloudTrail + DynamoDB audit-logs record the decision for regulatory compliance.
   */
  const handleDecision = async (appId: string, appDecision: DecisionType) => {
    if (!appDecision) return;

    if (appDecision === 'approved') {
      if (!approvedAmount || !interestRate || !approvalTenure) {
        setDecisionError(
          'Approved amount, interest rate, and tenure are required for approvals.'
        );
        return;
      }
    }

    setSubmittingDecision(true);
    setDecisionError('');

    try {
      await adminApi.submitDecision(
        appId,
        appDecision,
        reason || undefined,
        conditions || undefined,
        appDecision === 'approved' ? Number(approvedAmount) : undefined,
        appDecision === 'approved' ? Number(interestRate) : undefined,
        appDecision === 'approved' ? Number(approvalTenure) : undefined
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: appDecision, updatedAt: new Date().toISOString() }
            : app
        )
      );

      setSelectedApp(null);
      setDecision(null);
      setReason('');
      setConditions('');
      setApprovedAmount('');
      setInterestRate('');
      setApprovalTenure('');
    } catch (err: any) {
      setDecisionError(err.message ?? 'Failed to submit decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    conditional: applications.filter((a) => a.status === 'conditional').length,
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Review and decide on loan applications · Powered by DynamoDB + SNS + SES
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, cls: 'bg-blue-50 border-blue-200 text-blue-900' },
            { label: 'Pending', value: stats.pending, cls: 'bg-amber-50 border-amber-200 text-amber-900' },
            { label: 'Approved', value: stats.approved, cls: 'bg-green-50 border-green-200 text-green-900' },
            { label: 'Rejected', value: stats.rejected, cls: 'bg-red-50 border-red-200 text-red-900' },
            { label: 'Conditional', value: stats.conditional, cls: 'bg-purple-50 border-purple-200 text-purple-900' },
          ].map(({ label, value, cls }) => (
            <Card key={label} className={`p-4 border ${cls}`}>
              <div className="text-xs font-medium mb-1 opacity-75">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['all', 'pending', 'approved', 'rejected', 'conditional'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {fetchingApps ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading from DynamoDB...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No applications found for this filter.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge variant={app.status as any}>
                        {app.status?.replace(/_/g, ' ').charAt(0).toUpperCase() + app.status?.replace(/_/g, ' ').slice(1)}
                      </StatusBadge>
                      <span className="text-sm text-muted-foreground">{app.id}</span>
                    </div>
                    <h3 className="font-semibold text-foreground capitalize">
                      {app.loanType} Loan — ₹
                      {Number(app.requestedAmount).toLocaleString('en-IN')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {app.personalDetails?.firstName} {app.personalDetails?.lastName} ·{' '}
                      {app.employmentDetails?.employmentType?.replace(/_/g, ' ')} ·{' '}
                      Income: ₹
                      {Number(app.employmentDetails?.monthlyIncome ?? 0).toLocaleString('en-IN')}
                      /mo
                    </p>
                    {app.creditScore && (
                      <p className="text-sm font-medium text-accent mt-1">
                        Credit Score: {app.creditScore}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedApp(selectedApp?.id === app.id ? null : app)
                      }
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {selectedApp?.id === app.id ? 'Close' : 'Review'}
                    </Button>
                  </div>
                </div>

                {/* Decision Panel */}
                {selectedApp?.id === app.id && app.status === 'pending' && (
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <h4 className="font-semibold text-foreground">Submit Decision</h4>

                    {/* Decision buttons */}
                    <div className="flex gap-3 flex-wrap">
                      {(['approved', 'rejected', 'conditional'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDecision(decision === d ? null : d)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                            decision === d
                              ? d === 'approved'
                                ? 'border-green-500 bg-green-50 text-green-800'
                                : d === 'rejected'
                                ? 'border-red-500 bg-red-50 text-red-800'
                                : 'border-purple-500 bg-purple-50 text-purple-800'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    {/* FIX 18: Approval-specific fields — required for SES LOAN_APPROVED template */}
                    {decision === 'approved' && (
                      <div className="grid md:grid-cols-3 gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-green-800 mb-1">
                            Approved Amount (₹) *
                          </label>
                          <Input
                            type="number"
                            placeholder={String(app.requestedAmount)}
                            value={approvedAmount}
                            onChange={(e) => setApprovedAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-green-800 mb-1">
                            Interest Rate (% p.a.) *
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="8.5"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-green-800 mb-1">
                            Tenure (months) *
                          </label>
                          <Input
                            type="number"
                            placeholder={String(app.tenure)}
                            value={approvalTenure}
                            onChange={(e) => setApprovalTenure(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {decision === 'conditional' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Conditions Required *
                        </label>
                        <Input
                          placeholder="e.g. Upload last 3 months salary slips"
                          value={conditions}
                          onChange={(e) => setConditions(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Reason / Notes
                        {decision === 'rejected' ? ' *' : ' (optional)'}
                      </label>
                      <Input
                        placeholder={
                          decision === 'rejected'
                            ? 'Reason for rejection (sent in SES email to applicant)'
                            : 'Internal notes for audit log'
                        }
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>

                    {decisionError && (
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {decisionError}
                      </p>
                    )}

                    <Button
                      onClick={() => handleDecision(app.id, decision)}
                      disabled={!decision || submittingDecision}
                      className={`gap-2 ${
                        decision === 'approved'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : decision === 'rejected'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {submittingDecision ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          {decision === 'approved' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : decision === 'rejected' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          Confirm{' '}
                          {decision
                            ? decision.charAt(0).toUpperCase() + decision.slice(1)
                            : ''}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Already decided — show outcome */}
                {selectedApp?.id === app.id && app.status !== 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Decision already recorded: <strong className="capitalize">{app.status}</strong>
                      {app.decisionReason ? ` — ${app.decisionReason}` : ''}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
