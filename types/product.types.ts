export type ProductStatus = "draft" | "published";

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
  status: ProductStatus;
};
