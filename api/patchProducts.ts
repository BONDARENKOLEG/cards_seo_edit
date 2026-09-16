import type { ProductEditInput } from "@/helpers/productValidation";
import { authFetch } from "@/api/auth/authFetch";

export const patchProduct = (id: string, data: ProductEditInput) => {
  return authFetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
