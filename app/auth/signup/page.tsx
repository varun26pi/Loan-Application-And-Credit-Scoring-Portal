'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, validatePhone, formatPhone } from '@/lib/auth';

type SignupStep = 'email' | 'password' | 'details' | 'otp' | 'success';

export default function SignupPage() {
  const router = useRouter();
  const { register, confirmRegistration, resendConfirmationCode } = useAuth();
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // phoneNumber is required by guide (section 4.1: required attributes include phone_number)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailNext = () => {
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setStep('password');
  };

  const handlePasswordNext = () => {
    setError('');
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with a number and special character');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep('details');
  };

  const handleDetailsNext = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid Indian mobile number (e.g. 9876543210)');
      return;
    }

    setLoading(true);
    try {
      // Cognito SignUp — sends OTP to email automatically (guide section 4.1)
      const result = await register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: formatPhone(phoneNumber),
      });

      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error ?? 'Registration failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    const result = await resendConfirmationCode(email);
    if (!result.success) setError(result.error ?? 'Failed to resend code');
  };

  const handleOtpVerify = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email');
      return;
    }

    setLoading(true);
    try {
      // Cognito ConfirmSignUp (guide section 4.1 — OTP code from Cognito)
      const result = await confirmRegistration(email, otp);
      if (result.success) {
        setStep('success');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(result.error ?? 'Invalid or expired code. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join FinServe and get instant loan decisions</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8 flex gap-2">
            {(['email', 'password', 'details', 'otp'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  ['email', 'password', 'details', 'otp'].indexOf(step) >= i
                    ? 'bg-accent'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {step === 'email' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEmailNext()}
                  />
                </div>
                <Button onClick={handleEmailNext} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue
                </Button>
              </>
            )}

            {step === 'password' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars, include number & special char"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordNext()}
                  />
                </div>
                <Button onClick={handlePasswordNext} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue
                </Button>
              </>
            )}

            {step === 'details' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <Input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  <Input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                {/* Required by Cognito config in guide section 4.1 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Number <span className="text-muted-foreground text-xs">(for OTP & loan notifications)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDetailsNext()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Indian mobile number, 10 digits</p>
                </div>
                <Button
                  onClick={handleDetailsNext}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Continue'}
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <p className="text-sm text-foreground">
                  We&apos;ve sent a 6-digit verification code to <span className="font-semibold">{email}</span> via Amazon Cognito.
                </p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Verification Code</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    onKeyPress={(e) => e.key === 'Enter' && handleOtpVerify()}
                  />
                </div>
                <Button
                  onClick={handleOtpVerify}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Create Account'}
                </Button>
                <button
                  onClick={handleResendOtp}
                  className="w-full text-sm text-accent hover:underline"
                >
                  Resend code
                </button>
              </>
            )}

            {step === 'success' && (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Account Created!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your Cognito account is verified. Redirecting to login...
                </p>
              </div>
            )}
          </div>

          {step !== 'success' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms and Privacy Policy
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
