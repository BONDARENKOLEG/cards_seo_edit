import Link from "next/link";

import { styles } from "../products.styles";
import { filterLabels } from "../products.copy";

export const STATUS_FILTERS = ["all", "published", "draft"] as const;
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
            filter === "all"
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
