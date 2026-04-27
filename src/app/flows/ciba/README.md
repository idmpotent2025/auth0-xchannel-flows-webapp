# CIBA (Client-Initiated Backchannel Authentication) Flow

## Overview

CIBA enables authentication where the user is contacted on a separate device through a backchannel (push notification, SMS, email) to approve an authentication request. Unlike Device Flow where users manually enter codes, CIBA sends authentication requests directly to the user's device.

## Use Cases

- **Call Center Authentication**: Agent initiates login, customer approves on mobile
- **Banking Authentication**: High-security transactions requiring push approval
- **Enterprise SSO**: Passwordless authentication via mobile app
- **Customer Service**: Verify identity without sharing passwords
- **Remote Desktop**: Authenticate PC login via mobile device

## OAuth/OIDC Specification

This flow implements:
- **OpenID Connect CIBA** ([OIDC CIBA Core](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html))
- Grant Type: `urn:openid:params:grant-type:ciba`
- Mode: Poll (checking authorization status at intervals)

## Auth0 Configuration

### Application Settings

1. Create a Machine-to-Machine (M2M) Application for CIBA
2. Enable CIBA grant type
3. Configure settings:

```
Application Type: Machine to Machine
Grant Types: Client Credentials ✓, CIBA ✓
Token Endpoint Authentication Method: Client Secret Post
```

4. Authorize M2M app to call Auth0 Management API with scopes:
   - `read:users`
   - `update:users`

### Guardian Configuration

1. Enable Auth0 Guardian for push notifications:
   - Dashboard → Security → Multi-factor Auth
   - Enable Guardian push notifications
   - Users must enroll mobile device

### Environment Variables

Required in `.env.local`:

```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CIBA_CLIENT_ID=your_ciba_client_id
AUTH0_CIBA_CLIENT_SECRET=your_ciba_client_secret
AUTH0_M2M_CLIENT_ID=your_m2m_client_id
AUTH0_M2M_CLIENT_SECRET=your_m2m_client_secret
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/
```

## API Endpoints

### Initiate CIBA Flow

```http
POST /flows/ciba/api/initiate
Content-Type: application/json

{
  "userIdentifier": "user@example.com" | "+15551234567",
  "identifierType": "email" | "phone"
}

Response:
{
  "auth_req_id": "eyJhbG...xyz",
  "expires_in": 600,
  "interval": 5
}
```

### Poll for Token

```http
POST /flows/ciba/api/poll
Content-Type: application/json

{
  "authReqId": "eyJhbG...xyz"
}

Response (Pending):
{
  "error": "authorization_pending"
}

Response (Success):
{
  "access_token": "eyJhbG...",
  "id_token": "eyJhbG...",
  "refresh_token": "v1.M...",
  "expires_in": 86400,
  "token_type": "Bearer"
}

Response (Slow Down):
{
  "error": "slow_down"
}

Response (Expired):
{
  "error": "expired_token"
}

Response (Denied):
{
  "error": "access_denied"
}
```

## Authentication Flow

```
1. Agent/System identifies user
   (email or phone number)
   ↓
2. Initiate CIBA request
   POST /flows/ciba/api/initiate
   ↓
3. Auth0 sends push notification to user's mobile device
   (via Guardian app)
   ↓
4. System polls for authorization
   POST /flows/ciba/api/poll (every 5 seconds)
   ↓
5. User receives push notification
   "Approve login attempt from [device/location]?"
   ↓
6. User taps Approve/Deny on mobile device
   ↓
7. Polling receives result
   - Approved: Receive tokens
   - Denied: Receive access_denied error
   ↓
8. System authenticates user (if approved)
   Store tokens, grant access
```

## State Management

The `useCIBAFlow` hook manages CIBA flow state:

```typescript
interface CIBAFlowState {
  status: 'idle' | 'pending' | 'authenticated' | 'expired' | 'denied' | 'error';
  userIdentifier: string;
  identifierType: 'email' | 'phone' | null;
  authReqId: string | null;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  isPolling: boolean;
}
```

