import { NextResponse } from 'next/server';

import { prisma } from '@/prisma/client';
import { loginSchema } from '@/api/auth/validation';
import { verifyPassword } from '@/helpers/passwords';
import {
  signToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '@/helpers/jwt';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from '@/constants';
import { hashRefreshToken } from '@/api/auth/refreshTokenHash';
import { setAuthCookies } from '@/helpers/cookies';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export const POST = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }

  const email = result.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MESSAGE },
      { status: 401 }
    );
  }

  const passwordMatches = await verifyPassword(
    result.data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return NextResponse.json(
      { error: INVALID_CREDENTIALS_MESSAGE },
      { status: 401 }
    );
  }

  const accessToken = await signToken(
    user.id,
    ACCESS_TOKEN_TTL,
    ACCESS_TOKEN_SECRET
  );
  const refreshToken = await signToken(
    user.id,
    REFRESH_TOKEN_TTL,
    REFRESH_TOKEN_SECRET
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshTokenHash: hashRefreshToken(refreshToken),
      refreshTokenExpiresAt: new Date(
        Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000
      ),
    },
  });

  const response = NextResponse.json({ email: user.email });

  return setAuthCookies(response, { accessToken, refreshToken });
};
