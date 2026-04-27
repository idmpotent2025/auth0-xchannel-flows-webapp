# Deployment Guide

This guide will walk you through deploying the Auth0 Cross-Channel CIAM webapp to Vercel.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Auth0 account with tenant: `digitalkiosk.cic-demo-platform.auth0app.com`
3. Git repository (optional but recommended)

## Step 1: Create Auth0 Application

### 1.1 Create New Application

1. Navigate to Auth0 Dashboard: https://manage.auth0.com
2. Go to Applications → Create Application
3. Choose "Single Page Application"
4. Name: "Digital Kiosk Web Portal"
5. Click "Create"

### 1.2 Configure Application Settings

Navigate to the "Settings" tab and configure:

**Application URIs:**
- Allowed Callback URLs:
  ```
  http://localhost:3000/api/auth/callback
  https://YOUR_VERCEL_DOMAIN/api/auth/callback
  ```
- Allowed Logout URLs:
  ```
  http://localhost:3000
  https://YOUR_VERCEL_DOMAIN
  ```
- Allowed Web Origins:
  ```
  http://localhost:3000
  https://YOUR_VERCEL_DOMAIN
  ```

**Note:** Replace `YOUR_VERCEL_DOMAIN` with your actual Vercel domain after deployment.

### 1.3 Enable Grant Types

1. Go to "Advanced Settings" → "Grant Types"
2. Enable the following:
   - ✅ Authorization Code
   - ✅ Refresh Token
   - ✅ Device Code
3. Save changes

### 1.4 Enable Device Authorization Flow

1. In "Advanced Settings" → "Device Settings"
2. Set Device Code Expiration: 600 seconds (10 minutes)
3. Set Polling Interval: 5 seconds
4. Save changes

### 1.5 Enable CIBA (Optional - Requires Auth0 Support)

CIBA (Client-Initiated Backchannel Authentication) must be enabled by Auth0 support:

1. Contact Auth0 Support or your Customer Success Manager
2. Request CIBA enablement for your tenant
3. Once enabled, configure CIBA settings in the application

### 1.6 Save Credentials

