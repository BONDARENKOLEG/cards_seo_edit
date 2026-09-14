import type { Product } from "@/types/product.types";

export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "wireless-headphones",
    title: "Wireless Headphones",
    description:
      "Over-ear wireless headphones with active noise cancellation and a 30-hour battery life.",
    status: "published",
  },
  {
    id: "2",
    slug: "ceramic-coffee-mug",
    title: "Ceramic Coffee Mug",
    description:
      "Hand-glazed 350ml ceramic mug, safe for both dishwasher and microwave use.",
    status: "published",
  },
  {
    id: "3",
    slug: "trail-running-shoes",
    title: "Trail Running Shoes",
    description:
      "Lightweight trail running shoes with a reinforced grip sole for uneven terrain.",
    status: "draft",
  },
];
