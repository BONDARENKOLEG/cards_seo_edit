import { spacing } from '@/lib/spacing';
import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';

export const styles = {
  container: `mx-auto flex w-full max-w-3xl flex-col gap-6 px-${spacing.normal} py-${spacing.xl}`,
  section: 'flex flex-col gap-2',
  attributesList: 'flex flex-col gap-2',
  attributeRow:
    'flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm',
  attributeLabel: colors.mutedForeground,
  readOnlyNotice: cn('text-xs', colors.mutedForeground),
  form: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  fieldHeader: 'flex items-baseline justify-between gap-2',
  counter: cn('text-xs', colors.mutedForeground),
  counterInvalid: 'text-xs text-destructive',
  errorText: 'text-xs text-destructive',
  actions: 'flex items-center gap-3',
  submit: 'cursor-pointer',
  statusMessage: (state: 'success' | 'error') =>
    cn('text-sm', state === 'success' ? 'text-primary' : 'text-destructive'),
  generateButton: 'cursor-pointer',
  generatePreview:
    'flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-4',
  generatePreviewHeader: 'flex items-center justify-between gap-2',
  generatePreviewTitle: 'text-sm font-medium',
  generateMockedBadge: cn(
    'rounded-full border border-border px-2 py-0.5 text-xs',
    colors.mutedForeground
  ),
  generateField: 'flex flex-col gap-1',
  generateFieldLabel: cn('text-xs font-medium', colors.mutedForeground),
  generateFieldValue: 'text-sm whitespace-pre-wrap',
  generateActions: 'flex items-center gap-2',
  generateApply: 'cursor-pointer',
  generateDiscard: 'cursor-pointer'
};
