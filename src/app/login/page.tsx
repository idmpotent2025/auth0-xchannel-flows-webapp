'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
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
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Identity Architect Demo
          </h1>
          <p className="text-gray-600">
            Cross-Channel CIAM Authentication Platform
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Login with Auth0
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Sign in to access all authentication flows</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-primary mb-3">
            Available Flows:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">📺</span>
              <span>Smart TV Device Authorization</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🚗</span>
              <span>Smart Car Device Authorization</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">📞</span>
              <span>Call Center CIBA Push</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🔄</span>
              <span>Native-to-Web SSO</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">🛍️</span>
              <span>Product Catalog</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
