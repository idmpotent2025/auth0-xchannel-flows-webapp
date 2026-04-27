# Auth0 Cross-Channel CIAM Webapp

A comprehensive Next.js webapp demonstrating Auth0 cross-channel Customer Identity and Access Management (CIAM) workflows. This webapp complements the iOS ShoeStoreApp and showcases multiple authentication flows for different use cases.

## Features

### 1. Universal Login Flow
Standard OAuth 2.0 Authorization Code Flow with Auth0 hosted login page.
- Secure authentication with Auth0
- Session management with HTTP-only cookies
- Automatic redirect to shop after login

### 2. Device Authorization Code Flow (RFC 8628)
Enable authentication on devices with limited input capabilities.

**Smart TV Use Case:**
- User initiates auth on TV
- Displays user code and verification URL
- User completes auth on phone/computer
- TV polls and receives tokens
- 10-minute timeout with countdown

**Smart Car Use Case:**
- Similar flow optimized for in-car displays
- Separate branding and UI
- Same secure polling mechanism

### 3. CIBA Push Flow
Client-Initiated Backchannel Authentication for call-center scenarios.
- Call center enters customer email/phone
- Push notification sent to customer's mobile device
- Customer approves on mobile app
- Web app polls and receives tokens
- 5-minute timeout

### 4. Native-to-Web SSO
Seamless single sign-on from native mobile app to web.
- iOS ShoeStoreApp generates session token
- Opens webapp with token in URL
- Webapp validates JWT and creates session
- User automatically logged in
- Secure token exchange with rate limiting

### 5. Product Catalog
Shared product catalog between iOS app and webapp.
- 24 products across 4 categories
- Responsive product grid
- Category filtering
- Add to cart functionality

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** Auth0 (@auth0/nextjs-auth0)
- **JWT:** jose (JWT verification)
- **HTTP Client:** axios
- **QR Codes:** qrcode
- **Date Utils:** date-fns
- **Deployment:** Vercel

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   iOS App       │     │   Web App       │     │   Auth0         │
│  (ShoeStoreApp) │────▶│  (This Repo)    │◀───▶│   Tenant        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        │   Session Token       │
        └───────────────────────┘
            (Native2Web SSO)
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [auth0]/route.ts      # Auth0 SDK handler
│   │   │   └── me/route.ts            # Session endpoint
│   │   ├── device-flow/
│   │   │   ├── initiate/route.ts      # Start device flow
│   │   │   └── poll/route.ts          # Poll device status
│   │   ├── ciba/
│   │   │   ├── initiate/route.ts      # Start CIBA flow
│   │   │   └── poll/route.ts          # Poll CIBA status
│   │   ├── native2web/
│   │   │   └── exchange/route.ts      # Token exchange
│   │   └── products/route.ts          # Product catalog API
│   ├── tv-device/page.tsx             # Smart TV flow
│   ├── car-device/page.tsx            # Smart Car flow
│   ├── call-center/page.tsx           # CIBA flow
│   ├── login/page.tsx                 # Universal Login
│   ├── shop/page.tsx                  # Product catalog
│   ├── sso/page.tsx                   # Native2Web landing
│   ├── error.tsx                      # Error boundary
│   ├── not-found.tsx                  # 404 page
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Dashboard/home
├── components/
│   ├── shop/
│   │   ├── ProductCard.tsx            # Product display
│   │   └── CategoryTabs.tsx           # Category filter
│   └── ui/
│       └── Spinner.tsx                # Loading spinner
├── context/
│   └── AuthContext.tsx                # Global auth state
├── lib/
│   ├── auth/
│   │   └── auth0.ts                   # Auth0 client
│   ├── constants/
│   │   ├── products.ts                # Product catalog
│   │   └── theme.ts                   # Brand colors
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth hook
│   │   ├── useDeviceFlow.ts           # Device flow hook
│   │   ├── useCIBAFlow.ts             # CIBA hook
│   │   └── useNative2Web.ts           # SSO hook
│   ├── types/
│   │   └── auth.ts                    # TypeScript types
│   └── utils/
│       └── errorHandler.ts            # Error handling
└── middleware.ts                       # Rate limiting
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Auth0 account with tenant: `digitalkiosk.cic-demo-platform.auth0app.com`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auth0-Xchannel-flows-webapp
```

2. Install dependencies:
```bash
npm install --cache /tmp/npm-cache
```

3. Create `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_AUTH0_DOMAIN=digitalkiosk.cic-demo-platform.auth0app.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_SECRET=$(openssl rand -hex 32)
AUTH0_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH0_AUDIENCE=https://digitalkiosk.example.com/api
NEXT_PUBLIC_AUTH0_SCOPE=openid profile email offline_access
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flows

