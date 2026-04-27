import * as jose from 'jose';

export interface JWTVerifyOptions {
  domain: string;
  clientId: string;
  audience?: string[];
}

export async function verifyAuth0JWT(
  token: string,
  options: JWTVerifyOptions
): Promise<jose.JWTVerifyResult> {
  const JWKS = jose.createRemoteJWKSet(
    new URL(`https://${options.domain}/.well-known/jwks.json`)
  );

  const audience = options.audience || [
    options.clientId,
    `https://${options.domain}/userinfo`,
  ];

  return await jose.jwtVerify(token, JWKS, {
    issuer: `https://${options.domain}/`,
    audience,
  });
}

export function isJWTExpired(token: string): boolean {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function decodeJWTPayload(token: string): jose.JWTPayload | null {
  try {
    return jose.decodeJwt(token);
  } catch {
    return null;
  }
}
