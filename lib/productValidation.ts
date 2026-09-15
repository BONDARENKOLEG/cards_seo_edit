import { z } from "zod";

import { PRODUCT_STATUS } from "@/types/product.types";

export const PRODUCT_LIMITS = {
  description: 1000,
  seoTitle: 60,
  seoDescription: 160,
};

export const productEditSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1)
    .max(PRODUCT_LIMITS.description),
  seoTitle: z.string().trim().min(1).max(PRODUCT_LIMITS.seoTitle),
  seoDescription: z
    .string()
    .trim()
    .min(1)
    .max(PRODUCT_LIMITS.seoDescription),
  status: z.nativeEnum(PRODUCT_STATUS),
});

export type ProductEditInput = z.infer<typeof productEditSchema>;
export type ProductEditField = keyof ProductEditInput;
