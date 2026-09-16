import { prisma } from '@/prisma/client';
import {
  PRODUCT_STATUS,
  type Product,
  type ProductAttribute
} from '@/types/product.types';

enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc'
}

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  attributes: unknown;
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
};

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  attributes: row.attributes as ProductAttribute[],
  description: row.description,
  seoTitle: row.seoTitle,
  seoDescription: row.seoDescription,
  status: row.status as PRODUCT_STATUS
});

export const getPublishedProducts = async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { status: PRODUCT_STATUS.PUBLISHED },
    orderBy: { createdAt: SORT_ORDER.ASC }
  });
  return rows.map(mapProduct);
};

export const getPublishedProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  const row = await prisma.product.findFirst({
    where: { slug, status: PRODUCT_STATUS.PUBLISHED }
  });
  return row ? mapProduct(row) : null;
};

export const getAllProducts = async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: SORT_ORDER.ASC }
  });
  return rows.map(mapProduct);
};

export const getProductsByStatus = async (
  status: PRODUCT_STATUS
): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { status },
    orderBy: { createdAt: SORT_ORDER.ASC }
  });
  return rows.map(mapProduct);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? mapProduct(row) : null;
};
