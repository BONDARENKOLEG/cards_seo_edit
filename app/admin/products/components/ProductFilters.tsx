import Link from "next/link";

import { PRODUCT_STATUS } from "@/types/product.types";
import { styles } from "../products.styles";
import { filterLabels } from "../products.copy";

export enum PRODUCT_FILTER {
  ALL = "all",
}

export const STATUS_FILTERS = [
  PRODUCT_FILTER.ALL,
  PRODUCT_STATUS.PUBLISHED,
  PRODUCT_STATUS.DRAFT,
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

type ProductFiltersProps = {
  activeFilter: StatusFilter;
};

export const ProductFilters = ({ activeFilter }: ProductFiltersProps) => {
  return (
    <div className={styles.filters}>
      {STATUS_FILTERS.map((filter) => (
        <Link
          key={filter}
          href={
            filter === PRODUCT_FILTER.ALL
              ? "/admin/products"
              : `/admin/products?status=${filter}`
          }
          aria-current={filter === activeFilter ? "page" : undefined}
          className={styles.filterLink(filter === activeFilter)}
        >
          {filterLabels[filter]}
        </Link>
      ))}
    </div>
  );
};
