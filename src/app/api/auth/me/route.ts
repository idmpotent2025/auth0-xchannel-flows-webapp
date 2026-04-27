import { getSession, getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ user: null, accessToken: null }, { status: 401 });
    }

    const { accessToken } = await getAccessToken();

    return NextResponse.json({
      user: session.user,
      accessToken: accessToken || null,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ user: null, accessToken: null }, { status: 401 });
  }
}
