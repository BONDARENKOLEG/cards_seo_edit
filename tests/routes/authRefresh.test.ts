import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { prisma } from '@/prisma/client';
import {
  signToken,
  hashRefreshToken,
  REFRESH_TOKEN_SECRET,
} from '@/helpers/jwt';
import { REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE } from '@/helpers/cookies';
import { REFRESH_TOKEN_TTL } from '@/constants';
import { resetDb, seedUser } from '../dbUtils';
import { POST as refresh } from '@/app/api/auth/refresh/route';

const DAY_MS = 24 * 60 * 60 * 1000;

const callWithCookie = (cookieValue: string | undefined) =>
  refresh(
    new NextRequest('http://localhost/api/auth/refresh', {
      method: 'POST',
      headers: cookieValue
        ? { cookie: `${REFRESH_TOKEN_COOKIE}=${cookieValue}` }
        : undefined,
    })
  );

describe('POST /api/auth/refresh', () => {
  beforeEach(resetDb);

  it('rotates a valid refresh token and sets new cookies', async () => {
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
        refreshTokenExpiresAt: new Date(Date.now() + DAY_MS),
      },
    });

    const response = await callWithCookie(refreshToken);

    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(ACCESS_TOKEN_COOKIE);
    expect(setCookie).toContain(REFRESH_TOKEN_COOKIE);
  });

  it('rejects a missing refresh cookie', async () => {
    const response = await callWithCookie(undefined);

    expect(response.status).toBe(401);
  });

  it('rejects an invalid/expired refresh token and clears cookies', async () => {
    const response = await callWithCookie('not-a-valid-token');

    expect(response.status).toBe(401);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${REFRESH_TOKEN_COOKIE}=;`);
  });

  it('rejects a refresh token that was already rotated (reuse)', async () => {
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
        refreshTokenExpiresAt: new Date(Date.now() + DAY_MS),
      },
    });

    await callWithCookie(refreshToken);
    const secondResponse = await callWithCookie(refreshToken);

    expect(secondResponse.status).toBe(401);
  });
});
