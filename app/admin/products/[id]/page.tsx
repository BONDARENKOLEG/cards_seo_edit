import { notFound } from "next/navigation";

import { Typography } from "@/components/Typography";
import { BackButton } from "@/components/BackButton";
import { getProductById } from "@/api/products";
import { ProductEditorForm } from "./components/ProductEditorForm";
import { styles } from "./editor.styles";
import {
  backLabel,
  characteristicsLabel,
  readOnlyNoticeLabel,
} from "./editor.copy";

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.container}>
      <BackButton href="/admin/products" label={backLabel} />

      <Typography as="h1" variant="title">
        {product.title}
      </Typography>
      <Typography as="p" className={styles.readOnlyNotice}>
        {readOnlyNoticeLabel}
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

      <ProductEditorForm product={product} />
    </main>
  );
};

export default AdminProductEditPage;
