'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FlowStatus, AuthTokens } from '@/lib/types/auth';

export interface PollingFlowConfig {
  pollingEndpoint: string;
  maxPolls?: number;
  initialInterval: number;
  timeout: number;
}

export interface PollingFlowState<T> {
  status: FlowStatus;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  isPolling: boolean;
  data: T | null;
}

export interface PollingFlowActions {
  startPolling: () => void;
  stopPolling: () => void;
  resetPolling: () => void;
  setExpiration: (expiresIn: number) => void;
}

export interface UsePollingFlowParams<T> {
  identifier: string | null;
  pollingEndpoint: string;
  initialInterval: number;
  timeout: number;
  onPollRequest: (identifier: string, pollCount: number) => Promise<Response>;
  onSuccess?: (tokens: AuthTokens, data?: T) => void;
}

export function usePollingFlow<T = unknown>({
  identifier,
  pollingEndpoint,
  initialInterval,
  timeout,
  onPollRequest,
  onSuccess,
}: UsePollingFlowParams<T>): PollingFlowState<T> & PollingFlowActions {
  const [status, setStatus] = useState<FlowStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [pollCount, setPollCount] = useState<number>(0);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number>(initialInterval);
  const [data, setData] = useState<T | null>(null);

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
    if (!identifier) return;

    try {
      const response = await onPollRequest(identifier, pollCount);
      const responseData = await response.json();
      setPollCount(prev => prev + 1);

      switch (responseData.status) {
        case 'authenticated':
          setStatus('authenticated');
          setTokens(responseData.tokens);
          if (responseData.data) {
            setData(responseData.data);
          }
          stopPolling();
          if (onSuccess) {
            onSuccess(responseData.tokens, responseData.data);
          }
          break;

        case 'pending':
          setStatus('pending');
          if (responseData.slow_down) {
            setPollingInterval(prev => prev + 5);
          }
          break;

        case 'expired':
          setStatus('expired');
          setError(responseData.message || 'Authentication request expired');
          stopPolling();
          break;

        case 'denied':
          setStatus('denied');
          setError(responseData.message || 'Authentication request denied');
          stopPolling();
          break;

        case 'error':
          setStatus('error');
          setError(responseData.message || 'Authentication error');
          stopPolling();
          break;
      }
    } catch (err) {
      console.error('Polling error:', err);
      setStatus('error');
      setError('Failed to poll authentication status');
      stopPolling();
    }
  }, [identifier, pollCount, stopPolling, onPollRequest, onSuccess]);

  const startPolling = useCallback(() => {
    if (isPolling || !identifier) return;

    setIsPolling(true);
    setStatus('pending');

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      poll();
    }, pollingInterval * 1000);

    // Start countdown timer
    countdownIntervalRef.current = setInterval(() => {
      if (!expiresAtRef.current) return;

      const remaining = Math.max(
        0,
        Math.floor((expiresAtRef.current.getTime() - Date.now()) / 1000)
      );
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setStatus('expired');
        setError('Authentication request expired');
        stopPolling();
      }
    }, 1000);
  }, [identifier, pollingInterval, isPolling, poll, stopPolling]);

  const resetPolling = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setTimeRemaining(0);
    setPollCount(0);
    setTokens(null);
    setError(null);
    setPollingInterval(initialInterval);
    setData(null);
    expiresAtRef.current = null;
  }, [stopPolling, initialInterval]);

  // Public method to set expiration time
  const setExpiration = useCallback((expiresIn: number) => {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    expiresAtRef.current = expiresAt;
    setTimeRemaining(expiresIn);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Update polling interval dynamically
  useEffect(() => {
    if (isPolling && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => {
        poll();
      }, pollingInterval * 1000);
    }
  }, [pollingInterval, isPolling, poll]);

  return {
    status,
    timeRemaining,
    pollCount,
    tokens,
    error,
    isPolling,
    data,
    startPolling,
    stopPolling,
    resetPolling,
    setExpiration,
  };
}
