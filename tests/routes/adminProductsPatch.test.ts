import { describe, it, expect, beforeEach, vi } from 'vitest';

import { prisma } from '@/prisma/client';
import { PRODUCT_STATUS } from '@/types/product.types';
import { resetDb, seedProduct } from '../dbUtils';

// revalidatePath needs a real Next.js request context that doesn't exist
// when calling the route handler directly in a test — not what's under
// test here (persistence/validation), so stub it out.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { PATCH } from '@/app/api/admin/products/[id]/route';

// proxy.ts is what actually authenticates these requests before they reach
// this handler (covered separately in tests/proxy.test.ts) — this file only
// checks the handler's own behavior: validation, persistence, and 404s.

const call = (id: string, body: unknown) =>
  PATCH(
    new Request(`http://localhost/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    { params: Promise.resolve({ id }) }
  );

const validPatch = {
  description: 'Updated description.',
  seoTitle: 'Updated SEO title',
  seoDescription: 'Updated SEO description.',
  status: PRODUCT_STATUS.PUBLISHED
};

describe('PATCH /api/admin/products/[id]', () => {
  beforeEach(resetDb);

  it('persists a valid update', async () => {
    const product = await seedProduct({ status: PRODUCT_STATUS.DRAFT });

    const response = await call(product.id, validPatch);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.description).toBe(validPatch.description);
    expect(body.status).toBe(PRODUCT_STATUS.PUBLISHED);

    const stored = await prisma.product.findUniqueOrThrow({
      where: { id: product.id }
    });
    expect(stored.description).toBe(validPatch.description);
  });

  it('rejects a description over the character limit and does not persist it', async () => {
    const product = await seedProduct();

    const response = await call(product.id, {
      ...validPatch,
      description: 'a'.repeat(1001)
    });

    expect(response.status).toBe(400);

    const stored = await prisma.product.findUniqueOrThrow({
      where: { id: product.id }
    });
    expect(stored.description).toBe(product.description);
  });

  it('rejects an empty required field', async () => {
    const product = await seedProduct();

    const response = await call(product.id, { ...validPatch, seoTitle: '' });

    expect(response.status).toBe(400);
  });

  it('rejects an invalid status value', async () => {
    const product = await seedProduct();

    const response = await call(product.id, {
      ...validPatch,
      status: 'archived'
    });

    expect(response.status).toBe(400);
  });

  it('404s for a nonexistent product id', async () => {
    const response = await call('does-not-exist', validPatch);

    expect(response.status).toBe(404);
  });

  it('does not allow changing the name/title via the editor payload', async () => {
    const product = await seedProduct({ title: 'Original title' });

    await call(product.id, { ...validPatch, title: 'Hacked title' });

    const stored = await prisma.product.findUniqueOrThrow({
      where: { id: product.id }
    });
    expect(stored.title).toBe('Original title');
  });
});
