import { NextRequest, NextResponse } from 'next/server';

const MAX_POLL_COUNT = 60; // 5 minutes with 5-second interval

export async function POST(request: NextRequest) {
  try {
    const { authRequestId, pollCount } = await request.json();

    if (!authRequestId) {
      return NextResponse.json(
        { error: 'Auth request ID is required' },
        { status: 400 }
      );
    }

    if (pollCount >= MAX_POLL_COUNT) {
      return NextResponse.json({
        status: 'expired',
        message: 'Polling timeout exceeded',
      });
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Auth0 configuration is incomplete' },
        { status: 500 }
      );
    }

    // Call Auth0 token endpoint with auth_req_id
    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:openid:params:grant-type:ciba',
        auth_req_id: authRequestId,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    // Handle different response codes
    if (response.ok) {
      // Success - user authenticated
      return NextResponse.json({
        status: 'authenticated',
        tokens: {
          access_token: data.access_token,
          id_token: data.id_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          token_type: data.token_type,
          scope: data.scope,
        },
      });
    }

    // Handle error cases
    const errorCode = data.error;

    switch (errorCode) {
      case 'authorization_pending':
        return NextResponse.json({
          status: 'pending',
          message: 'Authorization pending - waiting for user approval',
        });

      case 'slow_down':
        return NextResponse.json({
          status: 'pending',
          message: 'Slow down - increase polling interval',
          slow_down: true,
        });

      case 'expired_token':
        return NextResponse.json({
          status: 'expired',
          message: 'Authentication request has expired',
        });

      case 'access_denied':
        return NextResponse.json({
          status: 'denied',
          message: 'User denied the authentication request',
        });

      default:
        console.error('Unexpected error from Auth0:', data);
        return NextResponse.json({
          status: 'error',
          message: data.error_description || 'An error occurred during authentication',
        });
    }
  } catch (error) {
    console.error('Error in CIBA polling:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
