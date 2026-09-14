import type { Product } from "@/types/product.types";
import type { ProductEditInput } from "@/lib/productValidation";

export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "wireless-headphones",
    title: "Wireless Headphones",
    attributes: [
      { label: "Color", value: "Black" },
      { label: "Battery life", value: "30 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
    ],
    description:
      "Over-ear wireless headphones with active noise cancellation and a 30-hour battery life.",
    seoTitle: "Wireless Headphones — Product Content Studio",
    seoDescription:
      "Over-ear wireless headphones with active noise cancellation and a 30-hour battery life.",
    status: "published",
  },
  {
    id: "2",
    slug: "ceramic-coffee-mug",
    title: "Ceramic Coffee Mug",
    attributes: [
      { label: "Capacity", value: "350 ml" },
      { label: "Material", value: "Ceramic" },
      { label: "Dishwasher safe", value: "Yes" },
    ],
    description:
      "Hand-glazed 350ml ceramic mug, safe for both dishwasher and microwave use.",
    seoTitle: "Ceramic Coffee Mug — Product Content Studio",
    seoDescription:
      "Hand-glazed 350ml ceramic mug, safe for both dishwasher and microwave use.",
    status: "published",
  },
  {
    id: "3",
    slug: "trail-running-shoes",
    title: "Trail Running Shoes",
    attributes: [
      { label: "Size range", value: "38–46" },
      { label: "Weight", value: "290 g" },
      { label: "Sole", value: "Reinforced grip" },
    ],
    description:
      "Lightweight trail running shoes with a reinforced grip sole for uneven terrain.",
    seoTitle: "Trail Running Shoes — Product Content Studio",
    seoDescription:
      "Lightweight trail running shoes with a reinforced grip sole for uneven terrain.",
    status: "draft",
  },
];

export const getPublishedProducts = () =>
  mockProducts.filter((product) => product.status === "published");

export const getPublishedProductBySlug = (slug: string) =>
  getPublishedProducts().find((product) => product.slug === slug);

export const getProductById = (id: string) =>
  mockProducts.find((product) => product.id === id);

// Simulates a REST API round trip against the in-memory mock store; swap
// for a real `fetch("/api/admin/products/:id")` call once the backend exists.
export const saveProductEdits = async (
  id: string,
  data: ProductEditInput,
): Promise<Product> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const product = getProductById(id);

  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }

  product.description = data.description;
  product.seoTitle = data.seoTitle;
  product.seoDescription = data.seoDescription;
  product.status = data.status;

  return product;
};
