import { NextRequest, NextResponse } from 'next/server';

// Manual OAuth 2.0 implementation for Auth0 authentication
// Handles login, logout, callback, and user info endpoints

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  const { auth0: route } = await params;

  // Build the Auth0 URL
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const baseUrl = process.env.AUTH0_BASE_URL || request.nextUrl.origin;

  switch (route) {
    case 'login':
      const loginUrl = new URL(`https://${auth0Domain}/authorize`);
      loginUrl.searchParams.set('client_id', clientId!);
      loginUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback`);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('scope', process.env.NEXT_PUBLIC_AUTH0_SCOPE || 'openid profile email');
      if (process.env.NEXT_PUBLIC_AUTH0_AUDIENCE) {
        loginUrl.searchParams.set('audience', process.env.NEXT_PUBLIC_AUTH0_AUDIENCE);
      }
      return NextResponse.redirect(loginUrl);

    case 'logout':
      const logoutUrl = new URL(`https://${auth0Domain}/v2/logout`);
      logoutUrl.searchParams.set('client_id', clientId!);
      logoutUrl.searchParams.set('returnTo', baseUrl);

      const response = NextResponse.redirect(logoutUrl);
      // Clear the session cookie
      response.cookies.delete('appSession');
      return response;

    case 'callback':
      // Handle OAuth callback
      const code = request.nextUrl.searchParams.get('code');
      if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', baseUrl));
      }

      // Exchange code for tokens
      try {
        const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            code,
            redirect_uri: `${baseUrl}/api/auth/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const tokens = await tokenResponse.json();

        // Set session cookie
        const redirectResponse = NextResponse.redirect(new URL('/shop', baseUrl));
        redirectResponse.cookies.set('appSession', JSON.stringify(tokens), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return redirectResponse;
      } catch (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=callback_failed', baseUrl));
      }

    case 'me':
      // Return current user
      try {
        const sessionCookie = request.cookies.get('appSession');
        if (!sessionCookie) {
          return NextResponse.json({ user: null }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);

        // Decode ID token to get user info
        const idTokenParts = session.id_token.split('.');
        const payload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());

        return NextResponse.json({
          user: {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
          },
          accessToken: session.access_token,
        });
      } catch (error) {
        return NextResponse.json({ user: null }, { status: 401 });
      }

    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
