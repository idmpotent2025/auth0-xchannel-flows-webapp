import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);

  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 3) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, deviceInfo } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token is required' },
        { status: 400 }
      );
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Auth0 configuration is incomplete' },
        { status: 500 }
      );
    }

    try {
      const JWKS = jose.createRemoteJWKSet(
        new URL(`https://${domain}/.well-known/jwks.json`)
      );

      const { payload } = await jose.jwtVerify(sessionToken, JWKS, {
        issuer: `https://${domain}/`,
        audience: [clientId, `https://${domain}/userinfo`],
      });

      const userId = payload.sub as string;
      if (!checkRateLimit(userId)) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          sub: payload.sub,
          name: payload.name,
          email: payload.email,
          email_verified: payload.email_verified,
          picture: payload.picture,
        },
        message: 'Token exchange successful',
        redirectUrl: '/shop',
      });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);

      if (jwtError instanceof jose.errors.JWTExpired) {
        return NextResponse.json(
          { success: false, error: 'Session token has expired' },
          { status: 401 }
        );
      }

      if (jwtError instanceof jose.errors.JWTClaimValidationFailed) {
        return NextResponse.json(
          { success: false, error: 'Invalid token claims' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Invalid session token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in token exchange:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
