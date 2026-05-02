'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { applicationsApi } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Plus, Clock, CheckCircle2, AlertCircle, Eye, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  // FIX 6: Lambda returns a plain array — was previously expecting {items:[]}
  const [applications, setApplications] = useState<any[]>([]);
  const [fetchingApps, setFetchingApps] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Role-based redirect — admins and loan-officers use the admin panel
    // This is the post-login landing point; login page always sends here first.
    if (user?.role === 'admin' || user?.role === 'loan-officer') {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        // GET /applications → finserve-applications Lambda
        // Lambda queries finserve-applications using userId-index GSI
        // Returns a plain array (not {items:[]})
        const data = await applicationsApi.list();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setFetchError(err.message ?? 'Failed to load applications');
      } finally {
        setFetchingApps(false);
      }
    })();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'conditional': return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default: return <Eye className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Manage and track your loan applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-2">Total Applications</div>
            <div className="text-3xl font-bold text-blue-900">{applications.length}</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-sm text-green-600 font-medium mb-2">Approved</div>
            <div className="text-3xl font-bold text-green-900">
              {applications.filter((a) => a.status === 'approved').length}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="text-sm text-amber-600 font-medium mb-2">Pending</div>
            <div className="text-3xl font-bold text-amber-900">
              {applications.filter((a) => a.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="text-sm text-red-600 font-medium mb-2">Rejected</div>
            <div className="text-3xl font-bold text-red-900">
              {applications.filter((a) => a.status === 'rejected').length}
            </div>
          </Card>
        </div>

        {/* Applications List */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Your Applications</h2>
          <Link href="/apply">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" /> New Application
            </Button>
          </Link>
        </div>

        {fetchingApps ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading from DynamoDB...</span>
          </div>
        ) : fetchError ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{fetchError}</p>
          </Card>
        ) : applications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You have no loan applications yet.</p>
            <Link href="/apply">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Apply for a Loan
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(app.status)}
                    <div>
                      <h3 className="font-semibold text-foreground capitalize">
                        {app.loanType} Loan — ₹{Number(app.requestedAmount).toLocaleString('en-IN')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {app.id} · Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedId === app.id ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {expandedId === app.id && (
                  <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tenure</span>
                      <p className="font-medium">{app.tenure} months</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Credit Score</span>
                      <p className="font-medium">{app.creditScore ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly EMI</span>
                      <p className="font-medium">
                        {app.repaymentDetails?.monthlyEMI
                          ? `₹${Number(app.repaymentDetails.monthlyEMI).toLocaleString('en-IN')}`
                          : '—'}
                      </p>
                    </div>
                    {app.status === 'approved' && app.approvedAmount ? (
                      <div>
                        <span className="text-muted-foreground">Approved Amount</span>
                        <p className="font-medium text-green-700">
                          ₹{Number(app.approvedAmount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ) : null}
                    {app.decisionReason ? (
                      <div className="md:col-span-3">
                        <span className="text-muted-foreground">Decision Reason</span>
                        <p className="font-medium">{app.decisionReason}</p>
                      </div>
                    ) : null}
                    <div className="md:col-span-3 flex gap-2 mt-2">
                      <Link href={`/tracker?id=${app.id}`}>
                        <Button variant="outline" size="sm">Track Application</Button>
                      </Link>
                    </div>
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
