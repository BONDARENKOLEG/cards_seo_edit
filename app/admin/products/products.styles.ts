import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export const styles = {
  container: 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-16',
  filters: 'flex items-center gap-2',
  filterLink: (isActive: boolean) =>
    cn(
      buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' })
    ),
  actionsCell: 'text-right',
  editLink: cn(buttonVariants({ variant: 'outline', size: 'sm' }))
};
