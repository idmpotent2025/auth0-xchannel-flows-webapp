import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest, endpoint: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `${ip}:${endpoint}`;
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for device flow polling
  if (pathname === '/api/device-flow/poll') {
    const key = getRateLimitKey(request, 'device-poll');
    const allowed = checkRateLimit(key, 12, 60000); // 12 requests per minute (5 sec interval)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
  }

  // Rate limiting for CIBA polling
  if (pathname === '/api/ciba/poll') {
    const key = getRateLimitKey(request, 'ciba-poll');
    const allowed = checkRateLimit(key, 12, 60000); // 12 requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
  }

  // Rate limiting for token exchange
  if (pathname === '/api/native2web/exchange') {
    const key = getRateLimitKey(request, 'token-exchange');
    const allowed = checkRateLimit(key, 3, 60000); // 3 requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Rate limiting for device flow initiation
  if (pathname === '/api/device-flow/initiate' || pathname === '/api/ciba/initiate') {
    const key = getRateLimitKey(request, pathname);
    const allowed = checkRateLimit(key, 5, 300000); // 5 requests per 5 minutes

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/device-flow/:path*',
    '/api/ciba/:path*',
    '/api/native2web/:path*',
  ],
};
