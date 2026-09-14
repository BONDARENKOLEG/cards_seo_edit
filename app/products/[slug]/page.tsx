import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Typography } from "@/components/typography";
import { getPublishedProductBySlug } from "@/mocks/products";
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
      <Link href="/" className={styles.back}>
        <ArrowLeft />
        {backLabel}
      </Link>

      <Typography as="h1" variant="title">
        {product.title}
      </Typography>

      <section className={styles.section}>
        <Typography as="h2" variant="title">
          {characteristicsLabel}
        </Typography>
        <dl className={styles.attributesList}>
          {product.attributes.map((attribute) => (
            <div key={attribute.label} className={styles.attributeRow}>
              <dt className={styles.attributeLabel}>{attribute.label}</dt>
              <dd>{attribute.value}</dd>
            </div>
          ))}
        </dl>
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
