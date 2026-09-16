import { NextResponse } from 'next/server';
import { ApiError } from '@google/genai';

import { prisma } from '@/prisma/client';
import { generateProductContent } from '@/helpers/generateProductContent';
import type { ProductAttribute } from '@/types/product.types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const POST = async (_request: Request, { params }: RouteParams) => {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const { content, mocked } = await generateProductContent(
      product.title,
      product.attributes as ProductAttribute[]
    );

    return NextResponse.json({ ...content, mocked });
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return NextResponse.json(
        {
          error: 'The AI service is rate-limited right now. Try again shortly.'
        },
        { status: 429 }
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: 'The AI service returned an error. Try again shortly.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Could not generate a suggestion. Try again.' },
      { status: 502 }
    );
  }
};
