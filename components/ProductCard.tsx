import Link from 'next/link';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { copy } from '@/locale';
import type { Product } from '@/types/product.types';

const viewDetailsLabel = copy.productCard.viewDetails;

const styles = {
  description: 'line-clamp-3',
  footer: 'justify-end',
  link: cn(buttonVariants({ variant: 'outline', size: 'sm' }))
};

export const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
        <CardDescription className={styles.description}>
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className={styles.footer}>
        <Link href={`/products/${product.slug}`} className={styles.link}>
          {viewDetailsLabel}
        </Link>
      </CardFooter>
    </Card>
  );
};
