'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-teal">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Identity Architect Demo</h1>
          <p className="text-xl text-gray-100">
            Auth0 Cross-Channel CIAM Authentication Platform
          </p>
          {isAuthenticated && user && (
            <div className="mt-4 text-sm bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
              Welcome, {user.name || user.email}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Universal Login */}
          <Link href="/login">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Universal Login
              </h2>
              <p className="text-gray-600">
                Standard Auth0 hosted login page with username and password authentication.
              </p>
            </div>
          </Link>

          {/* Smart TV Device Flow */}
          <Link href="/tv-device">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">📺</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Smart TV Auth
              </h2>
              <p className="text-gray-600">
                Device Authorization Code Flow for Smart TV. Enter code on another device to authenticate.
              </p>
            </div>
          </Link>

          {/* Smart Car Device Flow */}
          <Link href="/car-device">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🚗</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Smart Car Auth
              </h2>
              <p className="text-gray-600">
                Device Authorization Code Flow for Smart Car. Authenticate your vehicle with a user code.
              </p>
            </div>
          </Link>

          {/* CIBA Push Flow */}
          <Link href="/call-center">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">📞</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Call Center CIBA
              </h2>
              <p className="text-gray-600">
                Client-Initiated Backchannel Authentication. Push notification approval from mobile device.
              </p>
            </div>
          </Link>

          {/* Native2Web SSO */}
          <Link href="/sso">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Native-to-Web SSO
              </h2>
              <p className="text-gray-600">
                Seamless token exchange from iOS mobile app to web application.
              </p>
            </div>
          </Link>

          {/* Product Catalog */}
          <Link href="/shop">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Product Catalog
              </h2>
              <p className="text-gray-600">
                Browse our catalog of dresses, pet food, burritos, and CPG goods.
              </p>
            </div>
          </Link>
        </div>

        <footer className="text-center text-white mt-12 text-sm">
          <p>
            Powered by Auth0 | Built with Next.js | {' '}
            {isAuthenticated ? (
              <button
                onClick={() => window.location.href = '/api/auth/logout'}
                className="underline hover:text-gray-200"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="underline hover:text-gray-200">
                Login
              </Link>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
