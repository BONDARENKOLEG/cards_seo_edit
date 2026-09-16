import { prisma } from '@/prisma/client';
import {
  signToken,
  verifyToken,
  hashRefreshToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} from '@/helpers/jwt';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_MAX_AGE_SECONDS
} from '@/constants';

export type RotatedTokens = {
  accessToken: string;
  refreshToken: string;
};

export const rotateSession = async (
  refreshToken: string
): Promise<RotatedTokens | null> => {
  const payload = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  const isValid =
    user &&
    user.refreshTokenHash === hashRefreshToken(refreshToken) &&
    user.refreshTokenExpiresAt &&
    user.refreshTokenExpiresAt.getTime() > Date.now();

  if (!isValid) {
    return null;
  }

  const newAccessToken = await signToken(
    user.id,
    ACCESS_TOKEN_TTL,
    ACCESS_TOKEN_SECRET
  );

  const newRefreshToken = await signToken(
    user.id,
    REFRESH_TOKEN_TTL,
    REFRESH_TOKEN_SECRET
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshTokenHash: hashRefreshToken(newRefreshToken),
      refreshTokenExpiresAt: new Date(
        Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000
      )
    }
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
