import { prisma } from '@/prisma/client';
import { hashPassword } from '@/helpers/passwords';
import { PRODUCT_STATUS } from '@/types/product.types';

export const resetDb = async () => {
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
};

export const seedProduct = (overrides: Partial<Parameters<typeof prisma.product.create>[0]['data']> = {}) =>
  prisma.product.create({
    data: {
      slug: 'test-product',
      title: 'Test product',
      attributes: [{ label: 'Color', value: 'Red' }],
      description: 'A test product description.',
      seoTitle: 'Test product SEO title',
      seoDescription: 'Test product SEO description.',
      status: PRODUCT_STATUS.DRAFT,
      ...overrides,
    },
  });

export const seedUser = async (
  email = 'admin@mail.com',
  password = '12345678'
) =>
  prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
