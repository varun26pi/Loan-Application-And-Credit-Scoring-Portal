'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Eye, LayoutDashboard, Loader2 } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Application ID is passed as a URL param from apply/page.tsx: /apply/success?id=xxx
  const [applicationId, setApplicationId] = useState('');

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setApplicationId(idFromUrl);
    } else {
      // No application ID — redirect home
      router.push('/');
    }
  }, [router, searchParams]);

  if (!applicationId) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="p-8 md:p-12 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Application Submitted!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Your loan application has been saved to DynamoDB and documents are being processed by Amazon Textract.
            Decisions on straightforward cases arrive within 15 minutes.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 text-left">
            <p className="text-sm text-muted-foreground mb-2">Your Application ID</p>
            <p className="text-2xl font-mono font-bold text-primary break-all">{applicationId}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Save this ID to track your application status. You&apos;ll also receive email and SMS updates.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-sm text-green-900">
                ✓ Application saved to DynamoDB (finserve-applications table)
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              <span className="text-sm text-blue-900">
                ✓ Documents queued for Amazon Textract AI extraction
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
              <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
              <span className="text-sm text-amber-900">
                ✓ You&apos;ll receive updates via SES email and SNS SMS at your registered number
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Auto-Approve Target</p>
              <p className="text-lg font-bold text-foreground">&lt; 15 min</p>
            </Card>
            <Card className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Status</p>
              <p className="text-lg font-bold text-foreground">Submitted</p>
            </Card>
            <Card className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Audit Trail</p>
              <p className="text-lg font-bold text-foreground">CloudTrail ✓</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="gap-2 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href={`/tracker?id=${applicationId}`}>
                <Eye className="w-4 h-4" />
                Track Application
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 flex-1">
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Questions? Contact our support team</p>
            <Link href="mailto:support@finserve.in" className="text-accent hover:underline font-medium text-sm">
              support@finserve.in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
