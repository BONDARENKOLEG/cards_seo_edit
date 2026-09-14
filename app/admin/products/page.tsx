import { Typography } from "@/components/Typography";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { mockProducts } from "@/mocks/products";
import { ProductFilters, STATUS_FILTERS, type StatusFilter } from "./components/ProductFilters";
import { ProductRows } from "./components/ProductRows";
import { styles } from "./products.styles";
import {
  titleLabel,
  nameColumnLabel,
  statusColumnLabel,
  actionsColumnLabel,
} from "./products.copy";

const parseStatusFilter = (status: string | undefined): StatusFilter =>
  STATUS_FILTERS.find((filter) => filter === status) ?? "all";

type AdminProductsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const AdminProductsPage = async ({ searchParams }: AdminProductsPageProps) => {
  const { status } = await searchParams;
  const activeFilter = parseStatusFilter(status);

  const products =
    activeFilter === "all"
      ? mockProducts
      : mockProducts.filter((product) => product.status === activeFilter);

  return (
    <main className={styles.container}>
      <Typography as="h1" variant="title">
        {titleLabel}
      </Typography>

      <ProductFilters activeFilter={activeFilter} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{nameColumnLabel}</TableHead>
            <TableHead>{statusColumnLabel}</TableHead>
            <TableHead className={styles.actionsCell}>
              {actionsColumnLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <ProductRows products={products} />
        </TableBody>
      </Table>
    </main>
  );
};

export default AdminProductsPage;