### Universal Login
1. Click "Login with Auth0" on `/login`
2. Redirected to Auth0 hosted login page
3. Enter credentials
4. Redirected back to `/shop` after successful authentication

### Device Authorization Flow (Smart TV/Car)
1. Visit `/tv-device` or `/car-device`
2. Click "Start Authentication"
3. Note the **user code** and **verification URL**
4. On another device, visit the verification URL
5. Enter the user code
6. Complete authentication
7. Original device polls and receives tokens
8. Automatically redirected to `/shop`

### CIBA Push Flow (Call Center)
1. Visit `/call-center`
2. Enter customer email or phone number
3. Enter location (optional)
4. Click "Send Push Notification"
5. Customer receives push on mobile app
6. Customer approves authentication
7. Web app polls and receives tokens
8. Automatically redirected to `/shop`

**Note:** CIBA requires mobile app with push notification support.

### Native-to-Web SSO
1. From iOS ShoeStoreApp, tap "Continue to Web"
2. App opens: `https://your-domain.com/sso?sessionToken=TOKEN`
3. Webapp validates JWT token
4. Creates web session
5. User automatically logged in
6. Redirected to `/shop`

## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/login` | GET | Initiate Auth0 login | Public |
| `/api/auth/logout` | GET | Logout and clear session | Public |
| `/api/auth/callback` | GET | Auth0 callback handler | Public |
| `/api/auth/me` | GET | Get current user session | Public |
| `/api/device-flow/initiate` | POST | Start device authorization flow | Public |
| `/api/device-flow/poll` | POST | Poll device flow status | Public |
| `/api/ciba/initiate` | POST | Start CIBA push flow | Public |
| `/api/ciba/poll` | POST | Poll CIBA status | Public |
| `/api/native2web/exchange` | POST | Exchange session token for web session | Public |
| `/api/products` | GET | Get product catalog | Protected |

## Security Features

- **HTTP-only cookies:** Session tokens not accessible to JavaScript
- **HTTPS only:** Enforced in production
- **Security headers:** X-Frame-Options, CSP, X-Content-Type-Options
- **Rate limiting:** Prevents polling abuse
  - Device flow polling: 12 requests/minute
  - CIBA polling: 12 requests/minute
  - Token exchange: 3 requests/minute
  - Flow initiation: 5 requests per 5 minutes
- **JWT verification:** Validates signatures using Auth0 JWKS
- **Token validation:** Checks expiration, audience, issuer
- **PKCE:** Proof Key for Code Exchange (future enhancement)

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Auth0 application setup
- Environment variable configuration
- Production checklist
- Troubleshooting

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0 tenant domain | `digitalkiosk.cic-demo-platform.auth0app.com` |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Auth0 client ID | `abc123...` |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | `xyz789...` |
| `AUTH0_SECRET` | Cookie encryption secret | Generate with `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | App base URL | `http://localhost:3000` (dev) or `https://your-domain.com` (prod) |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | Auth0 API audience | `https://digitalkiosk.example.com/api` |
| `NEXT_PUBLIC_AUTH0_SCOPE` | Auth0 scopes | `openid profile email offline_access` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `DEVICE_FLOW_TIMEOUT` | Device flow timeout (seconds) | `600` (10 min) |
| `DEVICE_FLOW_POLLING_INTERVAL` | Device flow polling interval (seconds) | `5` |
| `CIBA_TIMEOUT` | CIBA timeout (seconds) | `300` (5 min) |
| `CIBA_POLLING_INTERVAL` | CIBA polling interval (seconds) | `5` |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL | Auto-detected |

