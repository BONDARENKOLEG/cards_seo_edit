import { NextResponse, type NextRequest } from 'next/server';

import { verifyToken, ACCESS_TOKEN_SECRET } from '@/helpers/jwt';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '@/helpers/cookies';
import { rotateSession, type RotatedTokens } from '@/helpers/refreshSession';
import { ROUTES } from '@/constants';

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const accessPayload = accessToken
    ? await verifyToken(accessToken, ACCESS_TOKEN_SECRET)
    : null;

  let refreshedTokens: RotatedTokens | null = null;

  if (!accessPayload) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      refreshedTokens = await rotateSession(refreshToken);
    }
  }

  const isAuthenticated = Boolean(accessPayload) || Boolean(refreshedTokens);

  const withRefreshedCookies = (response: NextResponse) =>
    refreshedTokens ? setAuthCookies(response, refreshedTokens) : response;

  if (pathname === ROUTES.LOGIN) {
    if (isAuthenticated) {
      return withRefreshedCookies(
        NextResponse.redirect(new URL(ROUTES.ADMIN_HOME, request.url))
      );
    }
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return withRefreshedCookies(NextResponse.next());
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
};

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
