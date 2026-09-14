import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Typography } from "@/components/Typography";
import { BackButton } from "@/components/BackButton";
import { getPublishedProductBySlug } from "@/mocks/products";
import { ProductAttributes } from "./components/ProductAttributes";
import { styles } from "./product.styles";
import {
  backLabel,
  characteristicsLabel,
  descriptionLabel,
} from "./product.copy";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
  params,
}: ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const product = getPublishedProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle,
    description: product.seoDescription,
  };
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;
  const product = getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.container}>
      <BackButton href="/" label={backLabel} />

      <Typography as="h1" variant="title">
        {product.title}
      </Typography>

      <section className={styles.section}>
        <Typography as="h2" variant="title">
          {characteristicsLabel}
        </Typography>
        <ProductAttributes attributes={product.attributes} />
      </section>

      <section className={styles.section}>
        <Typography as="h2" variant="title">
          {descriptionLabel}
        </Typography>
        <Typography as="p" className={styles.description}>
          {product.description}
        </Typography>
      </section>
    </main>
  );
};

export default ProductPage;
