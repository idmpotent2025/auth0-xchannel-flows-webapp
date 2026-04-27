import { NextRequest, NextResponse } from 'next/server';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    const { userIdentifier, identifierType, deviceName, location } = await request.json();

    if (!userIdentifier || !identifierType) {
      return NextResponse.json(
        { error: 'User identifier and type are required' },
        { status: 400 }
      );
    }

    if (identifierType === 'email' && !validateEmail(userIdentifier)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (identifierType === 'phone' && !validatePhone(userIdentifier)) {
      return NextResponse.json(
        { error: 'Invalid phone format (use E.164: +1234567890)' },
        { status: 400 }
      );
    }

    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const scope = process.env.NEXT_PUBLIC_AUTH0_SCOPE;

    if (!domain || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Auth0 configuration is incomplete' },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get M2M token');
      return NextResponse.json(
        { error: 'Failed to authenticate with Auth0' },
        { status: 500 }
      );
    }

    const { access_token: m2mToken } = await tokenResponse.json();

    const bindingMessage = `${deviceName || 'Device'} from ${location || 'unknown location'}`;

    const cibaResponse = await fetch(`https://${domain}/bc-authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${m2mToken}`,
      },
      body: new URLSearchParams({
        client_id: clientId,
        scope: scope || 'openid profile email offline_access',
        login_hint: userIdentifier,
        binding_message: bindingMessage,
      }),
    });

    if (!cibaResponse.ok) {
      const errorText = await cibaResponse.text();
      console.error('CIBA initiation failed:', errorText);

      if (cibaResponse.status === 404) {
        return NextResponse.json(
          {
            error: 'CIBA not enabled',
            message: 'CIBA (Client-Initiated Backchannel Authentication) is not enabled on this Auth0 tenant. Please contact Auth0 support to enable this feature.'
          },
          { status: 501 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to initiate CIBA flow', details: errorText },
        { status: cibaResponse.status }
      );
    }

    const data = await cibaResponse.json();

    return NextResponse.json({
      auth_req_id: data.auth_req_id,
      expires_in: data.expires_in,
      interval: data.interval || 5,
    });
  } catch (error) {
    console.error('Error in CIBA initiation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
