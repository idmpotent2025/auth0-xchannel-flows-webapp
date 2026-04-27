import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { deviceType, deviceName } = await request.json();

    if (!deviceType || !deviceName) {
      return NextResponse.json(
        { error: 'Device type and name are required' },
        { status: 400 }
      );
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
    const scope = process.env.NEXT_PUBLIC_AUTH0_SCOPE;

    if (!domain || !clientId) {
      return NextResponse.json(
        { error: 'Auth0 configuration is incomplete' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://${domain}/oauth/device/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        scope: scope || 'openid profile email offline_access',
        ...(audience && { audience }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Device flow initiation failed:', error);
      return NextResponse.json(
        { error: 'Failed to initiate device flow' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      device_code: data.device_code,
      user_code: data.user_code,
      verification_uri: data.verification_uri,
      verification_uri_complete: data.verification_uri_complete,
      expires_in: data.expires_in,
      interval: data.interval,
    });
  } catch (error) {
    console.error('Error in device flow initiation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
