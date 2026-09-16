import { NextResponse, type NextRequest } from 'next/server';

import { prisma } from '@/prisma/client';
import { verifyToken, REFRESH_TOKEN_SECRET } from '@/helpers/jwt';
import { clearAuthCookies, REFRESH_TOKEN_COOKIE } from '@/helpers/cookies';

export const POST = async (request: NextRequest) => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    const payload = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET);

    if (payload) {
      await prisma.user
        .update({
          where: { id: payload.sub },
          data: { refreshTokenHash: null, refreshTokenExpiresAt: null }
        })
        .catch(() => {
          // Best-effort: user may already be gone — cookies still get cleared below.
        });
    }
  }

  return clearAuthCookies(NextResponse.json({ ok: true }));
};
