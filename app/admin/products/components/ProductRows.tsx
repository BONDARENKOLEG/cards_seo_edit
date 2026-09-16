import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { PRODUCT_STATUS, type Product } from '@/types/product.types';
import { styles } from '../products.styles';
import { editLabel, statusLabels } from '../products.copy';

const statusVariant = (status: PRODUCT_STATUS) =>
  status === PRODUCT_STATUS.PUBLISHED ? 'default' : 'secondary';

type ProductRowsProps = {
  products: Product[];
};

export const ProductRows = ({ products }: ProductRowsProps) => {
  return (
    <>
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell>{product.title}</TableCell>
          <TableCell>
            <Badge variant={statusVariant(product.status)}>
              {statusLabels[product.status]}
            </Badge>
          </TableCell>
          <TableCell className={styles.actionsCell}>
            <Link
              href={`/admin/products/${product.id}`}
              className={styles.editLink}
            >
              {editLabel}
            </Link>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
