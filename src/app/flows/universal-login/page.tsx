'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LoginButton } from './components/LoginButton';
import Link from 'next/link';

export default function UniversalLoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/shop');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="text-white hover:text-gray-200 mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Universal Login
            </h1>
            <p className="text-gray-600">
              Standard OAuth 2.0 / OIDC Authentication
            </p>
          </div>

          <div className="space-y-4">
            <LoginButton />

            <div className="text-center text-sm text-gray-500">
              <p>Sign in to access the protected shop</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-primary mb-3">
              About Universal Login:
            </h2>
            <p className="text-sm text-gray-600">
              This is the standard OAuth 2.0 Authorization Code Flow with PKCE.
              You'll be redirected to Auth0's Universal Login page to authenticate,
              then returned to the application with secure tokens.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <p className="font-semibold mb-2">Security Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Hosted authentication page (phishing protection)</li>
            <li>PKCE for secure public clients</li>
            <li>Multi-factor authentication support</li>
            <li>Social login options</li>
            <li>Passwordless authentication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
