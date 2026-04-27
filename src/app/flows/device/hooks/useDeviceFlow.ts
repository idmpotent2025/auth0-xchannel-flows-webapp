'use client';

import { useState, useCallback, useRef } from 'react';
import { usePollingFlow } from '@/lib/shared/auth/polling/usePollingFlow';
import { DeviceFlowData } from '../types';
import { FlowStatus, AuthTokens } from '@/lib/types/auth';

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
  const [pollingInterval, setPollingInterval] = useState<number>(5);

  const setExpirationRef = useRef<((expiresIn: number) => void) | null>(null);

  const onPollRequest = useCallback(async (identifier: string, pollCount: number) => {
    return fetch('/flows/device/api/poll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_code: identifier,
        pollCount,
      }),
    });
  }, []);

  const {
    status,
    timeRemaining,
    pollCount,
    tokens,
    error,
    isPolling,
    startPolling,
    stopPolling,
    resetPolling,
    setExpiration,
  } = usePollingFlow<DeviceFlowData>({
    identifier: deviceCode,
    pollingEndpoint: '/flows/device/api/poll',
    initialInterval: pollingInterval,
    timeout: 900,
    onPollRequest,
  });

  // Store setExpiration in ref for use in initiateFlow
  setExpirationRef.current = setExpiration as unknown as (expiresIn: number) => void;

  const initiateFlow = async (deviceType: string, deviceName: string) => {
    try {
      const response = await fetch('/flows/device/api/initiate', {
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
      setPollingInterval(data.interval);

      if (setExpirationRef.current) {
        setExpirationRef.current(data.expires_in);
      }

      // Automatically start polling after a short delay
      setTimeout(() => startPolling(), 100);
    } catch (err) {
      console.error('Initiation error:', err);
    }
  };

  const reset = useCallback(() => {
    resetPolling();
    setDeviceCode(null);
    setUserCode(null);
    setVerificationUri(null);
    setPollingInterval(5);
  }, [resetPolling]);

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
