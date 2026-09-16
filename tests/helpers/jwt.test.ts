import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

import {
  signToken,
  verifyToken,
  hashRefreshToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '@/helpers/jwt';

describe('signToken / verifyToken', () => {
  it('round-trips a valid token', async () => {
    const token = await signToken('user-1', '1h', ACCESS_TOKEN_SECRET);
    const payload = await verifyToken(token, ACCESS_TOKEN_SECRET);

    expect(payload).toEqual({ sub: 'user-1' });
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signToken('user-1', '1h', ACCESS_TOKEN_SECRET);
    const payload = await verifyToken(token, REFRESH_TOKEN_SECRET);

    expect(payload).toBeNull();
  });

  it('rejects an expired token', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiredToken = await new SignJWT({ sub: 'user-1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(nowSeconds - 100)
      .setExpirationTime(nowSeconds - 50)
      .sign(ACCESS_TOKEN_SECRET);

    const payload = await verifyToken(expiredToken, ACCESS_TOKEN_SECRET);

    expect(payload).toBeNull();
  });

  it('rejects garbage input', async () => {
    const payload = await verifyToken('not-a-jwt', ACCESS_TOKEN_SECRET);

    expect(payload).toBeNull();
  });
});

describe('hashRefreshToken', () => {
  it('is deterministic', () => {
    expect(hashRefreshToken('abc')).toBe(hashRefreshToken('abc'));
  });

  it('produces a 64-char hex sha256 digest', () => {
    expect(hashRefreshToken('abc')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('differs for different inputs', () => {
    expect(hashRefreshToken('abc')).not.toBe(hashRefreshToken('abd'));
  });
});
