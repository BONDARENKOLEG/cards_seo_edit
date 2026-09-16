'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  productEditSchema,
  PRODUCT_LIMITS,
  type ProductEditField
} from '@/helpers/productValidation';
import { PRODUCT_STATUS, type Product } from '@/types/product.types';
import { FormField } from './FormField';
import { patchProduct } from '@/api/patchProducts';
import { useEditorDirty } from '../EditorDirtyContext';
import { styles } from '../editor.styles';
import {
  fieldLabels,
  statusOptionLabels,
  saveLabel,
  savingLabel,
  saveErrorLabel,
  saveSuccessLabel,
  requiredValidationLabel,
  tooLongValidationLabel
} from '../editor.copy';

type SaveState = 'idle' | 'saving' | 'success' | 'error';
type FieldErrors = Partial<Record<ProductEditField, string>>;
type ZodIssue = { code: string; path: PropertyKey[] };

const mapIssuesToFieldErrors = (issues: ZodIssue[]): FieldErrors => {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0] as ProductEditField;
    errors[field] =
      issue.code === 'too_big'
        ? tooLongValidationLabel
        : requiredValidationLabel;
  }
  return errors;
};

export const ProductEditorForm = ({ product }: { product: Product }) => {
  const [description, setDescription] = useState(product.description);
  const [seoTitle, setSeoTitle] = useState(product.seoTitle);
  const [seoDescription, setSeoDescription] = useState(product.seoDescription);
  const [status, setStatus] = useState<PRODUCT_STATUS>(product.status);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedValues, setSavedValues] = useState({
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    status: product.status
  });
  const { setIsDirty } = useEditorDirty();

  const isDirty =
    description !== savedValues.description ||
    seoTitle !== savedValues.seoTitle ||
    seoDescription !== savedValues.seoDescription ||
    status !== savedValues.status;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = productEditSchema.safeParse({
      description,
      seoTitle,
      seoDescription,
      status
    });

    if (!result.success) {
      setFieldErrors(mapIssuesToFieldErrors(result.error.issues));
      setSaveState('idle');
      return;
    }

    setFieldErrors({});
    setSaveState('saving');

    try {
      const response = await patchProduct(product.id, result.data);

      if (!response.ok) {
        const body: { issues?: ZodIssue[] } = await response
          .json()
          .catch(() => ({}));

        if (body.issues) {
          setFieldErrors(mapIssuesToFieldErrors(body.issues));
          setSaveState('idle');
          return;
        }

        throw new Error(`Save failed with status ${response.status}`);
      }

      setSavedValues(result.data);
      setSaveState('success');
      toast.success(saveSuccessLabel);
    } catch {
      setSaveState('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField
        id="description"
        as="textarea"
        label={fieldLabels.description}
        value={description}
        onChange={setDescription}
        maxLength={PRODUCT_LIMITS.description}
        error={fieldErrors.description}
      />

      <FormField
        id="seoTitle"
        label={fieldLabels.seoTitle}
        value={seoTitle}
        onChange={setSeoTitle}
        maxLength={PRODUCT_LIMITS.seoTitle}
        error={fieldErrors.seoTitle}
      />

      <FormField
        id="seoDescription"
        as="textarea"
        label={fieldLabels.seoDescription}
        value={seoDescription}
        onChange={setSeoDescription}
        maxLength={PRODUCT_LIMITS.seoDescription}
        error={fieldErrors.seoDescription}
      />

      <div className={styles.field}>
        <Label htmlFor="status">{fieldLabels.status}</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as PRODUCT_STATUS)}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PRODUCT_STATUS.DRAFT}>
              {statusOptionLabels.draft}
            </SelectItem>
            <SelectItem value={PRODUCT_STATUS.PUBLISHED}>
              {statusOptionLabels.published}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={saveState === 'saving' || !isDirty}
          className={styles.submit}
        >
          {saveState === 'saving' ? savingLabel : saveLabel}
        </Button>
        {saveState === 'error' && (
          <span className={styles.statusMessage('error')}>
            {saveErrorLabel}
          </span>
        )}
      </div>
    </form>
  );
};
