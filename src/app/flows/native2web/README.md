# Native-to-Web SSO Flow

## Overview

The Native-to-Web SSO flow enables seamless single sign-on between a mobile native application (iOS/Android) and a web application. Users authenticate once in the mobile app and are automatically signed into the web app by securely exchanging tokens, eliminating the need to re-authenticate.

## Use Cases

- **Mobile-to-Web Handoff**: User shops on mobile app, continues checkout on web
- **QR Code Login**: Scan QR code on web with mobile app to auto-login
- **Deep Linking**: Open web link from mobile app with automatic authentication
- **Cross-Platform Experience**: Seamless auth across mobile and web platforms
- **Retail Apps**: In-store mobile app to online web experience

## OAuth/OIDC Specification

This flow implements:
- **OAuth 2.0 Token Exchange** ([RFC 8693](https://tools.ietf.org/html/rfc8693))
- **JWT Bearer Token Grant** ([RFC 7523](https://tools.ietf.org/html/rfc7523))
- Grant Type: `urn:ietf:params:oauth:grant-type:token-exchange`

## Auth0 Configuration

### Mobile Application Settings

1. Create a Native Application in Auth0 Dashboard
2. Configure settings:

```
Application Type: Native
Token Endpoint Authentication Method: None
Allowed Callback URLs:
  - myapp://callback
  - myapp://auth0.com/ios/com.yourcompany.app/callback
Grant Types: Authorization Code ✓, Refresh Token ✓
```

### Web Application Settings

1. Use existing Regular Web Application or create new one
2. Configure CORS:

```
Allowed Web Origins:
  - http://localhost:3000
  - https://your-production-domain.com
```

### Environment Variables

Mobile App (iOS/Android):
```swift
// iOS Example (Info.plist or Config.swift)
AUTH0_DOMAIN = "your-tenant.auth0.com"
AUTH0_CLIENT_ID = "your_native_client_id"
AUTH0_AUDIENCE = "https://your-api.example.com"
AUTH0_CALLBACK_URL = "myapp://callback"
```

Web App (`.env.local`):
```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api.example.com
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

## API Endpoints

### Token Exchange Endpoint

```http
POST /flows/native2web/api/exchange
Content-Type: application/json

{
  "sessionToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (Success):
{
  "success": true,
  "tokens": {
    "access_token": "eyJhbG...",
    "id_token": "eyJhbG...",
    "expires_in": 86400,
    "token_type": "Bearer"
  },
  "user": {
    "sub": "auth0|123456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}

Response (Error):
{
  "success": false,
  "error": "Invalid token",
  "message": "Token verification failed"
}
```

## Authentication Flow

```
1. User authenticates in mobile app
   (iOS/Android native app)
   ↓
2. Mobile app receives tokens from Auth0
   (access_token, id_token)
   ↓
3. User triggers web handoff
   (e.g., "Continue on web" button)
   ↓
4. Mobile app generates session token
   (short-lived JWT or access_token)
   ↓
5. Mobile app opens web browser with token
   https://your-app.com/flows/native2web/sso?sessionToken=...
   ↓
6. Web app receives token in URL parameter
   ↓
7. Web app sends token to exchange endpoint
   POST /flows/native2web/api/exchange
   ↓
8. Server validates JWT signature (JWKS)
   Verifies: issuer, audience, expiration
   ↓
9. Server issues web session
   (Sets session cookie)
   ↓
10. User redirected to protected content
   /shop (authenticated)
```

## State Management

The `useNative2Web` hook manages the token exchange state:

```typescript
interface Native2WebState {
  status: 'idle' | 'exchanging' | 'authenticated' | 'error';
  sessionToken: string | null;
  tokens: AuthTokens | null;
  user: User | null;
  error: string | null;
}
```

## JWT Validation

Token validation in `src/lib/shared/auth/validation/jwt.ts`:

```typescript
export async function verifyAuth0JWT(
  token: string,
  options: JWTVerifyOptions
): Promise<jose.JWTVerifyResult> {
  const JWKS = jose.createRemoteJWKSet(
    new URL(`https://${options.domain}/.well-known/jwks.json`)
  );

  const audience = options.audience || [
    options.clientId,
    `https://${options.domain}/userinfo`,
  ];

  return await jose.jwtVerify(token, JWKS, {
    issuer: `https://${options.domain}/`,
    audience,
  });
}
```

**Validation Checks**:
1. Signature verification using JWKS
2. Issuer matches Auth0 domain
3. Audience includes client ID or API audience
4. Token not expired
5. Token format valid

## Example Usage

### iOS Mobile App (Swift)

```swift
import Auth0

class AuthService {
    func openWebWithSSO() {
        // Get current access token
        guard let accessToken = credentialsManager.credentials?.accessToken else {
            print("No access token available")
            return
        }

        // Build SSO URL with token
        let webURL = "https://your-app.com/flows/native2web/sso"
        let urlWithToken = "\(webURL)?sessionToken=\(accessToken)"

        // Open in Safari or in-app browser
        if let url = URL(string: urlWithToken) {
            UIApplication.shared.open(url)
        }
    }

    // Alternative: QR Code generation
    func generateWebSSOQRCode() -> UIImage? {
        guard let token = credentialsManager.credentials?.accessToken else {
            return nil
        }

        let ssoURL = "https://your-app.com/flows/native2web/sso?sessionToken=\(token)"
        return generateQRCode(from: ssoURL)
    }
}
```

### Android Mobile App (Kotlin)

```kotlin
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationAPIClient
import android.net.Uri

class AuthService(private val auth0: Auth0) {
    fun openWebWithSSO(accessToken: String) {
        val webUrl = "https://your-app.com/flows/native2web/sso"
        val uri = Uri.parse(webUrl)
            .buildUpon()
            .appendQueryParameter("sessionToken", accessToken)
            .build()

        // Open in browser
        val intent = Intent(Intent.ACTION_VIEW, uri)
        context.startActivity(intent)
    }
}
```

### Web App (React/Next.js)

```typescript
'use client';

import { useNative2Web } from '@/app/flows/native2web/hooks/useNative2Web';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Native2WebSSOPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, exchangeToken, error } = useNative2Web();

  useEffect(() => {
    const sessionToken = searchParams.get('sessionToken');

    if (sessionToken) {
      exchangeToken(sessionToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to protected content
      router.push('/shop');
    }
  }, [status, router]);

  if (status === 'exchanging') {
    return <div>Authenticating...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Authentication failed: {error}</p>
        <a href="/flows/universal-login">Login manually</a>
      </div>
    );
  }

  return <div>Processing authentication...</div>;
}
```

## Rate Limiting

Configured in `src/middleware.ts`:

- **Exchange endpoint**: 3 requests per minute per IP

This prevents token replay attacks and abuse.

## Security Considerations

### Critical Security Measures

1. **Token Expiration**:
   - Session tokens must be short-lived (5-10 minutes recommended)
   - Check expiration before exchange

2. **JWT Signature Verification**:
   - Always verify signature using Auth0 JWKS
   - Never trust token payload without verification

3. **Audience Validation**:
   - Ensure token audience matches expected values
   - Prevents token misuse across applications

4. **HTTPS Only**:
   - Always use HTTPS in production
   - Tokens in URL parameters are visible in browser history

5. **Token Single-Use**:
   - Consider implementing token nonce/jti tracking
   - Prevent replay attacks

6. **Rate Limiting**:
   - Strict rate limits on exchange endpoint
   - Prevents brute force and token guessing

7. **Browser Security**:
   - Clear sessionToken from URL after use
   - Use `window.history.replaceState()` to remove token

### Alternative: POST Method

For enhanced security, use POST instead of GET:

```typescript
// Mobile app posts to endpoint instead of URL parameter
fetch('https://your-app.com/flows/native2web/api/exchange', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionToken: token }),
  credentials: 'include',
});
```

## Testing Instructions

### Manual Testing

1. **Test with iOS App**:
   ```bash
   # Setup iOS app with Auth0
   # Authenticate in the app
   # Tap "Continue on Web" button
   # Verify automatic login in Safari/browser
   ```

2. **Test with Mock Token**:
   ```bash
   # Get valid access token from mobile app
   # Manually construct URL
   http://localhost:3000/flows/native2web/sso?sessionToken=YOUR_TOKEN

   # Verify successful authentication
   # Check redirection to /shop
   ```

3. **Test Token Validation**:
   ```bash
   # Test expired token
   # Test invalid token
   # Test token from wrong issuer
   # Verify appropriate error messages
   ```

4. **Test Rate Limiting**:
   ```bash
   # Send 4+ requests within 1 minute
   # Verify 429 rate limit response
   ```

### Automated Testing

```typescript
// Example test
import { verifyAuth0JWT } from '@/lib/shared/auth/validation/jwt';

describe('Token Exchange', () => {
  test('validates JWT signature', async () => {
    const validToken = 'eyJhbG...'; // Valid token from Auth0

    await expect(
      verifyAuth0JWT(validToken, {
        domain: process.env.AUTH0_DOMAIN!,
        clientId: process.env.AUTH0_CLIENT_ID!,
      })
    ).resolves.toBeTruthy();
  });

  test('rejects expired token', async () => {
    const expiredToken = 'eyJhbG...'; // Expired token

    await expect(
      verifyAuth0JWT(expiredToken, {
        domain: process.env.AUTH0_DOMAIN!,
        clientId: process.env.AUTH0_CLIENT_ID!,
      })
    ).rejects.toThrow();
  });
});
```

## Troubleshooting

### Common Issues

1. **Invalid Token Error**:
   - Issue: JWT verification fails
   - Solutions:
     - Check token is from correct Auth0 tenant
     - Verify audience matches
     - Ensure token not expired
     - Check JWKS endpoint accessible

2. **CORS Error**:
   - Issue: Browser blocks request
   - Solution: Add web origin to Auth0 app settings

3. **Session Not Created**:
   - Issue: User not authenticated after exchange
   - Solution: Verify session creation in exchange endpoint

4. **Rate Limit Exceeded**:
   - Issue: Too many exchange attempts
   - Solution: Implement exponential backoff, cache results

5. **Token in Browser History**:
   - Issue: Security concern with token in URL
   - Solution: Use `history.replaceState()` to clear URL

## Best Practices

1. **Token Lifetime**: Use short-lived tokens (5-10 minutes)
2. **Clear URL**: Remove token from URL after exchange
3. **Fallback Auth**: Provide manual login option if exchange fails
4. **User Experience**: Show loading state during exchange
5. **Error Handling**: Clear error messages for users
6. **Logging**: Log exchange attempts for security monitoring
7. **Deep Links**: Use custom URL schemes (myapp://) for better UX

## Performance Optimization

1. **Pre-fetch JWKS**: Cache Auth0 JWKS for faster verification
2. **Parallel Requests**: Validate and create session in parallel
3. **Client-Side Caching**: Cache user info after successful exchange
4. **Optimize Redirects**: Minimize redirect chain

## Alternative Implementations

### QR Code Flow

```typescript
// Generate QR code in mobile app
const qrData = {
  sessionToken: accessToken,
  expires: Date.now() + 300000, // 5 minutes
};
const qrCode = generateQR(JSON.stringify(qrData));

// Scan QR code on web
const scanner = new QRScanner();
scanner.scan().then(data => {
  const { sessionToken } = JSON.parse(data);
  exchangeToken(sessionToken);
});
```

### WebSocket Flow

For real-time handoff without URL parameters:

```typescript
// Mobile initiates WebSocket connection
const ws = new WebSocket('wss://your-app.com/sso-bridge');
ws.send({ action: 'initiate', token: accessToken });

// Web listens for token
ws.onmessage = (event) => {
  const { sessionToken } = JSON.parse(event.data);
  exchangeToken(sessionToken);
};
```

## Related Flows

- Universal Login: `/flows/universal-login/` - Fallback if exchange fails
- Device Flow: `/flows/device/` - Alternative for TV/device authentication

## References

- [Auth0 Token Exchange Documentation](https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens#token-exchange)
- [RFC 8693 - OAuth 2.0 Token Exchange](https://tools.ietf.org/html/rfc8693)
- [RFC 7523 - JWT Bearer Token Grant](https://tools.ietf.org/html/rfc7523)
- [JOSE Library](https://github.com/panva/jose) - JWT verification
- [Auth0 iOS SDK](https://github.com/auth0/Auth0.swift)
- [Auth0 Android SDK](https://github.com/auth0/Auth0.Android)
