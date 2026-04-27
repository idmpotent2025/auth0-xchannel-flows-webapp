'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNative2Web } from '../hooks/useNative2Web';
import Link from 'next/link';

function SSOPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isExchanging, error, success, user, redirectUrl, exchangeToken } = useNative2Web();
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const sessionToken = searchParams.get('sessionToken');

    if (sessionToken && !hasAttempted) {
      setHasAttempted(true);
      exchangeToken(sessionToken, {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      });
    }
  }, [searchParams, exchangeToken, hasAttempted]);

  useEffect(() => {
    if (success && redirectUrl) {
      setTimeout(() => {
        router.push(redirectUrl);
      }, 2000);
    }
  }, [success, redirectUrl, router]);

  if (!searchParams.get('sessionToken')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-teal flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔄</div>
            <h1 className="text-3xl font-bold text-primary mb-4">
              Native-to-Web SSO
            </h1>
            <p className="text-gray-600 mb-6">
              This page is used to exchange tokens from the iOS mobile app to the web application.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-left mb-6">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Login to the iOS ShoeStoreApp</li>
                <li>Tap "Continue to Web" button</li>
                <li>iOS app opens this page with a session token</li>
                <li>Token is validated and exchanged</li>
                <li>You're automatically logged into the web app</li>
              </ol>
            </div>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center">
          {isExchanging && (
            <>
              <div className="text-6xl mb-4">🔄</div>
              <h1 className="text-2xl font-bold text-primary mb-4">
                Exchanging Token...
              </h1>
              <p className="text-gray-600 mb-6">
                Validating your session from the mobile app
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </>
          )}

          {success && user && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                Successfully Signed In!
              </h1>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Welcome back,</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.name || user.email}
                </p>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full mx-auto mt-3"
                  />
                )}
              </div>
              <p className="text-gray-600 mb-4">
                Redirecting to shop...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </>
          )}

          {error && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Sign-In Failed
              </h1>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Possible reasons:
                </p>
                <ul className="text-xs text-gray-600 text-left list-disc list-inside space-y-1">
                  <li>Session token has expired</li>
                  <li>Token was used from a different iOS app</li>
                  <li>Invalid token signature</li>
                  <li>Network connectivity issue</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/flows/universal-login"
                  className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>
            This is a secure token exchange flow. Your session from the iOS app
            is validated using JWT verification with Auth0's public keys.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SSOPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary to-teal flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SSOPageContent />
    </Suspense>
  );
}
