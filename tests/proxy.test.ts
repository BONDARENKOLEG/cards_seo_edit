import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { prisma } from '@/prisma/client';
import {
  signToken,
  hashRefreshToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} from '@/helpers/jwt';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/helpers/cookies';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '@/constants';
import { resetDb, seedUser } from './dbUtils';
import { proxy } from '@/proxy';

const DAY_MS = 24 * 60 * 60 * 1000;

const request = (path: string, cookies: Record<string, string> = {}) => {
  const req = new NextRequest(new URL(path, 'http://localhost'));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
};

describe('proxy — /api/admin/* (fetch-style consumers)', () => {
  beforeEach(resetDb);

  it('blocks a request with no cookies at all', async () => {
    const response = await proxy(request('/api/admin/products/1'));

    expect(response.status).toBe(401);
  });

  it('blocks a request with an invalid access token and no refresh cookie', async () => {
    const response = await proxy(
      request('/api/admin/products/1', { [ACCESS_TOKEN_COOKIE]: 'garbage' })
    );

    expect(response.status).toBe(401);
  });

  it('passes through a request with a valid access token', async () => {
    const accessToken = await signToken(
      'user-1',
      ACCESS_TOKEN_TTL,
      ACCESS_TOKEN_SECRET
    );

    const response = await proxy(
      request('/api/admin/products/1', { [ACCESS_TOKEN_COOKIE]: accessToken })
    );

    // NextResponse.next() reports as a 200 pass-through with no redirect.
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('silently rotates an expired access token when the refresh token is still valid', async () => {
    const user = await seedUser();
    const refreshToken = await signToken(
      user.id,
      REFRESH_TOKEN_TTL,
      REFRESH_TOKEN_SECRET
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: hashRefreshToken(refreshToken),
        refreshTokenExpiresAt: new Date(Date.now() + DAY_MS)
      }
    });

    const response = await proxy(
      request('/api/admin/products/1', {
        [ACCESS_TOKEN_COOKIE]: 'expired-or-garbage',
        [REFRESH_TOKEN_COOKIE]: refreshToken
      })
    );

    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(ACCESS_TOKEN_COOKIE);
  });
});

describe('proxy — /admin/* (page navigation)', () => {
  beforeEach(resetDb);

  it('redirects an unauthenticated request to the login page', async () => {
    const response = await proxy(request('/admin/products'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/login');
  });

  it('lets an unauthenticated request reach the login page itself', async () => {
    const response = await proxy(request('/admin/login'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects an authenticated request away from the login page', async () => {
    const accessToken = await signToken(
      'user-1',
      ACCESS_TOKEN_TTL,
      ACCESS_TOKEN_SECRET
    );

    const response = await proxy(
      request('/admin/login', { [ACCESS_TOKEN_COOKIE]: accessToken })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/products');
  });
});
