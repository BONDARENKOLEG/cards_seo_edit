import { describe, it, expect } from 'vitest';

import { productEditSchema, PRODUCT_LIMITS } from '@/helpers/productValidation';
import { PRODUCT_STATUS } from '@/types/product.types';

const validInput = {
  description: 'A valid description.',
  seoTitle: 'A valid SEO title',
  seoDescription: 'A valid SEO description.',
  status: PRODUCT_STATUS.DRAFT,
};

describe('productEditSchema', () => {
  it('accepts valid input', () => {
    expect(productEditSchema.safeParse(validInput).success).toBe(true);
  });

  it.each(['description', 'seoTitle', 'seoDescription'] as const)(
    'rejects an empty %s',
    (field) => {
      const result = productEditSchema.safeParse({ ...validInput, [field]: '' });

      expect(result.success).toBe(false);
    }
  );

  it.each(['description', 'seoTitle', 'seoDescription'] as const)(
    'accepts %s exactly at its limit',
    (field) => {
      const result = productEditSchema.safeParse({
        ...validInput,
        [field]: 'a'.repeat(PRODUCT_LIMITS[field]),
      });

      expect(result.success).toBe(true);
    }
  );

  it.each(['description', 'seoTitle', 'seoDescription'] as const)(
    'rejects %s one character over its limit',
    (field) => {
      const result = productEditSchema.safeParse({
        ...validInput,
        [field]: 'a'.repeat(PRODUCT_LIMITS[field] + 1),
      });

      expect(result.success).toBe(false);
    }
  );

  it('rejects an invalid status value', () => {
    const result = productEditSchema.safeParse({ ...validInput, status: 'archived' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing field', () => {
    const { status, ...withoutStatus } = validInput;
    void status;
    const result = productEditSchema.safeParse(withoutStatus);

    expect(result.success).toBe(false);
  });
});
