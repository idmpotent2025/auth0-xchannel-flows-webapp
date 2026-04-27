'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCIBAFlow } from '@/lib/hooks/useCIBAFlow';
import { useRouter } from 'next/navigation';

export default function CallCenterPage() {
  const {
    userIdentifier,
    identifierType,
    authRequestId,
    status,
    timeRemaining,
    pollCount,
    error,
    setUserIdentifier,
    setIdentifierType,
    initiateCIBA,
    reset,
  } = useCIBAFlow();

  const router = useRouter();
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      setTimeout(() => {
        router.push('/shop');
      }, 2000);
    }
  }, [status, router]);

  const handleInitiate = () => {
    initiateCIBA('Call Center Agent Terminal', location || 'Call Center');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-teal">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-white hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>

          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📞</div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Call Center CIBA Authentication
              </h1>
              <p className="text-gray-600">
                Client-Initiated Backchannel Authentication
              </p>
            </div>

            {status === 'idle' && (
              <div>
                <p className="text-gray-700 mb-6">
                  This flow demonstrates how call center agents can initiate
                  authentication on behalf of a customer, who then approves
                  the request via push notification on their mobile device.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identifier Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="identifierType"
                          value="email"
                          checked={identifierType === 'email'}
                          onChange={(e) => setIdentifierType(e.target.value as 'email')}
                          className="mr-2"
                        />
                        Email
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="identifierType"
                          value="phone"
                          checked={identifierType === 'phone'}
                          onChange={(e) => setIdentifierType(e.target.value as 'phone')}
                          className="mr-2"
                        />
                        Phone
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {identifierType === 'email' ? 'Customer Email' : 'Customer Phone (E.164 format)'}
                    </label>
                    <input
                      type={identifierType === 'email' ? 'email' : 'tel'}
                      value={userIdentifier}
                      onChange={(e) => setUserIdentifier(e.target.value)}
                      placeholder={identifierType === 'email' ? 'customer@example.com' : '+12345678900'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {identifierType === 'phone' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: +[country code][number] (e.g., +12345678900)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., NYC Office, Floor 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleInitiate}
                  disabled={!userIdentifier}
                  className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Push Notification
                </button>
              </div>
            )}

            {status === 'pending' && authRequestId && (
              <div>
                <div className="bg-accent-50 border-2 border-accent rounded-lg p-6 mb-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Waiting for Customer Approval
                    </h2>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-2">Authentication Request ID:</p>
                      <p className="text-xs font-mono text-gray-800 break-all">{authRequestId}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      User: <span className="font-semibold">{userIdentifier}</span>
                    </p>
                    {location && (
                      <p className="text-sm text-gray-600">
                        Location: <span className="font-semibold">{location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                    <span>Polling for approval (Poll #{pollCount})</span>
                  </div>
                  <div className="font-mono font-semibold">
                    Time remaining: {formatTime(timeRemaining)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-semibold mb-2">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Customer receives push notification on their mobile device</li>
                    <li>Customer reviews authentication request details</li>
                    <li>Customer approves or denies the request</li>
                    <li>This page automatically updates with the result</li>
                  </ol>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="text-blue-800">
                    <strong>Note:</strong> In a production environment, the customer would receive
                    a push notification on their Auth0 Guardian app or integrated mobile application.
                  </p>
                </div>
              </div>
            )}

            {status === 'authenticated' && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  Customer Authenticated Successfully!
                </h2>
                <p className="text-gray-600 mb-4">
                  The customer has approved the authentication request.
                </p>
                <p className="text-gray-600 mb-4">
                  Redirecting to shop...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {status === 'denied' && (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  Authentication Denied
                </h2>
                <p className="text-gray-600 mb-6">
                  The customer denied the authentication request.
                </p>
                <button
                  onClick={reset}
                  className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {(status === 'expired' || status === 'error') && (
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  {status === 'expired' ? 'Request Expired' : 'Error Occurred'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'Please try again'}
                </p>
                <button
                  onClick={reset}
                  className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
            <p className="font-semibold mb-2">About CIBA (Client-Initiated Backchannel Authentication):</p>
            <p>
              CIBA enables authentication flows where a third party (like a call center agent)
              initiates authentication, but the user approves it on their own device. This is
              useful for scenarios where users contact support but authentication needs to remain
              secure and user-controlled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
