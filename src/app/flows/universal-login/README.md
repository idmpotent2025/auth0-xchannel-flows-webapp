# Universal Login Flow

## Overview

The Universal Login flow implements Auth0's hosted login page using the standard OAuth 2.0 Authorization Code Flow with PKCE. This is the most secure and recommended authentication method for web applications.

## Use Case

- Standard web application authentication
- Username/password login
- Social login providers (Google, Facebook, etc.)
- Multi-factor authentication (MFA)
- Passwordless authentication
- Enterprise SSO connections

## OAuth/OIDC Specification

This flow implements:
- **OAuth 2.0 Authorization Code Flow** ([RFC 6749](https://tools.ietf.org/html/rfc6749))
- **PKCE Extension** ([RFC 7636](https://tools.ietf.org/html/rfc7636))
- **OpenID Connect** for identity layer

## Auth0 Configuration

### Application Settings

1. Create a Regular Web Application in Auth0 Dashboard
2. Configure the following settings:

```
Application Type: Regular Web Application
Token Endpoint Authentication Method: None (PKCE)
Allowed Callback URLs: http://localhost:3000/api/auth/callback
Allowed Logout URLs: http://localhost:3000
Allowed Web Origins: http://localhost:3000
```

### Environment Variables

Required in `.env.local`:

```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret  # Optional with PKCE
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=random_32_char_secret
```

## API Endpoints

### Authentication Endpoint

```
GET /api/auth/[auth0]
```

Handles all Auth0 authentication routes:
- `/api/auth/login` - Initiates login
- `/api/auth/callback` - OAuth callback handler
- `/api/auth/logout` - Logs out user
- `/api/auth/me` - Returns current user info

## Authentication Flow

```
1. User clicks "Login with Auth0"
   ↓
2. App redirects to Auth0 hosted login page
   (/authorize endpoint with PKCE parameters)
   ↓
3. User authenticates (username/password, social, etc.)
   ↓
4. Auth0 redirects back to /api/auth/callback
   with authorization code
   ↓
5. Server exchanges code for tokens
   (access_token, id_token, refresh_token)
   ↓
6. Session created, user redirected to /shop
   ↓
7. User is authenticated across the application
```

## State Management

The Universal Login flow uses Auth0's session management:
- Session stored in encrypted cookie
- No client-side state management needed
- `useAuth()` hook provides global auth state

## Example Usage

### Login Button Component

```typescript
'use client';

import { useAuth } from '@/lib/shared/auth/hooks/useAuth';

export function LoginButton() {
  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <p>Welcome, {user.name}</p>;
  }

  return (
    <button onClick={() => login()}>
      Login with Auth0
    </button>
  );
}
```

### Protected Route

```typescript
'use client';

import { useAuth } from '@/lib/shared/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/flows/universal-login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

## Testing Instructions

### Manual Testing

1. **Test Login Flow**:
   ```bash
   # Start the app
   npm run dev

   # Navigate to
   http://localhost:3000/flows/universal-login

   # Click "Login with Auth0"
   # Complete authentication on Auth0 hosted page
   # Verify redirect to /shop with user session
   ```

2. **Test Social Login**:
   - Enable social connections in Auth0 Dashboard
   - Test login with Google/Facebook/etc.
   - Verify user profile returned correctly

3. **Test Logout**:
   - Click logout button
   - Verify session cleared
   - Verify redirect to home page

### Automated Testing

```typescript
// Example test with Jest + Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginButton } from '@/app/flows/universal-login/components/LoginButton';

jest.mock('@/lib/shared/auth/hooks/useAuth');

test('renders login button when not authenticated', () => {
  const mockLogin = jest.fn();
  useAuth.mockReturnValue({
    isAuthenticated: false,
    login: mockLogin,
  });

  render(<LoginButton />);
  const button = screen.getByText(/login with auth0/i);
  fireEvent.click(button);
  expect(mockLogin).toHaveBeenCalled();
});
```

## Security Considerations

1. **PKCE**: Always use PKCE for public clients (SPAs)
2. **State Parameter**: Prevents CSRF attacks (handled by Auth0 SDK)
3. **Nonce**: Prevents replay attacks (handled by Auth0 SDK)
4. **HTTPOnly Cookies**: Session tokens stored securely
5. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **Callback URL Mismatch**:
   - Error: "Callback URL mismatch"
   - Solution: Add callback URL to Auth0 Dashboard allowed URLs

2. **Invalid State**:
   - Error: "State does not match"
   - Solution: Check cookie settings, ensure same domain

3. **Token Expired**:
   - Error: "Token expired"
   - Solution: Implement token refresh or re-authenticate

## Related Flows

- Device Authorization Flow: `/flows/device/` - For input-constrained devices
- CIBA: `/flows/ciba/` - For backchannel authentication
- Native2Web SSO: `/flows/native2web/` - For token exchange from mobile apps

## References

- [Auth0 Universal Login Documentation](https://auth0.com/docs/authenticate/login/auth0-universal-login)
- [OAuth 2.0 Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)
- [PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce)
