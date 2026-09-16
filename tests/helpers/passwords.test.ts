import { describe, it, expect } from 'vitest';

import { hashPassword, verifyPassword } from '@/helpers/passwords';

describe('hashPassword / verifyPassword', () => {
  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('12345678');

    await expect(verifyPassword('12345678', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('12345678');

    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('does not store the password in plain text', async () => {
    const hash = await hashPassword('12345678');

    expect(hash).not.toBe('12345678');
  });
});
