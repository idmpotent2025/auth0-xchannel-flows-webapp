export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export function parseAuth0Error(error: unknown): AppError {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Auth0 API error format
    if (err.error && typeof err.error === 'string') {
      const errorCode = err.error as string;
      const errorDescription = err.error_description as string | undefined;

      switch (errorCode) {
        case 'authorization_pending':
          return {
            message: 'Waiting for user authorization',
            code: errorCode,
          };
        case 'slow_down':
          return {
            message: 'Too many requests. Please slow down.',
            code: errorCode,
          };
        case 'expired_token':
          return {
            message: 'The authorization code has expired. Please try again.',
            code: errorCode,
          };
        case 'access_denied':
          return {
            message: 'Access was denied by the user.',
            code: errorCode,
          };
        case 'invalid_grant':
          return {
            message: 'Invalid authorization grant.',
            code: errorCode,
          };
        case 'unauthorized_client':
          return {
            message: 'Client is not authorized for this grant type.',
            code: errorCode,
          };
        default:
          return {
            message: errorDescription || `Authentication error: ${errorCode}`,
            code: errorCode,
          };
      }
    }

    // HTTP error format
    if (err.status && typeof err.status === 'number') {
      const status = err.status as number;
      const message = err.message as string | undefined;

      switch (status) {
        case 400:
          return {
            message: message || 'Bad request. Please check your input.',
            status,
          };
        case 401:
          return {
            message: message || 'Authentication required.',
            status,
          };
        case 403:
          return {
            message: message || 'Access forbidden.',
            status,
          };
        case 404:
          return {
            message: message || 'Resource not found.',
            status,
          };
        case 429:
          return {
            message: message || 'Too many requests. Please try again later.',
            status,
          };
        case 500:
          return {
            message: message || 'Internal server error.',
            status,
          };
        case 503:
          return {
            message: message || 'Service temporarily unavailable.',
            status,
          };
        default:
          return {
            message: message || `Error: ${status}`,
            status,
          };
      }
    }

    // Generic error object
    if (err.message && typeof err.message === 'string') {
      return {
        message: err.message,
        details: err,
      };
    }
  }

  // Error instance
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    };
  }

  // Unknown error
  return {
    message: 'An unknown error occurred',
    details: error,
  };
}

export function logError(
  error: AppError,
  context?: {
    user?: string;
    flow?: string;
    action?: string;
  }
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error,
    context,
  };

  // In production, send to logging service (e.g., Sentry, LogRocket)
  console.error('[Error]', logEntry);
}

export function getUserFriendlyMessage(error: AppError): string {
  // Map technical errors to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    authorization_pending: 'Please complete authentication on your other device.',
    slow_down: 'Please wait a moment before trying again.',
    expired_token: 'This code has expired. Please start over.',
    access_denied: 'You denied the authentication request.',
    invalid_grant: 'Authentication failed. Please try again.',
    unauthorized_client: 'This application is not authorized. Please contact support.',
  };

  if (error.code && friendlyMessages[error.code]) {
    return friendlyMessages[error.code];
  }

  return error.message;
}
