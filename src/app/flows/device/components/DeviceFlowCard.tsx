'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlowStatus, AuthTokens } from '@/lib/types/auth';

interface DeviceFlowCardProps {
  deviceIcon: string;
  deviceName: string;
  deviceDescription: string;
  primaryColor?: string;
  status: FlowStatus;
  userCode: string | null;
  verificationUri: string | null;
  timeRemaining: number;
  pollCount: number;
  error: string | null;
  onStart: () => void;
  onReset: () => void;
  onCopyCode?: () => void;
  onCopyUri?: () => void;
  tokens?: AuthTokens | null;
}

export function DeviceFlowCard({
  deviceIcon,
  deviceName,
  deviceDescription,
  primaryColor = 'primary',
  status,
  userCode,
  verificationUri,
  timeRemaining,
  pollCount,
  error,
  onStart,
  onReset,
  onCopyCode,
  onCopyUri,
  tokens,
}: DeviceFlowCardProps) {
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && tokens) {
      setTimeout(() => {
        router.push('/shop');
      }, 2000);
    }
  }, [status, tokens, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, callback?: () => void) => {
    navigator.clipboard.writeText(text);
    if (callback) callback();
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
              <div className="text-6xl mb-4">{deviceIcon}</div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {deviceName} Authentication
              </h1>
              <p className="text-gray-600">
                Device Authorization Code Flow
              </p>
            </div>

            {status === 'idle' && (
              <div className="text-center">
                <p className="text-gray-700 mb-6">
                  {deviceDescription}
                </p>
                <button
                  onClick={onStart}
                  className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Start {deviceName} Authentication
                </button>
              </div>
            )}

            {status === 'pending' && userCode && verificationUri && (
              <div>
                <div className={`bg-${primaryColor}-50 border-2 border-${primaryColor} rounded-lg p-6 mb-6`}>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Enter this code on your device:
                    </h2>
                    <div className="bg-white rounded-lg p-6 mb-4">
                      <div className="text-5xl font-mono font-bold text-primary tracking-wider">
                        {userCode.match(/.{1,4}/g)?.join('-')}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(userCode, onCopyCode)}
                      className={`text-${primaryColor} hover:text-${primaryColor}-600 text-sm font-medium`}
                    >
                      Copy Code
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Visit this URL:
                    </h3>
                    <div className="bg-white rounded px-4 py-2 mb-2">
                      <a
                        href={verificationUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-${primaryColor} hover:text-${primaryColor}-600 break-all`}
                      >
                        {verificationUri}
                      </a>
                    </div>
                    <button
                      onClick={() => copyToClipboard(verificationUri, onCopyUri)}
                      className={`text-${primaryColor} hover:text-${primaryColor}-600 text-sm font-medium`}
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-${primaryColor} mr-2`}></div>
                    <span>Waiting for authentication (Poll #{pollCount})</span>
                  </div>
                  <div className="font-mono font-semibold">
                    Time remaining: {formatTime(timeRemaining)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-semibold mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the verification URL on your phone or computer</li>
                    <li>Enter the user code displayed above</li>
                    <li>Sign in with your Auth0 credentials</li>
                    <li>This page will automatically detect your authentication</li>
                  </ol>
                </div>
              </div>
            )}

            {status === 'authenticated' && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  {deviceName} Authenticated Successfully!
                </h2>
                <p className="text-gray-600 mb-4">
                  Redirecting to shop...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {(status === 'expired' || status === 'denied' || status === 'error') && (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  {status === 'expired' && 'Code Expired'}
                  {status === 'denied' && 'Authentication Denied'}
                  {status === 'error' && 'Error Occurred'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'Please try again'}
                </p>
                <button
                  onClick={onReset}
                  className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
            <p className="font-semibold mb-2">About Device Authorization Flow:</p>
            <p>
              This OAuth 2.0 extension (RFC 8628) enables devices with limited input
              capabilities to obtain user authorization. The device displays a code
              that the user enters on a secondary device, allowing secure authentication
              without typing credentials on the primary device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
