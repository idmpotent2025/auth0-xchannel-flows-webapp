import { initAuth0 } from '@auth0/nextjs-auth0';

export const auth0 = initAuth0({
  secret: process.env.AUTH0_SECRET,
  issuerBaseURL: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: process.env.NEXT_PUBLIC_AUTH0_SCOPE || 'openid profile email offline_access',
  },
  session: {
    rollingDuration: 86400, // 24 hours
    absoluteDuration: 604800, // 7 days
  },
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
});
