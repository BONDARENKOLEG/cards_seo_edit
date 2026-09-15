import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PRODUCT_STATUS } from "../types/product.types";
import { DATABASE_URL } from "./env";

const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
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
    status: PRODUCT_STATUS.PUBLISHED,
  },
  {
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
    status: PRODUCT_STATUS.PUBLISHED,
  },
  {
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
    status: PRODUCT_STATUS.DRAFT,
  },
];

const main = async () => {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
