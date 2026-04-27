'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Go Home
            </Link>
          </div>

          {error.digest && (
            <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-500">
              <p>Error ID: {error.digest}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
