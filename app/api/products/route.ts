import { NextResponse } from "next/server";

import { getPublishedProducts } from "@/api/getProducts";

export const GET = async () => {
  const products = await getPublishedProducts();
  return NextResponse.json(products);
};
