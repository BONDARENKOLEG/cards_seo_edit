import { NextResponse } from "next/server";

import { getPublishedProductBySlug } from "@/api/getProducts";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export const GET = async (_request: Request, { params }: RouteParams) => {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
};
