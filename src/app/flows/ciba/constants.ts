export const CIBA_CONFIG = {
  maxPollCount: 60,
  initialInterval: 5,
  timeout: 300,
  defaultDeviceName: 'Call Center Agent Terminal',
  defaultLocation: 'Call Center',
};

export const CIBA_ERROR_MESSAGES = {
  NOT_ENABLED: 'CIBA (Client-Initiated Backchannel Authentication) is not enabled on this Auth0 tenant. Please contact Auth0 support to enable this feature.',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone format (use E.164: +1234567890)',
  MISSING_IDENTIFIER: 'User identifier and type are required',
  AUTH_FAILED: 'Failed to authenticate with Auth0',
  INITIATE_FAILED: 'Failed to initiate CIBA flow',
};

export const IDENTIFIER_HINTS = {
  email: 'customer@example.com',
  phone: '+12345678900',
};

export const IDENTIFIER_LABELS = {
  email: 'Customer Email',
  phone: 'Customer Phone (E.164 format)',
};
