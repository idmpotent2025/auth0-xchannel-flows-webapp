export type IdentifierType = 'email' | 'phone';

export interface CIBAFlowData {
  authRequestId: string;
  userIdentifier: string;
  identifierType: IdentifierType;
}

export interface CIBAInitiateRequest {
  userIdentifier: string;
  identifierType: IdentifierType;
  deviceName?: string;
  location?: string;
}

export interface CIBAInitiateResponse {
  auth_req_id: string;
  expires_in: number;
  interval: number;
}

export interface CIBAPollRequest {
  authRequestId: string;
  pollCount: number;
}
