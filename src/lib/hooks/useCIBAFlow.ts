'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FlowStatus, AuthTokens } from '@/lib/types/auth';

interface UseCIBAFlowReturn {
  userIdentifier: string;
  identifierType: 'email' | 'phone';
  authRequestId: string | null;
  status: FlowStatus;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  setUserIdentifier: (identifier: string) => void;
  setIdentifierType: (type: 'email' | 'phone') => void;
  initiateCIBA: (deviceName?: string, location?: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
  isPolling: boolean;
}

export function useCIBAFlow(): UseCIBAFlowReturn {
  const [userIdentifier, setUserIdentifier] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [authRequestId, setAuthRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<FlowStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [pollCount, setPollCount] = useState<number>(0);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [interval, setInterval] = useState<number>(5);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiresAtRef = useRef<Date | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    if (!authRequestId) return;

    try {
      const response = await fetch('/api/ciba/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authRequestId,
          pollCount,
        }),
      });

      const data = await response.json();
      setPollCount(prev => prev + 1);

      switch (data.status) {
        case 'authenticated':
          setStatus('authenticated');
          setTokens(data.tokens);
          stopPolling();
          break;

        case 'pending':
          setStatus('pending');
          if (data.slow_down) {
            setInterval(prev => prev + 5);
          }
          break;

        case 'expired':
          setStatus('expired');
          setError(data.message);
          stopPolling();
          break;

        case 'denied':
          setStatus('denied');
          setError(data.message);
          stopPolling();
          break;

        case 'error':
          setStatus('error');
          setError(data.message);
          stopPolling();
          break;
      }
    } catch (err) {
      console.error('Polling error:', err);
      setStatus('error');
      setError('Failed to poll authentication status');
      stopPolling();
    }
  }, [authRequestId, pollCount, stopPolling]);

  const startPolling = useCallback(() => {
    if (isPolling || !authRequestId) return;

    setIsPolling(true);
    setStatus('pending');

    pollingIntervalRef.current = setInterval(() => {
      poll();
    }, interval * 1000);

    countdownIntervalRef.current = setInterval(() => {
      if (!expiresAtRef.current) return;

      const remaining = Math.max(
        0,
        Math.floor((expiresAtRef.current.getTime() - Date.now()) / 1000)
      );
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setStatus('expired');
        stopPolling();
      }
    }, 1000);
  }, [authRequestId, interval, isPolling, poll, stopPolling]);

  const initiateCIBA = async (deviceName?: string, location?: string) => {
    setError(null);
    setStatus('pending');

    try {
      const response = await fetch('/api/ciba/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIdentifier,
          identifierType,
          deviceName: deviceName || 'Web Browser',
          location: location || 'Unknown',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific CIBA not enabled error
        if (response.status === 501) {
          setStatus('error');
          setError(data.message || 'CIBA is not enabled on this Auth0 tenant');
          return;
        }

        throw new Error(data.error || 'Failed to initiate CIBA flow');
      }

      setAuthRequestId(data.auth_req_id);
      setInterval(data.interval);

      const expiresAt = new Date(Date.now() + data.expires_in * 1000);
      expiresAtRef.current = expiresAt;
      setTimeRemaining(data.expires_in);

      setTimeout(() => startPolling(), 100);
    } catch (err) {
      console.error('Initiation error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to initiate CIBA authentication');
    }
  };

  const reset = () => {
    stopPolling();
    setUserIdentifier('');
    setIdentifierType('email');
    setAuthRequestId(null);
    setStatus('idle');
    setTimeRemaining(0);
    setPollCount(0);
    setTokens(null);
    setError(null);
    setInterval(5);
    expiresAtRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    userIdentifier,
    identifierType,
    authRequestId,
    status,
    timeRemaining,
    pollCount,
    tokens,
    error,
    setUserIdentifier,
    setIdentifierType,
    initiateCIBA,
    startPolling,
    stopPolling,
    reset,
    isPolling,
  };
}
