import { describe, it, expect } from 'vitest';

import {
  generateProductContent,
  isLlmMocked
} from '@/helpers/generateProductContent';
import { PRODUCT_LIMITS } from '@/helpers/productValidation';

const attributes = [
  { label: 'Color', value: 'Black' },
  { label: 'Battery life', value: '30 hours' }
];

describe('isLlmMocked', () => {
  it('is true when no GEMINI_API_KEY is configured (the test env)', () => {
    expect(isLlmMocked()).toBe(true);
  });
});

describe('generateProductContent (mock path)', () => {
  it('returns mocked: true when no API key is configured', async () => {
    const result = await generateProductContent(
      'Wireless Headphones',
      attributes
    );

    expect(result.mocked).toBe(true);
  });

  it('produces non-empty content for all three fields', async () => {
    const { content } = await generateProductContent(
      'Wireless Headphones',
      attributes
    );

    expect(content.description.length).toBeGreaterThan(0);
    expect(content.seoTitle.length).toBeGreaterThan(0);
    expect(content.seoDescription.length).toBeGreaterThan(0);
  });

  it('respects the editor character limits', async () => {
    const { content } = await generateProductContent(
      'A Very Long Product Name That Keeps Going And Going',
      attributes
    );

    expect(content.description.length).toBeLessThanOrEqual(
      PRODUCT_LIMITS.description
    );
    expect(content.seoTitle.length).toBeLessThanOrEqual(
      PRODUCT_LIMITS.seoTitle
    );
    expect(content.seoDescription.length).toBeLessThanOrEqual(
      PRODUCT_LIMITS.seoDescription
    );
  });

  it('writes the suggestion in Ukrainian (contains Cyrillic characters)', async () => {
    const { content } = await generateProductContent(
      'Wireless Headphones',
      attributes
    );

    expect(content.description).toMatch(/[а-яіїєґ]/i);
  });

  it('still produces valid content with no attributes', async () => {
    const { content } = await generateProductContent('Wireless Headphones', []);

    expect(content.description.length).toBeGreaterThan(0);
  });
});
