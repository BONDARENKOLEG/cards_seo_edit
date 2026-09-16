import type { ProductAttribute } from '@/types/product.types';
import { styles } from '../product.styles';

type ProductAttributesProps = {
  attributes: ProductAttribute[];
};

export const ProductAttributes = ({ attributes }: ProductAttributesProps) => {
  return (
    <dl className={styles.attributesList}>
      {attributes.map((attribute) => (
        <div key={attribute.label} className={styles.attributeRow}>
          <dt className={styles.attributeLabel}>{attribute.label}</dt>
          <dd>{attribute.value}</dd>
        </div>
      ))}
    </dl>
  );
};
