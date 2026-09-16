import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const styles = {
  link: cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start')
};

type BackButtonProps = {
  href: string;
  label: string;
};

export const BackButton = ({ href, label }: BackButtonProps) => {
  return (
    <Link href={href} className={styles.link}>
      <ArrowLeft />
      {label}
    </Link>
  );
};
