import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import type { Product, ProductStatus } from "@/types/product.types";
import { styles } from "../products.styles";
import { editLabel, statusLabels } from "../products.copy";

const statusVariant = (status: ProductStatus) =>
  status === "published" ? "default" : "secondary";

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
