'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { generateProductContent } from '@/api/generateProductContent';
import type { GeneratedContent } from '@/helpers/generateProductContent';
import { styles } from '../editor.styles';
import {
  fieldLabels,
  generateButtonLabel,
  generatingLabel,
  generateErrorLabel,
  generatePreviewTitleLabel,
  generateMockedNoticeLabel,
  applyLabel,
  discardLabel
} from '../editor.copy';

type GenerateState = 'idle' | 'generating' | 'preview' | 'error';

type GenerateSuggestionPanelProps = {
  productId: string;
  onApply: (content: GeneratedContent) => void;
};

export const GenerateSuggestionPanel = ({
  productId,
  onApply
}: GenerateSuggestionPanelProps) => {
  const [generateState, setGenerateState] = useState<GenerateState>('idle');
  const [suggestion, setSuggestion] = useState<GeneratedContent | null>(null);
  const [mocked, setMocked] = useState(false);

  const handleGenerate = async () => {
    setGenerateState('generating');

    try {
      const response = await generateProductContent(productId);
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          body.error ?? `Generation failed with status ${response.status}`
        );
      }

      const { mocked: isMocked, ...content } = body as GeneratedContent & {
        mocked: boolean;
      };

      setSuggestion(content);
      setMocked(isMocked);
      setGenerateState('preview');
    } catch {
      setGenerateState('error');
      toast.error(generateErrorLabel);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;

    onApply(suggestion);
    setSuggestion(null);
    setGenerateState('idle');
  };

  const handleDiscard = () => {
    setSuggestion(null);
    setGenerateState('idle');
  };

  return (
    <div className={styles.section}>
      <Button
        type="button"
        variant="outline"
        disabled={generateState === 'generating'}
        onClick={handleGenerate}
        className={styles.generateButton}
      >
        {generateState === 'generating' ? generatingLabel : generateButtonLabel}
      </Button>

      {generateState === 'preview' && suggestion && (
        <div className={styles.generatePreview}>
          <div className={styles.generatePreviewHeader}>
            <span className={styles.generatePreviewTitle}>
              {generatePreviewTitleLabel}
            </span>
            {mocked && (
              <span className={styles.generateMockedBadge}>
                {generateMockedNoticeLabel}
              </span>
            )}
          </div>

          <div className={styles.generateField}>
            <span className={styles.generateFieldLabel}>
              {fieldLabels.description}
            </span>
            <p className={styles.generateFieldValue}>
              {suggestion.description}
            </p>
          </div>

          <div className={styles.generateField}>
            <span className={styles.generateFieldLabel}>
              {fieldLabels.seoTitle}
            </span>
            <p className={styles.generateFieldValue}>{suggestion.seoTitle}</p>
          </div>

          <div className={styles.generateField}>
            <span className={styles.generateFieldLabel}>
              {fieldLabels.seoDescription}
            </span>
            <p className={styles.generateFieldValue}>
              {suggestion.seoDescription}
            </p>
          </div>

          <div className={styles.generateActions}>
            <Button
              type="button"
              onClick={handleApply}
              className={styles.generateApply}
            >
              {applyLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDiscard}
              className={styles.generateDiscard}
            >
              {discardLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
