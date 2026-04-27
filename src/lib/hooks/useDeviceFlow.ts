'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FlowStatus, DeviceFlowState, AuthTokens } from '@/lib/types/auth';

interface UseDeviceFlowReturn {
  deviceCode: string | null;
  userCode: string | null;
  verificationUri: string | null;
  status: FlowStatus;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  initiateFlow: (deviceType: string, deviceName: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
  isPolling: boolean;
}

export function useDeviceFlow(): UseDeviceFlowReturn {
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);
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
    if (!deviceCode) return;

    try {
      const response = await fetch('/api/device-flow/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_code: deviceCode,
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
            // Increase polling interval
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
      setError('Failed to poll device status');
      stopPolling();
    }
  }, [deviceCode, pollCount, stopPolling]);

  const startPolling = useCallback(() => {
    if (isPolling || !deviceCode) return;

    setIsPolling(true);
    setStatus('pending');

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      poll();
    }, interval * 1000);

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
        stopPolling();
      }
    }, 1000);
  }, [deviceCode, interval, isPolling, poll, stopPolling]);

  const initiateFlow = async (deviceType: string, deviceName: string) => {
    setError(null);
    setStatus('pending');

    try {
      const response = await fetch('/api/device-flow/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceType, deviceName }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate device flow');
      }

      const data = await response.json();
      setDeviceCode(data.device_code);
      setUserCode(data.user_code);
      setVerificationUri(data.verification_uri);
      setInterval(data.interval);

      const expiresAt = new Date(Date.now() + data.expires_in * 1000);
      expiresAtRef.current = expiresAt;
      setTimeRemaining(data.expires_in);

      // Automatically start polling
      setTimeout(() => startPolling(), 100);
    } catch (err) {
      console.error('Initiation error:', err);
      setStatus('error');
      setError('Failed to initiate device authentication');
    }
  };

  const reset = () => {
    stopPolling();
    setDeviceCode(null);
    setUserCode(null);
    setVerificationUri(null);
    setStatus('idle');
    setTimeRemaining(0);
    setPollCount(0);
    setTokens(null);
    setError(null);
    setInterval(5);
    expiresAtRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    deviceCode,
    userCode,
    verificationUri,
    status,
    timeRemaining,
    pollCount,
    tokens,
    error,
    initiateFlow,
    startPolling,
    stopPolling,
    reset,
    isPolling,
  };
}
