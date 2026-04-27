export interface User {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  nickname?: string;
  [key: string]: unknown;
}

export interface AuthTokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

export interface CIBAAuthResponse {
  auth_req_id: string;
  expires_in: number;
  interval: number;
}

export type FlowStatus = 'idle' | 'pending' | 'authenticated' | 'expired' | 'denied' | 'error';

export interface DeviceFlowState {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  status: FlowStatus;
  expiresAt: Date;
  interval: number;
  pollCount: number;
}

export interface CIBAFlowState {
  authRequestId: string;
  userIdentifier: string;
  identifierType: 'email' | 'phone';
  status: FlowStatus;
  expiresAt: Date;
  interval: number;
  pollCount: number;
}
