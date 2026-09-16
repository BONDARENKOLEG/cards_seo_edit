import { describe, it, expect, beforeEach } from 'vitest';

import { prisma } from '@/prisma/client';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/helpers/cookies';
import { resetDb, seedUser } from '../dbUtils';
import { POST as login } from '@/app/api/auth/login/route';

const call = (body: unknown) =>
  login(
    new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );

describe('POST /api/auth/login', () => {
  beforeEach(resetDb);

  it('logs in with correct credentials and sets auth cookies', async () => {
    await seedUser('admin@mail.com', '12345678');

    const response = await call({
      email: 'admin@mail.com',
      password: '12345678'
    });

    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(ACCESS_TOKEN_COOKIE);
    expect(setCookie).toContain(REFRESH_TOKEN_COOKIE);
    expect(setCookie).toContain('HttpOnly');
  });

  it('persists the refresh token hash on the user row', async () => {
    const user = await seedUser('admin@mail.com', '12345678');

    await call({ email: 'admin@mail.com', password: '12345678' });

    const updated = await prisma.user.findUniqueOrThrow({
      where: { id: user.id }
    });
    expect(updated.refreshTokenHash).not.toBeNull();
    expect(updated.refreshTokenExpiresAt).not.toBeNull();
  });

  it('rejects a wrong password with a generic message', async () => {
    await seedUser('admin@mail.com', '12345678');

    const response = await call({
      email: 'admin@mail.com',
      password: 'wrong-password'
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('rejects an unknown email with the same generic message (no user enumeration)', async () => {
    const response = await call({
      email: 'nobody@mail.com',
      password: '12345678'
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('rejects a malformed body', async () => {
    const response = await call({ email: 'not-an-email' });

    expect(response.status).toBe(400);
  });

  it('never returns the password hash', async () => {
    await seedUser('admin@mail.com', '12345678');

    const response = await call({
      email: 'admin@mail.com',
      password: '12345678'
    });
    const body = await response.json();

    expect(JSON.stringify(body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });
});
