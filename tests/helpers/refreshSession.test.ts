import { describe, it, expect, beforeEach } from 'vitest';

import { prisma } from '@/prisma/client';
import {
  signToken,
  hashRefreshToken,
  REFRESH_TOKEN_SECRET
} from '@/helpers/jwt';
import { rotateSession } from '@/helpers/refreshSession';
import { REFRESH_TOKEN_TTL } from '@/constants';
import { resetDb, seedUser } from '../dbUtils';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('rotateSession', () => {
  beforeEach(resetDb);

  it('rotates a valid refresh token and persists the new hash', async () => {
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

    const result = await rotateSession(refreshToken);

    expect(result).not.toBeNull();
    expect(result!.accessToken).toEqual(expect.any(String));
    expect(result!.refreshToken).not.toBe(refreshToken);

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id }
    });
    expect(updatedUser.refreshTokenHash).toBe(
      hashRefreshToken(result!.refreshToken)
    );
  });

  it('invalidates the old refresh token after rotation', async () => {
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

    await rotateSession(refreshToken);
    const secondAttempt = await rotateSession(refreshToken);

    expect(secondAttempt).toBeNull();
  });

  it('rejects a refresh token whose stored expiry is in the past', async () => {
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
        refreshTokenExpiresAt: new Date(Date.now() - DAY_MS)
      }
    });

    const result = await rotateSession(refreshToken);

    expect(result).toBeNull();
  });

  it('rejects a refresh token that does not match the stored hash', async () => {
    const user = await seedUser();
    const refreshToken = await signToken(
      user.id,
      REFRESH_TOKEN_TTL,
      REFRESH_TOKEN_SECRET
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: hashRefreshToken('some-other-token'),
        refreshTokenExpiresAt: new Date(Date.now() + DAY_MS)
      }
    });

    const result = await rotateSession(refreshToken);

    expect(result).toBeNull();
  });

  it('rejects a refresh token for a user that no longer exists', async () => {
    const refreshToken = await signToken(
      'nonexistent-user-id',
      REFRESH_TOKEN_TTL,
      REFRESH_TOKEN_SECRET
    );

    const result = await rotateSession(refreshToken);

    expect(result).toBeNull();
  });

  it('rejects a structurally invalid token', async () => {
    const result = await rotateSession('not-a-jwt');

    expect(result).toBeNull();
  });
});
