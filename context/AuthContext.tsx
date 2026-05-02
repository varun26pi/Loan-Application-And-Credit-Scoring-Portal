'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from '@aws-amplify/auth';

export type UserRole = 'admin' | 'loan-officer' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<{ success: boolean; error?: string }>;
  confirmRegistration: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps Cognito user attributes + group claims to our AuthUser shape.
 * Groups in JWT: cognito:groups claim → ['admins','loan-officers','applicants']
 * Guide section 4.2: group names are admins / loan-officers / applicants
 */
function mapCognitoUser(attributes: Record<string, string>, groups: string[]): AuthUser {
  let role: UserRole = 'user';
  if (groups.includes('admins')) role = 'admin';
  else if (groups.includes('loan-officers')) role = 'loan-officer';

  return {
    id: attributes['sub'] ?? '',
    email: attributes['email'] ?? '',
    firstName: attributes['given_name'] ?? '',
    lastName: attributes['family_name'] ?? '',
    phoneNumber: attributes['phone_number'] ?? '',
    role,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser(); // throws if not signed in
        const { tokens } = await fetchAuthSession();
        const attributes = await fetchUserAttributes();

        // Extract group membership from the ID token payload
        const payload = tokens?.idToken?.payload as Record<string, any> | undefined;
        const groups: string[] = payload?.['cognito:groups'] ?? [];

        setUser(mapCognitoUser(attributes as Record<string, string>, groups));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        return { success: false, error: 'Please verify your email before logging in.' };
      }

      if (!isSignedIn) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      const { tokens } = await fetchAuthSession();
      const attributes = await fetchUserAttributes();
      const payload = tokens?.idToken?.payload as Record<string, any> | undefined;
      const groups: string[] = payload?.['cognito:groups'] ?? [];

      setUser(mapCognitoUser(attributes as Record<string, string>, groups));
      return { success: true };
    } catch (err: any) {
      const msg = err?.message ?? 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await signOut({ global: true }); // invalidates all tokens (GlobalSignOut)
    } catch {
      // always clear local state even if server call fails
    }
    setUser(null);
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => {
    try {
      await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.firstName,
            family_name: data.lastName,
            phone_number: data.phoneNumber, // required by guide: +91XXXXXXXXXX format
          },
        },
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Registration failed' };
    }
  };

  const confirmRegistration = async (email: string, code: string) => {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Confirmation failed' };
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      await resendSignUpCode({ username: email });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to resend code' };
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        register,
        confirmRegistration,
        resendConfirmationCode,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
