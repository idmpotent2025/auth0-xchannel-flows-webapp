# Device Authorization Flow

## Overview

The Device Authorization Flow (Device Code Flow) enables OAuth 2.0 authentication for input-constrained devices such as Smart TVs, gaming consoles, smart cars, and IoT devices. Users authenticate on a secondary device (phone/computer) by entering a code.

## Use Cases

- **Smart TVs**: Netflix-style authentication
- **Smart Cars**: In-vehicle authentication
- **Gaming Consoles**: Xbox, PlayStation login
- **IoT Devices**: Smart home devices
- **Wearables**: Smart watches, fitness trackers

## OAuth/OIDC Specification

This flow implements:
- **OAuth 2.0 Device Authorization Grant** ([RFC 8628](https://tools.ietf.org/html/rfc8628))
- Grant Type: `urn:ietf:params:oauth:grant-type:device_code`

## Auth0 Configuration

### Application Settings

1. Create a Native Application in Auth0 Dashboard
2. Enable Device Code Grant:

```
Application Type: Native
Grant Types: Device Code ✓
Token Endpoint Authentication Method: None
Allowed Callback URLs: Not required for device flow
```

3. Configure Device Code Settings:
   - Device Code Expiration: 600 seconds (10 minutes)
   - User Code Character Set: Base20 (BCDFGHJKLMNPQRSTVWXZ)
   - User Code Length: 8 characters

### Environment Variables

Required in `.env.local`:

```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_DEVICE_CLIENT_ID=your_device_client_id
AUTH0_AUDIENCE=https://your-api.example.com  # Optional
```

## API Endpoints

### Initiate Device Flow

```http
POST /flows/device/api/initiate
Content-Type: application/json

{
  "deviceType": "TV" | "CAR" | "WATCH" | "CONSOLE"
}

Response:
{
  "device_code": "GmRh...mssVF",
  "user_code": "WDJB-MJHT",
  "verification_uri": "https://your-tenant.auth0.com/activate",
  "verification_uri_complete": "https://your-tenant.auth0.com/activate?user_code=WDJB-MJHT",
  "expires_in": 600,
  "interval": 5
}
```

### Poll for Token

```http
POST /flows/device/api/poll
Content-Type: application/json

{
  "device_code": "GmRh...mssVF"
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
1. Device initiates flow
   POST /flows/device/api/initiate
   ↓
2. Receive device_code + user_code
   Display: "Go to auth0.com/activate"
   Display: "Enter code: WDJB-MJHT"
   ↓
3. User visits verification_uri on phone/computer
   ↓
4. User enters user_code
   ↓
5. User authenticates and approves device
   ↓
6. Device polls for token (every 5 seconds)
   POST /flows/device/api/poll
   ↓
7. Receive tokens
   Store access_token, id_token, refresh_token
   ↓
8. Device is authenticated
   Redirect to protected content
```

## State Management

The `useDeviceFlow` hook manages the device flow state:

```typescript
interface DeviceFlowState {
  status: 'idle' | 'pending' | 'authenticated' | 'expired' | 'denied' | 'error';
  userCode: string | null;
  verificationUri: string | null;
  verificationUriComplete: string | null;
  timeRemaining: number;
  pollCount: number;
  tokens: AuthTokens | null;
  error: string | null;
  isPolling: boolean;
}
```

## Device Configuration

Pre-configured device types in `src/app/flows/device/types.ts`:

```typescript
export const DEVICE_CONFIGS = {
  TV: {
    name: 'Smart TV',
    icon: '📺',
    description: 'Authenticate your Smart TV',
  },
  CAR: {
    name: 'Smart Car',
    icon: '🚗',
    description: 'Authenticate your vehicle',
  },
  WATCH: {
    name: 'Smart Watch',
    icon: '⌚',
    description: 'Authenticate your wearable',
  },
  CONSOLE: {
    name: 'Gaming Console',
    icon: '🎮',
    description: 'Authenticate your console',
  },
};
```

## Example Usage

### Device Flow Hook

```typescript
'use client';

import { useDeviceFlow } from '@/app/flows/device/hooks/useDeviceFlow';
import { DEVICE_CONFIGS } from '@/app/flows/device/types';

export default function SmartTVPage() {
  const {
    userCode,
    verificationUri,
    status,
    timeRemaining,
    error,
    initiateFlow,
    reset,
  } = useDeviceFlow();

  const deviceConfig = DEVICE_CONFIGS.TV;

  const handleStart = () => {
    initiateFlow('TV', deviceConfig.name);
  };

  if (status === 'authenticated') {
    return <div>Successfully authenticated!</div>;
  }

  return (
    <div>
      {status === 'idle' && (
        <button onClick={handleStart}>Start Authentication</button>
      )}

      {status === 'pending' && (
        <>
          <p>Go to: {verificationUri}</p>
          <p>Enter code: {userCode}</p>
          <p>Time remaining: {timeRemaining}s</p>
        </>
      )}

      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Custom Device Implementation

```typescript
import { useDeviceFlow } from '@/app/flows/device/hooks/useDeviceFlow';

export function CustomDeviceAuth() {
  const { initiateFlow } = useDeviceFlow();

  return (
    <button onClick={() => initiateFlow('CUSTOM', 'My Custom Device')}>
      Authenticate Custom Device
    </button>
  );
}
```

## Rate Limiting

Configured in `src/middleware.ts`:

- **Initiate endpoint**: 5 requests per 5 minutes per IP
- **Poll endpoint**: 12 requests per minute per IP (matches 5-second interval)

## Polling Configuration

Defined in `src/lib/shared/auth/polling/PollingConfig.ts`:

```typescript
export const DEVICE_FLOW_CONFIG = {
  initialInterval: 5000,      // 5 seconds
  timeout: 600000,             // 10 minutes
  maxPolls: 120,               // 600s / 5s = 120 polls
};
```

## Testing Instructions

### Manual Testing

1. **Test TV Device Flow**:
   ```bash
   # Start the app
   npm run dev

   # Navigate to
   http://localhost:3000/flows/device/tv

   # Click "Start Authentication"
   # Open the verification URL in a browser
   # Enter the displayed user code
   # Authenticate and approve
   # Verify the TV page shows "Authenticated"
   ```

2. **Test Car Device Flow**:
   ```bash
   # Navigate to
   http://localhost:3000/flows/device/car

   # Follow same steps as TV
   ```

3. **Test Expiration**:
   - Start flow but don't approve
   - Wait 10 minutes
   - Verify "expired" status displayed

4. **Test Denial**:
   - Start flow
   - Visit verification URL
   - Deny the request
   - Verify "access denied" status displayed

### Automated Testing

```typescript
// Example test
import { renderHook, act } from '@testing-library/react';
import { useDeviceFlow } from './useDeviceFlow';

test('initiates device flow and polls for token', async () => {
  const { result } = renderHook(() => useDeviceFlow());

  expect(result.current.status).toBe('idle');

  await act(async () => {
    await result.current.initiateFlow('TV', 'Test TV');
  });

  expect(result.current.status).toBe('pending');
  expect(result.current.userCode).toBeTruthy();
  expect(result.current.verificationUri).toBeTruthy();
});
```

## Security Considerations

1. **User Code Format**: Use Base20 character set to avoid confusion (no 0/O, 1/I)
2. **Expiration**: Short-lived codes (10 minutes)
3. **Rate Limiting**: Prevent brute force attacks
4. **Device Code Security**: One-time use only
5. **Polling Interval**: Respect Auth0's rate limits (5 seconds minimum)

## Troubleshooting

### Common Issues

1. **Slow Down Error**:
   - Issue: Polling too frequently
   - Solution: Increase interval to respect `slow_down` response

2. **Expired Token**:
   - Issue: User took too long to authenticate
   - Solution: Restart flow, consider increasing timeout

3. **User Code Not Found**:
   - Issue: Invalid or expired user code
   - Solution: Verify code entered correctly, restart if expired

4. **Rate Limit Exceeded**:
   - Issue: Too many initiate requests
   - Solution: Implement exponential backoff, respect rate limits

## Performance Optimization

1. **QR Code**: Generate QR code from `verification_uri_complete` for faster entry
2. **Deep Links**: Use mobile app deep links to streamline authentication
3. **Interval Adjustment**: Implement adaptive polling based on `interval` response

## Related Flows

- Universal Login: `/flows/universal-login/` - Standard web authentication
- CIBA: `/flows/ciba/` - Similar polling mechanism for push notifications

## References

- [Auth0 Device Authorization Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/device-authorization-flow)
- [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://tools.ietf.org/html/rfc8628)
- [Best Practices for Device Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/device-authorization-flow/call-your-api-using-the-device-authorization-flow)
