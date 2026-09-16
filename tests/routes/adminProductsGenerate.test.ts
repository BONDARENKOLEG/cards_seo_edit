import { describe, it, expect, beforeEach } from 'vitest';

import { PRODUCT_LIMITS } from '@/helpers/productValidation';
import { resetDb, seedProduct } from '../dbUtils';
import { POST as generate } from '@/app/api/admin/products/[id]/generate/route';

// No GEMINI_API_KEY is set in .env.test, so this exercises the real
// route handler end-to-end against the mock content path — no external
// service or API key is needed to run this suite.

const call = (id: string) =>
  generate(
    new Request(`http://localhost/api/admin/products/${id}/generate`, {
      method: 'POST'
    }),
    { params: Promise.resolve({ id }) }
  );

describe('POST /api/admin/products/[id]/generate', () => {
  beforeEach(resetDb);

  it('returns a mocked suggestion within the editor limits', async () => {
    const product = await seedProduct({ title: 'Wireless Headphones' });

    const response = await call(product.id);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mocked).toBe(true);
    expect(body.description.length).toBeGreaterThan(0);
    expect(body.description.length).toBeLessThanOrEqual(
      PRODUCT_LIMITS.description
    );
    expect(body.seoTitle.length).toBeLessThanOrEqual(PRODUCT_LIMITS.seoTitle);
    expect(body.seoDescription.length).toBeLessThanOrEqual(
      PRODUCT_LIMITS.seoDescription
    );
  });

  it('404s for a nonexistent product id', async () => {
    const response = await call('does-not-exist');

    expect(response.status).toBe(404);
  });
});
