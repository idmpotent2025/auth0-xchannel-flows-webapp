import { User } from '@/lib/types/auth';

export interface TokenExchangeRequest {
  sessionToken: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    timestamp?: string;
  };
}

export interface TokenExchangeResponse {
  success: boolean;
  user?: User;
  message?: string;
  redirectUrl?: string;
  error?: string;
}

export interface Native2WebState {
  isExchanging: boolean;
  error: string | null;
  success: boolean;
  user: User | null;
  redirectUrl: string | null;
}
