import type { ProductEditInput } from "@/lib/productValidation";

export const patchProduct = (id: string, data: ProductEditInput) => {
  return fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
