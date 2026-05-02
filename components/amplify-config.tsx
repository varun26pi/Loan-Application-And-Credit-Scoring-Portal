'use client';

/**
 * AmplifyConfig
 * FIX 14: Moved Amplify.configure() from module scope into a useEffect so it
 * only runs on the client side after hydration. Previously it ran at module
 * evaluation time, which caused SSR errors because NEXT_PUBLIC_ env vars may
 * not be available at module scope during server rendering.
 *
 * The `configured` flag prevents re-running on React re-renders.
 *
 * Guide section 4.1: Auth flows USER_PASSWORD_AUTH + ALLOW_REFRESH_TOKEN_AUTH.
 * No Hosted UI — loginWith.email only (phone login is handled via OTP separately).
 */

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

let configured = false;

export function AmplifyConfig() {
  useEffect(() => {
    if (configured) return;
    configured = true;

    Amplify.configure(
      {
        Auth: {
          Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            loginWith: {
              email: true,
              // phone: false — phone number is a required attribute for OTP notifications
              // but sign-in is via email + password (guide section 4.1)
            },
          },
        },
      },
      { ssr: true }
    );
  }, []);

  return null;
}
