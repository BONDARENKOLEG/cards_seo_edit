import { describe, it, expect, beforeEach } from 'vitest';

import { PRODUCT_STATUS } from '@/types/product.types';
import { resetDb, seedProduct } from '../dbUtils';
import { GET as getProducts } from '@/app/api/products/route';
import { GET as getProductBySlug } from '@/app/api/products/[slug]/route';

describe('GET /api/products', () => {
  beforeEach(resetDb);

  it('only returns published products', async () => {
    await seedProduct({ slug: 'draft-1', status: PRODUCT_STATUS.DRAFT });
    await seedProduct({
      slug: 'published-1',
      status: PRODUCT_STATUS.PUBLISHED
    });

    const response = await getProducts();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe('published-1');
  });
});

describe('GET /api/products/[slug]', () => {
  beforeEach(resetDb);

  const call = (slug: string) =>
    getProductBySlug(new Request(`http://localhost/api/products/${slug}`), {
      params: Promise.resolve({ slug })
    });

  it('returns a published product', async () => {
    await seedProduct({
      slug: 'published-1',
      status: PRODUCT_STATUS.PUBLISHED
    });

    const response = await call('published-1');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slug).toBe('published-1');
  });

  it('404s for a draft product (no direct-URL leak)', async () => {
    await seedProduct({ slug: 'draft-1', status: PRODUCT_STATUS.DRAFT });

    const response = await call('draft-1');

    expect(response.status).toBe(404);
  });

  it('404s for a nonexistent slug', async () => {
    const response = await call('does-not-exist');

    expect(response.status).toBe(404);
  });
});
