import { NextResponse, type NextRequest } from 'next/server';

import { rotateSession } from '@/helpers/refreshSession';
import {
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE
} from '@/helpers/cookies';

export const POST = async (request: NextRequest) => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return clearAuthCookies(
      NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    );
  }

  const rotated = await rotateSession(refreshToken);

  if (!rotated) {
    return clearAuthCookies(
      NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    );
  }

  const response = NextResponse.json({ ok: true });
  return setAuthCookies(response, rotated);
};
