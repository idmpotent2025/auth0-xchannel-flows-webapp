# Testing Guide

This guide provides comprehensive testing procedures for all authentication flows and features in the Auth0 Cross-Channel CIAM webapp.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Testing](#local-development-testing)
3. [Authentication Flow Tests](#authentication-flow-tests)
4. [API Endpoint Tests](#api-endpoint-tests)
5. [Security Tests](#security-tests)
6. [UI/UX Tests](#uiux-tests)
7. [Browser Compatibility](#browser-compatibility)
8. [Performance Tests](#performance-tests)
9. [Error Handling Tests](#error-handling-tests)
10. [Production Verification](#production-verification)

## Prerequisites

Before testing, ensure:
- [ ] Next.js dev server running (`npm run dev`)
- [ ] `.env.local` configured with valid Auth0 credentials
- [ ] Auth0 application properly configured
- [ ] Device Code grant enabled in Auth0
- [ ] CIBA enabled (optional - for call-center flow)
- [ ] iOS ShoeStoreApp available (for Native2Web SSO testing)
- [ ] Test user accounts created in Auth0

## Local Development Testing

### Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

### Verify Environment Variables

```bash
# Check all required variables are set
node -e "require('dotenv').config({ path: '.env.local' }); console.log('AUTH0_DOMAIN:', process.env.NEXT_PUBLIC_AUTH0_DOMAIN); console.log('CLIENT_ID set:', !!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID);"
```

### Build Test

```bash
npm run build
```

Expected: Build completes without errors.

## Authentication Flow Tests

### 1. Universal Login Flow

**Test Scenario:** Standard OAuth 2.0 Authorization Code Flow

#### Steps:
1. Navigate to `http://localhost:3000/login`
2. Verify page displays "Login with Auth0" button
3. Click "Login with Auth0"
4. Verify redirect to Auth0 hosted login page
5. Enter test user credentials
6. Click "Continue" or "Log In"
7. Verify redirect back to webapp
8. Verify redirect to `/shop`
9. Verify user info displayed (name, email, avatar)
10. Verify "Logout" button appears

#### Expected Results:
- ✅ Redirect to Auth0 login page
- ✅ Auth0 login page displays correctly
- ✅ Successful authentication
- ✅ Callback to `/api/auth/callback`
- ✅ Session cookie set (check DevTools → Application → Cookies)
- ✅ User data displayed in shop
- ✅ Access token available (check Network tab)

#### Common Issues:
- **"Invalid state" error:** Check `AUTH0_SECRET` is set
- **"Callback URL mismatch":** Verify callback URL in Auth0 settings
- **Session not persisting:** Check cookie settings

---

### 2. Device Authorization Flow (Smart TV)

**Test Scenario:** User authenticates TV using phone/computer

#### Steps:
1. Navigate to `http://localhost:3000/tv-device`
2. Click "Start Smart TV Authentication"
3. Note the **user code** (e.g., `ABCD-EFGH`)
4. Note the **verification URL** (e.g., `digitalkiosk.auth0app.com/activate`)
5. Verify countdown timer starts (10 minutes)
6. Verify polling status shows "Waiting for authentication..."
7. Open new browser tab or device
8. Navigate to verification URL
9. Enter user code
10. Complete authentication
11. Return to original tab
12. Verify status changes to "Authenticated!"
13. Verify redirect to `/shop`

#### Expected Results:
- ✅ User code displayed prominently (large, copyable)
- ✅ Verification URL displayed
- ✅ Copy button works for user code
- ✅ Countdown timer shows remaining time
- ✅ Polling starts automatically
- ✅ Polling interval: 5 seconds
- ✅ Status updates when authenticated
- ✅ Auto-redirect to shop after success
- ✅ Session created successfully

#### Test Expired Flow:
1. Start authentication
2. Wait 10 minutes without completing auth
3. Verify countdown reaches 0
4. Verify status shows "Authentication expired"
5. Verify "Try Again" button appears

#### Test Denied Flow:
1. Start authentication
2. On verification page, click "Cancel" or "Deny"
3. Verify original page shows "Authentication denied"
4. Verify "Try Again" button appears

#### API Verification:
```bash
# Test initiate endpoint
curl -X POST http://localhost:3000/api/device-flow/initiate \
  -H "Content-Type: application/json" \
  -d '{"deviceType": "TV", "deviceName": "Living Room TV"}'

# Expected response:
# {
#   "device_code": "...",
#   "user_code": "ABCD-EFGH",
#   "verification_uri": "...",
#   "verification_uri_complete": "...",
#   "expires_in": 600,
#   "interval": 5
# }

# Test poll endpoint (use device_code from above)
curl -X POST http://localhost:3000/api/device-flow/poll \
  -H "Content-Type: application/json" \
  -d '{"deviceCode": "DEVICE_CODE_HERE", "pollCount": 1}'

# Expected response (pending):
# { "status": "pending" }

# Expected response (authenticated):
# {
#   "status": "authenticated",
#   "tokens": {
#     "access_token": "...",
#     "id_token": "...",
#     "token_type": "Bearer",
#     "expires_in": 86400
#   }
# }
```

---

### 3. Device Authorization Flow (Smart Car)

**Test Scenario:** Same as Smart TV but with car-specific UI

#### Steps:
1. Navigate to `http://localhost:3000/car-device`
2. Follow same steps as Smart TV test
3. Verify car-specific branding (car icon, blue theme)
4. Complete authentication flow

#### Expected Results:
- ✅ Same functionality as Smart TV
- ✅ Different visual theme (blue vs teal)
- ✅ Car icon displayed
- ✅ "Smart Car" branding

---

### 4. CIBA Push Flow (Call Center)

**Test Scenario:** Call center initiates auth, customer approves on mobile

#### Prerequisites:
- CIBA enabled on Auth0 tenant
- iOS ShoeStoreApp with push notification support
- Test user with mobile app installed

#### Steps:
1. Navigate to `http://localhost:3000/call-center`
2. Enter customer email or phone number
3. Toggle between email/phone input
4. Enter location (optional): "Boston Office"
5. Click "Send Push Notification"
6. Verify auth request ID displayed
7. Verify countdown timer starts (5 minutes)
8. Verify polling status shows "Waiting for approval..."
9. On mobile device, check for push notification
10. Tap push notification
11. Approve authentication in mobile app
12. Return to web browser
13. Verify status changes to "Authenticated!"
14. Verify redirect to `/shop`

#### Expected Results:
- ✅ Email validation (RFC 5322 format)
- ✅ Phone validation (E.164 format: +1234567890)
- ✅ Auth request initiated successfully
- ✅ Auth request ID displayed
- ✅ Countdown timer shows remaining time
- ✅ Polling starts automatically
- ✅ Polling interval: 5 seconds
- ✅ Push notification received on mobile
- ✅ Status updates when approved
- ✅ Auto-redirect to shop after success

#### Test Expired Flow:
1. Initiate CIBA request
2. Wait 5 minutes without approving
3. Verify status shows "Authentication expired"
4. Verify "Try Again" button appears

#### Test Denied Flow:
1. Initiate CIBA request
2. On mobile app, tap "Deny"
3. Verify web page shows "Authentication denied"
4. Verify "Try Again" button appears

#### API Verification:
```bash
# Test initiate endpoint
curl -X POST http://localhost:3000/api/ciba/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userIdentifier": "user@example.com",
    "identifierType": "email",
    "deviceName": "Call Center Portal",
    "location": "Boston Office"
  }'

# Expected response:
# {
#   "auth_req_id": "...",
#   "expires_in": 300,
#   "interval": 5
# }

# Test poll endpoint
curl -X POST http://localhost:3000/api/ciba/poll \
  -H "Content-Type: application/json" \
  -d '{"authRequestId": "AUTH_REQ_ID_HERE", "pollCount": 1}'

# Expected response (pending):
# { "status": "pending" }

# Expected response (authenticated):
# {
#   "status": "authenticated",
#   "tokens": { ... }
# }
```

#### CIBA Not Enabled Test:
If CIBA is not enabled on tenant:
- ✅ Initiate endpoint returns 404
- ✅ Error message: "CIBA is not enabled on this tenant"
- ✅ Instructions displayed to contact Auth0 support

---

### 5. Native-to-Web SSO

**Test Scenario:** User logs in on iOS app, continues to web

#### Prerequisites:
- iOS ShoeStoreApp running
- User authenticated in iOS app
- Web app URL configured in iOS app

#### Steps:
1. Open iOS ShoeStoreApp
2. Login with test user credentials
3. Navigate to profile or settings
4. Tap "Continue to Web" button
5. iOS app opens browser with URL: `http://localhost:3000/sso?sessionToken=LONG_JWT_TOKEN`
6. Observe web app loading screen
7. Verify token exchange happens automatically
8. Verify redirect to `/shop`
9. Verify user logged in (same user as iOS app)
10. Verify user info matches iOS app

#### Expected Results:
- ✅ URL contains sessionToken parameter
- ✅ Loading spinner displayed during exchange
- ✅ Token validated successfully
- ✅ JWT signature verified
- ✅ JWT claims validated (exp, aud, iss)
- ✅ Session created
- ✅ Cookie set
- ✅ Auto-redirect to shop
- ✅ User info displayed correctly

#### Manual Token Test:
```bash
# Generate a test JWT token (requires valid Auth0 token)
# Use token from iOS app or generate using Auth0 SDK

# Test exchange endpoint
curl -X POST http://localhost:3000/api/native2web/exchange \
  -H "Content-Type: application/json" \
  -d '{"sessionToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}'

# Expected response (success):
# {
#   "success": true,
#   "user": {
#     "sub": "auth0|...",
#     "email": "user@example.com",
#     "name": "Test User"
#   },
#   "redirectUrl": "/shop"
# }

# Expected response (invalid token):
# {
#   "success": false,
#   "error": "Invalid or expired token"
# }
```

#### Security Tests:
1. **Expired Token:** Use token with past exp claim → Should return error
2. **Invalid Signature:** Modify token → Should return error
3. **Wrong Audience:** Use token for different client → Should return error
4. **Malformed Token:** Send invalid JWT → Should return error

---

## API Endpoint Tests

### Products API

```bash
# Test without authentication (should fail)
curl http://localhost:3000/api/products

# Expected: Redirect to login or 401 error

# Test with authentication (after logging in)
# Get session cookie from browser DevTools
curl http://localhost:3000/api/products \
  -H "Cookie: appSession=..."

# Expected response:
# {
#   "products": [...],
#   "categories": ["all", "dresses", "petFood", "burritos", "cpgGoods"],
#   "categoryLabels": { ... },
#   "total": 24
# }

# Test with category filter
curl "http://localhost:3000/api/products?category=dresses" \
  -H "Cookie: appSession=..."

# Expected: Only dress products returned
```

### Auth Me Endpoint

```bash
# Test without session
curl http://localhost:3000/api/auth/me

# Expected: 401 or { user: null }

# Test with session
curl http://localhost:3000/api/auth/me \
  -H "Cookie: appSession=..."

# Expected response:
# {
#   "user": {
#     "sub": "auth0|...",
#     "name": "Test User",
#     "email": "user@example.com",
#     "picture": "https://..."
#   },
#   "accessToken": "eyJhbGci..."
# }
```

---

## Security Tests

### Rate Limiting

#### Device Flow Polling Rate Limit
```bash
# Make 13 rapid requests (limit is 12/minute)
for i in {1..13}; do
  curl -X POST http://localhost:3000/api/device-flow/poll \
    -H "Content-Type: application/json" \
    -d '{"deviceCode": "test", "pollCount": 1}' &
done
wait

# Expected: 13th request returns 429 Too Many Requests
```

#### CIBA Polling Rate Limit
```bash
# Make 13 rapid requests
for i in {1..13}; do
  curl -X POST http://localhost:3000/api/ciba/poll \
    -H "Content-Type: application/json" \
    -d '{"authRequestId": "test", "pollCount": 1}' &
done
wait

# Expected: 13th request returns 429
```

#### Token Exchange Rate Limit
```bash
# Make 4 rapid requests (limit is 3/minute)
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/native2web/exchange \
    -H "Content-Type: application/json" \
    -d '{"sessionToken": "test"}' &
done
wait

# Expected: 4th request returns 429
```

### Security Headers

```bash
# Check security headers
curl -I http://localhost:3000

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# X-DNS-Prefetch-Control: on
# Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Cookie Security

1. Open DevTools → Application → Cookies
2. Find `appSession` cookie
3. Verify attributes:
   - ✅ HttpOnly: true (not accessible via JavaScript)
   - ✅ Secure: true (in production)
   - ✅ SameSite: Lax or Strict
   - ✅ Path: /
   - ✅ Domain: localhost or production domain

### XSS Protection

Test that user input is properly sanitized:
1. Try entering `<script>alert('XSS')</script>` in form fields
2. Verify script does not execute
3. Check HTML is escaped in rendered output

---

## UI/UX Tests

### Responsive Design

Test on different screen sizes:

#### Desktop (1920x1080)
- ✅ Navigation tabs displayed horizontally
- ✅ Product grid shows 4 columns
- ✅ All content visible without scrolling (above fold)
- ✅ No layout breaks

#### Tablet (768x1024)
- ✅ Navigation tabs responsive
- ✅ Product grid shows 2-3 columns
- ✅ Forms properly sized
- ✅ Touch targets at least 44x44px

#### Mobile (375x667)
- ✅ Navigation collapses to mobile menu or scrollable tabs
- ✅ Product grid shows 1-2 columns
- ✅ Forms stack vertically
- ✅ Text readable without zoom
- ✅ Buttons easily tappable

### Loading States

1. **Initial Page Load:**
   - ✅ Spinner displayed while loading
   - ✅ Skeleton loaders for content (if implemented)

2. **Authentication Flow:**
   - ✅ "Starting authentication..." message
   - ✅ Polling indicator animates
   - ✅ Countdown timer updates every second

3. **Product Catalog:**
   - ✅ Loading spinner while fetching products
   - ✅ Smooth transition when products load

### Error States

1. **Network Error:**
   - Disconnect internet
   - Try authenticating
   - ✅ Error message displayed
   - ✅ "Try Again" button works

2. **Auth Error:**
   - Use invalid credentials
   - ✅ Auth0 error displayed
   - ✅ Can return to app

3. **404 Page:**
   - Navigate to `/nonexistent-page`
   - ✅ Custom 404 page displays
   - ✅ Quick links to main pages work
   - ✅ "Go Home" button works

4. **500 Error:**
   - Trigger server error (e.g., invalid API key)
   - ✅ Error boundary catches error
   - ✅ User-friendly message displayed
   - ✅ "Try Again" or "Go Home" buttons work

---

## Browser Compatibility

Test on the following browsers:

### Chrome (Latest)
- [ ] Universal Login works
- [ ] Device flows work
- [ ] CIBA works
- [ ] Native2Web SSO works
- [ ] Products display correctly
- [ ] Responsive design works

### Safari (Latest)
- [ ] All authentication flows work
- [ ] Cookies persist correctly
- [ ] iOS Safari (mobile) works

### Firefox (Latest)
- [ ] All authentication flows work
- [ ] No console errors

### Edge (Latest)
- [ ] All authentication flows work

### Older Browsers
- [ ] Graceful degradation or warning message

---

## Performance Tests

### Page Load Times

Use browser DevTools Performance tab:

1. **Home Page (`/`):**
   - ✅ First Contentful Paint < 1.5s
   - ✅ Largest Contentful Paint < 2.5s
   - ✅ Time to Interactive < 3s

2. **Shop Page (`/shop`):**
   - ✅ Products load < 2s
   - ✅ Images load progressively

3. **Device Flow Pages:**
   - ✅ Page renders immediately
   - ✅ Polling does not block UI

### Bundle Size

```bash
npm run build

# Check bundle sizes
# Expected: Total page size < 500KB (gzipped)
```

### API Response Times

- `/api/device-flow/initiate`: < 500ms
- `/api/device-flow/poll`: < 200ms
- `/api/ciba/initiate`: < 500ms
- `/api/ciba/poll`: < 200ms
- `/api/native2web/exchange`: < 300ms
- `/api/products`: < 200ms

---

## Error Handling Tests

### Auth0 API Errors

#### Test Error Scenarios:

1. **Invalid Client ID:**
   - Set wrong CLIENT_ID in `.env.local`
   - Try logging in
   - ✅ Clear error message displayed
   - ✅ Includes instructions to check credentials

2. **Invalid Client Secret:**
   - Set wrong CLIENT_SECRET
   - Try device flow
   - ✅ Error caught and displayed

3. **Expired Device Code:**
   - Start device flow
   - Wait 10+ minutes
   - Try to authenticate
   - ✅ "Expired token" error shown
   - ✅ Can restart flow

4. **Network Timeout:**
   - Throttle network to "Slow 3G" in DevTools
   - Try authenticating
   - ✅ Request times out gracefully
   - ✅ Error message displayed

### Form Validation

1. **CIBA Email Validation:**
   - Enter invalid email: `notanemail`
   - ✅ Validation error shown
   - Enter valid email: `user@example.com`
   - ✅ Validation passes

2. **CIBA Phone Validation:**
   - Enter invalid phone: `123`
   - ✅ Validation error shown
   - Enter valid phone: `+1234567890`
   - ✅ Validation passes

---

## Production Verification

After deploying to Vercel, verify:

### Production Checklist

- [ ] HTTPS enforced (no HTTP access)
- [ ] Environment variables set in Vercel
- [ ] Auth0 callback URLs updated with production domain
- [ ] All authentication flows work end-to-end
- [ ] Products load correctly
- [ ] Security headers present
- [ ] Rate limiting works
- [ ] Error pages render correctly
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Mobile responsive
- [ ] Browser compatibility verified
- [ ] Analytics tracking (if enabled)

### Production Tests

1. **Visit Production URL:**
   ```
   https://your-app.vercel.app
   ```

2. **Test Each Flow:**
   - Universal Login
   - Smart TV Device Flow
   - Smart Car Device Flow
   - CIBA Push Flow (if enabled)
   - Native2Web SSO (from iOS app)

3. **Check Auth0 Logs:**
   - Navigate to Auth0 Dashboard → Logs
   - Verify successful authentications logged
   - Check for any errors

4. **Monitor Vercel Logs:**
   ```bash
   vercel logs https://your-app.vercel.app
   ```
   - Check for runtime errors
   - Verify API calls succeeding

---

## Automated Testing (Future Enhancement)

Consider adding automated tests:

### Unit Tests (Jest + React Testing Library)
```typescript
// Example: useAuth hook test
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/lib/hooks/useAuth';

test('useAuth returns user when authenticated', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).toBeDefined();
});
```

### Integration Tests (Playwright or Cypress)
```typescript
// Example: Device flow test
test('device flow completes successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/tv-device');
  await page.click('button:has-text("Start Smart TV Authentication")');
  const userCode = await page.locator('[data-testid="user-code"]').textContent();
  expect(userCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  // ... complete authentication in new tab
  // ... verify redirect to shop
});
```

### API Tests (Postman or REST Client)
- Import API collection
- Run automated tests against endpoints
- Verify response schemas

---

## Test Data

### Test Users

Create test users in Auth0 with different scenarios:

1. **Standard User:**
   - Email: `testuser@example.com`
   - Password: `Test1234!`
   - MFA: Disabled

2. **MFA User:**
   - Email: `mfa-user@example.com`
   - MFA: Enabled (SMS or authenticator app)

3. **Social Login User:**
   - Google or other social provider

### Test Devices

- TV Device Name: "Living Room TV"
- Car Device Name: "Tesla Model S"
- Call Center Location: "Boston Office"

---

## Reporting Issues

If you find bugs during testing:

1. Note the steps to reproduce
2. Capture screenshots or screen recordings
3. Check browser console for errors
4. Check network tab for failed requests
5. Include environment details (browser, OS, URL)
6. Create GitHub issue with details

---

## Success Criteria

All tests pass:
- ✅ 100% of authentication flows work end-to-end
- ✅ All API endpoints respond correctly
- ✅ Security measures in place and tested
- ✅ UI responsive on all screen sizes
- ✅ Performance metrics within acceptable range
- ✅ Error handling graceful and user-friendly
- ✅ Browser compatibility verified
- ✅ Production deployment successful

---

## Continuous Testing

For ongoing development:
1. Test each new feature before committing
2. Verify no regressions in existing features
3. Update this document with new test cases
4. Consider adding automated test suite
5. Monitor production logs for errors
6. Gather user feedback and address issues

**Happy Testing!**