## Testing

### Manual Testing Checklist

- [ ] Universal Login flow works end-to-end
- [ ] Smart TV device flow authenticates successfully
- [ ] Smart Car device flow authenticates successfully
- [ ] CIBA push flow sends notification and polls correctly
- [ ] Native2Web SSO exchanges token and logs in
- [ ] Product catalog displays all 24 products
- [ ] Category filtering works
- [ ] Logout clears session
- [ ] Error pages render (404, 500)
- [ ] Rate limiting blocks excessive requests
- [ ] Responsive design works on mobile/tablet/desktop

### Test Each Flow

1. **Universal Login:**
   ```bash
   # Visit http://localhost:3000/login
   # Click "Login with Auth0"
   # Verify redirect to Auth0
   # Enter credentials
   # Verify redirect to /shop
   ```

2. **Device Flow (TV/Car):**
   ```bash
   # Visit http://localhost:3000/tv-device
   # Click "Start Smart TV Authentication"
   # Note user_code
   # In new tab, visit verification URL
   # Enter user_code
   # Complete authentication
   # Verify original tab shows "Authenticated!"
   ```

3. **CIBA Push:**
   ```bash
   # Visit http://localhost:3000/call-center
   # Enter email: test@example.com
   # Click "Send Push Notification"
   # On mobile app, approve notification
   # Verify web app shows "Authenticated!"
   ```

4. **Native2Web SSO:**
   ```bash
   # From iOS app, tap "Continue to Web"
   # Verify opens browser with sessionToken
   # Verify webapp exchanges token
   # Verify redirect to /shop with user logged in
   ```

## Troubleshooting

### "Invalid state" error during login
- **Cause:** `AUTH0_SECRET` mismatch or not set
- **Solution:** Verify `AUTH0_SECRET` is set and consistent

### Callback URL mismatch
- **Cause:** Callback URL not added to Auth0 app settings
- **Solution:** Add `http://localhost:3000/api/auth/callback` to Allowed Callback URLs in Auth0

### Device flow not working
- **Cause:** Device Code grant type not enabled
- **Solution:** Enable in Auth0 Dashboard → Applications → Your App → Advanced Settings → Grant Types

### CIBA not working
- **Cause:** CIBA not enabled on tenant
- **Solution:** Contact Auth0 support to enable CIBA

### Rate limiting errors
- **Cause:** Exceeded rate limits (working as intended)
- **Solution:** Wait before retrying. Adjust `DEVICE_FLOW_POLLING_INTERVAL` or `CIBA_POLLING_INTERVAL` if needed.

### Products not loading
- **Cause:** Not authenticated
- **Solution:** Login first via `/login`

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [Auth0 Documentation](https://auth0.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OAuth 2.0 Device Authorization Grant (RFC 8628)](https://datatracker.ietf.org/doc/html/rfc8628)
- [CIBA Specification](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html)

## Theme

Brand colors matching iOS ShoeStoreApp:
- **Primary (Navy):** `#003057`
- **Accent (Blue):** `#0055A6`
- **Background (Teal):** `#3A7D7D`

## Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Contact Auth0 support for tenant-specific issues
- Check Auth0 logs for authentication failures

## License

[Your License Here]

## Acknowledgments

- Auth0 for comprehensive CIAM platform
- Next.js team for excellent framework
- Vercel for hosting platform
