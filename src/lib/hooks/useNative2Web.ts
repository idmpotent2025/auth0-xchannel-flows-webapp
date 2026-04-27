'use client';

import { useState, useCallback } from 'react';
import { User } from '@/lib/types/auth';

interface UseNative2WebReturn {
  isExchanging: boolean;
  error: string | null;
  success: boolean;
  user: User | null;
  redirectUrl: string | null;
  exchangeToken: (sessionToken: string, deviceInfo?: object) => Promise<void>;
}

export function useNative2Web(): UseNative2WebReturn {
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const exchangeToken = useCallback(async (sessionToken: string, deviceInfo?: object) => {
    setIsExchanging(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/native2web/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          deviceInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Token exchange failed');
      }

      setSuccess(true);
      setUser(data.user);
      setRedirectUrl(data.redirectUrl);
    } catch (err) {
      console.error('Token exchange error:', err);
      setError(err instanceof Error ? err.message : 'Failed to exchange token');
      setSuccess(false);
    } finally {
      setIsExchanging(false);
    }
  }, []);

  return {
    isExchanging,
    error,
    success,
    user,
    redirectUrl,
    exchangeToken,
  };
}
