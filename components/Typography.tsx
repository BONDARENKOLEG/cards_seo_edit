import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { colors } from '@/lib/colors';

const typographyVariants = cva('', {
  variants: {
    variant: {
      title: 'text-2xl font-semibold tracking-tight',
      muted: colors.mutedForeground
    }
  },
  defaultVariants: {
    variant: 'title'
  }
});

type TypographyElement = 'h1' | 'h2' | 'h3' | 'p' | 'span';

type TypographyProps<T extends TypographyElement> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'className'
> &
  VariantProps<typeof typographyVariants> & {
    as?: T;
    className?: string;
  };

const Typography = <T extends TypographyElement = 'p'>({
  as,
  variant,
  className,
  ...props
}: TypographyProps<T>) => {
  const Component = (as ?? 'p') as React.ElementType;

  return (
    <Component
      data-slot="typography"
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
};

export { Typography, typographyVariants };
