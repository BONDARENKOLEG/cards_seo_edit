export type ProductStatus = "draft" | "published";

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ProductStatus;
};
