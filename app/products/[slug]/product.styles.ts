import { spacing } from '@/lib/spacing';
import { colors } from '@/lib/colors';

export const styles = {
  container: `mx-auto flex w-full max-w-3xl flex-col gap-6 px-${spacing.normal} py-${spacing.xl}`,
  section: 'flex flex-col gap-2',
  attributesList: 'flex flex-col gap-2',
  attributeRow:
    'flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm',
  attributeLabel: colors.mutedForeground,
  description: 'text-sm leading-relaxed'
};
