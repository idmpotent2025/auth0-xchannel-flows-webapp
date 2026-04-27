import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: {
    returnTo: '/shop',
    authorizationParams: {
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      scope: process.env.NEXT_PUBLIC_AUTH0_SCOPE,
    },
  },
});
