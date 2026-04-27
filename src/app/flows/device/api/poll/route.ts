import { NextRequest, NextResponse } from 'next/server';

const MAX_POLL_COUNT = 120;

export async function POST(request: NextRequest) {
  try {
    const { device_code, pollCount } = await request.json();

    if (!device_code) {
      return NextResponse.json(
        { error: 'Device code is required' },
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

    if (!domain || !clientId) {
      return NextResponse.json(
        { error: 'Auth0 configuration is incomplete' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: device_code,
        client_id: clientId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
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

    const errorCode = data.error;

    switch (errorCode) {
      case 'authorization_pending':
        return NextResponse.json({
          status: 'pending',
          message: 'Authorization pending - user has not completed authentication',
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
          message: 'Device code has expired',
        });

      case 'access_denied':
        return NextResponse.json({
          status: 'denied',
          message: 'User denied authorization',
        });

      default:
        console.error('Unexpected error from Auth0:', data);
        return NextResponse.json({
          status: 'error',
          message: data.error_description || 'An error occurred during authentication',
        });
    }
  } catch (error) {
    console.error('Error in device flow polling:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
