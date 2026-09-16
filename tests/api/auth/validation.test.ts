import { describe, it, expect } from 'vitest';

import { loginSchema } from '@/api/auth/validation';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginSchema.safeParse({ email: 'admin@mail.com', password: '12345678' })
        .success
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: '12345678' })
        .success
    ).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(
      loginSchema.safeParse({ email: 'admin@mail.com', password: '' }).success
    ).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(loginSchema.safeParse({ password: '12345678' }).success).toBe(false);
  });
});
