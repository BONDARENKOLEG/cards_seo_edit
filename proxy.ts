import { NextResponse, type NextRequest } from 'next/server';

import { verifyToken, ACCESS_TOKEN_SECRET } from '@/helpers/jwt';
import { ACCESS_TOKEN_COOKIE } from '@/helpers/cookies';

const LOGIN_PATH = '/admin/login';
const ADMIN_HOME_PATH = '/admin/products';

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const payload = accessToken
    ? await verifyToken(accessToken, ACCESS_TOKEN_SECRET)
    : null;
  const isAuthenticated = Boolean(payload);

  if (pathname === LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
};

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
