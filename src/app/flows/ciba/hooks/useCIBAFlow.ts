'use client';

import { useState, useCallback, useRef } from 'react';
import { usePollingFlow } from '@/lib/shared/auth/polling/usePollingFlow';
import { CIBAFlowData, IdentifierType } from '../types';
import { FlowStatus, AuthTokens } from '@/lib/types/auth';

interface UseCIBAFlowReturn {
  userIdentifier: string;
  identifierType: IdentifierType;
  authRequestId: string | null;
  status: FlowStatus;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  setUserIdentifier: (identifier: string) => void;
  setIdentifierType: (type: IdentifierType) => void;
  initiateCIBA: (deviceName?: string, location?: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
  isPolling: boolean;
}

export function useCIBAFlow(): UseCIBAFlowReturn {
  const [userIdentifier, setUserIdentifier] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  const [authRequestId, setAuthRequestId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number>(5);

  const setExpirationRef = useRef<((expiresIn: number) => void) | null>(null);

  const onPollRequest = useCallback(async (identifier: string, pollCount: number) => {
    return fetch('/flows/ciba/api/poll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authRequestId: identifier,
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
  } = usePollingFlow<CIBAFlowData>({
    identifier: authRequestId,
    pollingEndpoint: '/flows/ciba/api/poll',
    initialInterval: pollingInterval,
    timeout: 600,
    onPollRequest,
  });

  setExpirationRef.current = setExpiration;

  const initiateCIBA = async (deviceName?: string, location?: string) => {
    try {
      const response = await fetch('/flows/ciba/api/initiate', {
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
        if (response.status === 501) {
          throw new Error(data.message || 'CIBA is not enabled on this Auth0 tenant');
        }
        throw new Error(data.error || 'Failed to initiate CIBA flow');
      }

      setAuthRequestId(data.auth_req_id);
      setPollingInterval(data.interval);

      if (setExpirationRef.current) {
        setExpirationRef.current(data.expires_in);
      }

      setTimeout(() => startPolling(), 100);
    } catch (err) {
      console.error('Initiation error:', err);
      throw err;
    }
  };

  const reset = useCallback(() => {
    resetPolling();
    setUserIdentifier('');
    setIdentifierType('email');
    setAuthRequestId(null);
    setPollingInterval(5);
  }, [resetPolling]);

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