Copy the following values (you'll need them for deployment):
- **Domain**: `digitalkiosk.cic-demo-platform.auth0app.com`
- **Client ID**: (from Settings tab)
- **Client Secret**: (from Settings tab - keep secure!)

## Step 2: Generate Auth0 Secret

The `AUTH0_SECRET` is used to encrypt session cookies. Generate it using:

```bash
openssl rand -hex 32
```

Save this value securely - you'll need it for environment variables.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure Project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --cache /tmp/npm-cache`

4. Add Environment Variables (see Step 4)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 4: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_AUTH0_DOMAIN` | `digitalkiosk.cic-demo-platform.auth0app.com` | Production, Preview, Development |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Your Auth0 Client ID | Production, Preview, Development |
| `AUTH0_CLIENT_SECRET` | Your Auth0 Client Secret | Production, Preview, Development |
| `AUTH0_SECRET` | Generated secret (from Step 2) | Production, Preview, Development |
| `AUTH0_BASE_URL` | `https://YOUR_VERCEL_DOMAIN` | Production |
| `AUTH0_BASE_URL` | `http://localhost:3000` | Development |
| `NEXT_PUBLIC_AUTH0_AUDIENCE` | `https://digitalkiosk.example.com/api` | Production, Preview, Development |
| `NEXT_PUBLIC_AUTH0_SCOPE` | `openid profile email offline_access` | Production, Preview, Development |

### Optional Variables

| Variable | Value | Default |
|----------|-------|---------|
| `DEVICE_FLOW_TIMEOUT` | `600` | 600 seconds |
| `DEVICE_FLOW_POLLING_INTERVAL` | `5` | 5 seconds |
| `CIBA_TIMEOUT` | `300` | 300 seconds |
| `CIBA_POLLING_INTERVAL` | `5` | 5 seconds |
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR_VERCEL_DOMAIN/api` | Auto-detected |

## Step 5: Update Auth0 with Production URLs

After deployment, update your Auth0 application:

1. Get your Vercel production URL (e.g., `https://your-app.vercel.app`)
2. In Auth0 Dashboard → Applications → Your App → Settings
3. Update URLs with production domain:
   - Allowed Callback URLs: Add `https://your-app.vercel.app/api/auth/callback`
   - Allowed Logout URLs: Add `https://your-app.vercel.app`
   - Allowed Web Origins: Add `https://your-app.vercel.app`
4. Save Changes

## Step 6: Verify Deployment

### Test Each Flow

1. **Universal Login**
   - Visit `https://your-app.vercel.app/login`
   - Click "Login with Auth0"
   - Authenticate and verify redirect to shop

2. **Device Authorization Flow (Smart TV)**
   - Visit `https://your-app.vercel.app/tv-device`
   - Click "Start Smart TV Authentication"
   - Open verification URL in another browser/device
   - Enter user code
   - Verify authentication completes

3. **Device Authorization Flow (Smart Car)**
   - Visit `https://your-app.vercel.app/car-device`
   - Follow same steps as Smart TV

4. **CIBA Push Flow**
   - Visit `https://your-app.vercel.app/call-center`
   - Enter email or phone
   - Click "Send Push Notification"
   - **Note:** Requires CIBA enabled and mobile app with push support

5. **Native-to-Web SSO**
   - From iOS ShoeStoreApp, tap "Continue to Web"
   - Verify token exchange and auto-login

6. **Product Catalog**
   - Visit `https://your-app.vercel.app/shop`
   - Verify all 4 categories load
   - Check all 24 products display correctly

## Step 7: Custom Domain (Optional)

### Add Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Auth0 URLs with custom domain
5. Update `AUTH0_BASE_URL` environment variable

## Troubleshooting

### Common Issues

**Issue: "Invalid state" error during login**
- **Solution:** Verify `AUTH0_SECRET` is set correctly and matches between all environments

**Issue: Callback URL mismatch**
- **Solution:** Ensure all callback URLs are added to Auth0 application settings

**Issue: Device flow not working**
- **Solution:** Verify Device Code grant type is enabled in Auth0 application

**Issue: CIBA not working**
- **Solution:** Contact Auth0 support to enable CIBA on your tenant

**Issue: Rate limiting errors**
- **Solution:** Middleware rate limits are working correctly. Wait before retrying.

**Issue: Session expires too quickly**
- **Solution:** Adjust session duration in `src/lib/auth/auth0.ts`

### Logs

View deployment logs:
```bash
vercel logs YOUR_DEPLOYMENT_URL
```

View function logs in Vercel Dashboard → Deployments → Functions

## Production Checklist

Before going live, verify:

- [ ] All environment variables configured in Vercel
- [ ] Auth0 callback URLs updated with production domain
- [ ] Auth0 grant types enabled (Authorization Code, Refresh Token, Device Code)
- [ ] Device Authorization Flow enabled and configured
- [ ] CIBA enabled (if using Call Center flow)
- [ ] Security headers configured (X-Frame-Options, CSP, etc.)
- [ ] Rate limiting implemented and tested
- [ ] Error pages (404, 500) render correctly
- [ ] All 5 authentication flows tested end-to-end
- [ ] Product catalog displays all products
- [ ] Mobile responsive design tested
- [ ] HTTPS enforced
- [ ] Session management working correctly
- [ ] Logout functionality working
- [ ] Analytics/monitoring configured (optional)

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:
1. Vercel Dashboard → Analytics
2. Enable Web Analytics
3. Add to your app (already included in Next.js 14)

### Error Tracking (Optional)

Consider integrating error tracking:
- Sentry: https://sentry.io
- LogRocket: https://logrocket.com
- Datadog: https://www.datadoghq.com

Add error tracking in `src/lib/utils/errorHandler.ts`

## Scaling Considerations

For production use:

1. **Rate Limiting**: Replace in-memory store with Redis
   - Use Vercel KV or external Redis
   - Update `src/middleware.ts`

2. **Session Storage**: Consider external session store
   - Redis for session data
   - Database for persistent sessions

3. **Caching**: Implement API response caching
   - Use Vercel Edge Cache
   - Add cache headers to API routes

4. **Database**: Add database for user preferences
   - Vercel Postgres
   - MongoDB Atlas
   - Supabase

## Support

- Auth0 Documentation: https://auth0.com/docs
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- GitHub Issues: [Your repository issues page]

## Security Notes

- Never commit `.env.local` or secrets to Git
- Use Vercel Secrets for sensitive values
- Rotate Auth0 Client Secret regularly
- Monitor Auth0 logs for suspicious activity
- Keep dependencies updated (`npm audit`)
- Review security headers periodically
- Use HTTPS only in production
- Implement CSP (Content Security Policy) for additional security

---

## Quick Deploy Command

For subsequent deployments:

```bash
# Production
vercel --prod

# Preview
vercel
```

## Rollback

If issues occur:

1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production
