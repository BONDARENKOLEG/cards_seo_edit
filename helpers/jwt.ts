import { createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '@/api/auth/env';

export const ACCESS_TOKEN_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);
export const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  JWT_REFRESH_SECRET
);

export type TokenPayload = {
  sub: string;
};

export const signToken = (userId: string, ttl: string, secret: Uint8Array) =>
  new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);

export const verifyToken = async (
  token: string,
  secret: Uint8Array
): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (typeof payload.sub !== 'string') return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
};

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
