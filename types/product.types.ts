export enum PRODUCT_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export type ProductAttribute = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  attributes: ProductAttribute[];
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: PRODUCT_STATUS;
};