## Identifier Validation

Validation functions in `src/lib/shared/auth/validation/identifiers.ts`:

### Email Validation

```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Phone Validation (E.164 Format)

```typescript
export function validatePhoneE164(phone: string): {
  valid: boolean;
  error?: string
} {
  const formatted = formatPhone(phone);

  if (!formatted.startsWith('+')) {
    return { valid: false, error: 'Phone number must start with +' };
  }

  if (!/^\+[1-9]\d{1,14}$/.test(formatted)) {
    return { valid: false, error: 'Invalid E.164 format' };
  }

  return { valid: true };
}
```

**E.164 Format Examples**:
- US: `+15551234567`
- UK: `+447911123456`
- India: `+919876543210`

## Example Usage

### Call Center Agent Interface

```typescript
'use client';

import { useCIBAFlow } from '@/app/flows/ciba/hooks/useCIBAFlow';
import { UserIdentifierInput } from '@/app/flows/ciba/components/UserIdentifierInput';
import { ApprovalStatus } from '@/app/flows/ciba/components/ApprovalStatus';

export default function CallCenterPage() {
  const {
    status,
    userIdentifier,
    identifierType,
    authReqId,
    timeRemaining,
    error,
    setUserIdentifier,
    setIdentifierType,
    initiateFlow,
    reset,
  } = useCIBAFlow();

  const handleInitiate = () => {
    initiateFlow();
  };

  return (
    <div>
      <h1>Call Center Authentication</h1>

      {status === 'idle' && (
        <UserIdentifierInput
          value={userIdentifier}
          onChange={setUserIdentifier}
          identifierType={identifierType}
          onTypeChange={setIdentifierType}
          onSubmit={handleInitiate}
        />
      )}

      {status === 'pending' && (
        <ApprovalStatus
          authReqId={authReqId}
          timeRemaining={timeRemaining}
        />
      )}

      {status === 'authenticated' && (
        <div>Customer authenticated successfully!</div>
      )}

      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Programmatic CIBA Request

```typescript
import { useCIBAFlow } from '@/app/flows/ciba/hooks/useCIBAFlow';

export function AutomatedCIBAAuth() {
  const { initiateFlow, status } = useCIBAFlow();

  const authenticateUser = async (email: string) => {
    await initiateFlow();

    // Wait for user approval
    return new Promise((resolve, reject) => {
      const checkStatus = setInterval(() => {
        if (status === 'authenticated') {
          clearInterval(checkStatus);
          resolve(true);
        } else if (status === 'denied' || status === 'error') {
          clearInterval(checkStatus);
          reject(new Error('Authentication failed'));
        }
      }, 1000);
    });
  };

  return { authenticateUser };
}
```

## Rate Limiting

Configured in `src/middleware.ts`:

- **Initiate endpoint**: 5 requests per 5 minutes per IP
- **Poll endpoint**: 12 requests per minute per IP (matches 5-second interval)

## Polling Configuration

Defined in `src/lib/shared/auth/polling/PollingConfig.ts`:

```typescript
export const CIBA_FLOW_CONFIG = {
  initialInterval: 5000,      // 5 seconds
  timeout: 600000,             // 10 minutes
  maxPolls: 120,               // 600s / 5s = 120 polls
};
```

## Error Handling

CIBA-specific error messages in `src/app/flows/ciba/constants.ts`:

```typescript
export const CIBA_ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number in E.164 format (+15551234567)',
  USER_NOT_FOUND: 'User not found. Please check the identifier.',
  USER_NOT_ENROLLED: 'User has not enrolled in Guardian. Push notification cannot be sent.',
  TIMEOUT: 'Authentication request timed out. Please try again.',
  DENIED: 'User denied the authentication request.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};
```

## Testing Instructions

### Manual Testing

1. **Setup User with Guardian**:
   ```bash
   # User must first enroll in Auth0 Guardian
   # 1. Login via Universal Login
   # 2. Complete Guardian enrollment on mobile device
   # 3. Note the email/phone for testing
   ```

2. **Test Email-Based CIBA**:
   ```bash
   # Start the app
   npm run dev

   # Navigate to
   http://localhost:3000/flows/ciba/call-center

   # Enter enrolled user's email
   # Click "Request Authentication"
   # Check mobile device for push notification
   # Approve the request
   # Verify "Authenticated" status in web app
   ```

3. **Test Phone-Based CIBA**:
   ```bash
   # Same steps but use phone number in E.164 format
   # Example: +15551234567
   ```

4. **Test Denial**:
   - Initiate flow
   - Deny the push notification on mobile
   - Verify "access denied" error displayed

5. **Test Expiration**:
   - Initiate flow
   - Don't respond to push notification
   - Wait 10 minutes
   - Verify "expired" status displayed

### Automated Testing

```typescript
// Example integration test
import { renderHook, act } from '@testing-library/react';
import { useCIBAFlow } from './useCIBAFlow';

describe('CIBA Flow', () => {
  test('initiates CIBA and receives auth_req_id', async () => {
    const { result } = renderHook(() => useCIBAFlow());

    act(() => {
      result.current.setUserIdentifier('user@example.com');
      result.current.setIdentifierType('email');
    });

    await act(async () => {
      await result.current.initiateFlow();
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.authReqId).toBeTruthy();
  });

  test('validates email format', () => {
    const { result } = renderHook(() => useCIBAFlow());

    act(() => {
      result.current.setUserIdentifier('invalid-email');
      result.current.setIdentifierType('email');
    });

    act(() => {
      result.current.initiateFlow();
    });

    expect(result.current.error).toContain('valid email');
  });
});
```

## Security Considerations

1. **User Verification**: Ensure user identity before sending push notification
2. **Rate Limiting**: Prevent abuse of push notification sending
3. **Timeout**: Short-lived authentication requests (10 minutes)
4. **Audit Logging**: Log all CIBA requests for security monitoring
5. **Device Binding**: Guardian ensures notifications sent to enrolled device only
6. **Man-in-the-Middle**: Use HTTPS for all requests
7. **Replay Protection**: auth_req_id is single-use only

## Guardian Enrollment

Users must enroll in Guardian before CIBA can be used:

1. **Enrollment Flow**:
   ```
   User logs in → MFA prompt → Download Guardian app
   → Scan QR code → Complete enrollment → Ready for CIBA
   ```

2. **Check Enrollment Status**:
   ```bash
   # Via Auth0 Management API
   GET https://YOUR_DOMAIN/api/v2/users/USER_ID/enrollments
   ```

## Troubleshooting

### Common Issues

1. **User Not Enrolled**:
   - Issue: "User has not enrolled in Guardian"
   - Solution: Complete Guardian enrollment first

2. **Invalid Identifier**:
   - Issue: Email/phone format incorrect
   - Solution: Verify E.164 format for phone (+country code)

3. **Push Not Received**:
   - Issue: User doesn't receive push notification
   - Solution: Check Guardian app is installed, notifications enabled

4. **Slow Down Error**:
   - Issue: Polling too frequently
   - Solution: Respect interval parameter (5 seconds)

5. **Expired Auth Request**:
   - Issue: User took too long to respond
   - Solution: Restart flow, consider shorter timeout

## Performance Optimization

1. **Webhook Alternative**: Use Auth0 webhooks instead of polling for production
2. **SMS Fallback**: Implement SMS-based CIBA for users without smartphones
3. **Email Fallback**: Magic link via email as alternative to push
4. **Adaptive Polling**: Increase interval over time to reduce load

## Related Flows

- Device Flow: `/flows/device/` - Similar polling pattern, different use case
- Universal Login: `/flows/universal-login/` - Standard authentication alternative

## References

- [Auth0 CIBA Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-initiated-backchannel-authentication-flow)
- [OpenID Connect CIBA Specification](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html)
- [Auth0 Guardian Documentation](https://auth0.com/docs/secure/multi-factor-authentication/auth0-guardian)
- [RFC 7644 - SCIM (user lookup)](https://tools.ietf.org/html/rfc7644)
