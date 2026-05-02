/**
 * POST /api/auth/logout
 * ============================================================
 * FIX: This route stub was missing — authApi.logout() in api-client.ts
 * was calling '/auth/logout' which had no corresponding route file.
 *
 * AWS_COGNITO_AUTH_INTEGRATION_POINT
 *
 * PRODUCTION INTEGRATION — Lambda will:
 *   Call Cognito GlobalSignOut to invalidate ALL refresh tokens for the user.
 *   This ensures the user is logged out on all devices.
 *
 *   Lambda code:
 *     const cognitoClient = new CognitoIdentityProviderClient({ region });
 *     await cognitoClient.send(new GlobalSignOutCommand({
 *       AccessToken: req.headers.get('Authorization')?.replace('Bearer ', ''),
 *     }));
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  try {
    // AWS_COGNITO_AUTH_INTEGRATION_POINT — replace with GlobalSignOut:
    // TODO: In production, use Cognito GlobalSignOut (SSR: AWS SDK, Lambda; client: context/AuthContext)
    // const accessToken = _req.headers.get('Authorization')?.replace('Bearer ', '');
    // if (accessToken) {
    //   await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    // }

    // AWS_CLOUDTRAIL_AUDIT_LOG_INTEGRATION_POINT
    console.log(`[AUDIT] LOGOUT ts=${new Date().toISOString()}`);

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[POST /api/auth/logout]', err);
    // Always return 200 on logout — don't block client-side cleanup on server errors
    return NextResponse.json({ message: 'Logged out' });
  }
}
