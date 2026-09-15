import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/prisma/client";
import { productEditSchema } from "@/lib/productValidation";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = productEditSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: result.data,
  });

  revalidatePath("/");
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);

  return NextResponse.json(updated);
};
