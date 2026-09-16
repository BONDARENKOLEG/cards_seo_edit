import { GoogleGenAI, Type, type Schema } from '@google/genai';
import { z } from 'zod';

import { PRODUCT_LIMITS } from '@/helpers/productValidation';
import type { ProductAttribute } from '@/types/product.types';

const MODEL = 'gemini-3.6-flash';

export const generatedContentSchema = z.object({
  description: z.string().min(1).max(PRODUCT_LIMITS.description),
  seoTitle: z.string().min(1).max(PRODUCT_LIMITS.seoTitle),
  seoDescription: z.string().min(1).max(PRODUCT_LIMITS.seoDescription)
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;

export type GenerateResult = {
  content: GeneratedContent;
  mocked: boolean;
};

// No API key configured (e.g. a reviewer running the app without one) falls
// back to a deterministic mock instead of failing — the feature stays
// reproducibly testable without real credentials, per the task spec.
export const isLlmMocked = (): boolean => !process.env.GEMINI_API_KEY;

// Gemini's native Schema (unlike its JSON-Schema-subset responseJsonSchema
// alternative) supports minLength/maxLength, so it can enforce the editor's
// own character limits at the model level, not just via the prompt.
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      minLength: '1',
      maxLength: String(PRODUCT_LIMITS.description)
    },
    seoTitle: {
      type: Type.STRING,
      minLength: '1',
      maxLength: String(PRODUCT_LIMITS.seoTitle)
    },
    seoDescription: {
      type: Type.STRING,
      minLength: '1',
      maxLength: String(PRODUCT_LIMITS.seoDescription)
    }
  },
  required: ['description', 'seoTitle', 'seoDescription']
};

const buildPrompt = (title: string, attributes: ProductAttribute[]): string => {
  const attributesText =
    attributes.length > 0
      ? attributes
          .map((attribute) => `${attribute.label}: ${attribute.value}`)
          .join('; ')
      : 'not specified';

  return `You are a content manager for an online store. Write the product card content in Ukrainian.

Product name: ${title}
Characteristics: ${attributesText}

Requirements:
- description: a description for the buyer, up to ${PRODUCT_LIMITS.description} characters.
- seoTitle: an SEO title for the product page, up to ${PRODUCT_LIMITS.seoTitle} characters.
- seoDescription: an SEO description for the product page for search results, up to ${PRODUCT_LIMITS.seoDescription} characters.

Write in natural Ukrainian, no markdown formatting, and no quotation marks around the text.`;
};

const generateMockContent = (
  title: string,
  attributes: ProductAttribute[]
): GeneratedContent => {
  const attributesText = attributes
    .map((attribute) => `${attribute.label.toLowerCase()}: ${attribute.value}`)
    .join(', ');

  const description = (
    attributesText
      ? `${title} — надійний вибір з такими характеристиками: ${attributesText}. Якісні матеріали та продумані деталі роблять цей товар чудовим доповненням до вашого щоденного використання.`
      : `${title} — надійний та якісний товар, який стане чудовим доповненням до вашого щоденного використання.`
  ).slice(0, PRODUCT_LIMITS.description);

  const seoTitle = `${title} — купити з доставкою`.slice(
    0,
    PRODUCT_LIMITS.seoTitle
  );

  const seoDescription =
    `Купуйте ${title.toLowerCase()} з доставкою. Якість, перевірена покупцями, вигідна ціна.`.slice(
      0,
      PRODUCT_LIMITS.seoDescription
    );

  return { description, seoTitle, seoDescription };
};

const generateRealContent = async (
  title: string,
  attributes: ProductAttribute[]
): Promise<GeneratedContent> => {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await client.models.generateContent({
    model: MODEL,
    contents: buildPrompt(title, attributes),
    config: {
      responseMimeType: 'application/json',
      responseSchema
    }
  });

  if (!response.text) {
    throw new Error('LLM response had no text output');
  }

  // The schema constrains the model, but doesn't guarantee it — validate
  // the parsed JSON against our own limits before trusting it.
  const result = generatedContentSchema.safeParse(JSON.parse(response.text));

  if (!result.success) {
    throw new Error('LLM response did not match the expected format');
  }

  return result.data;
};

export const generateProductContent = async (
  title: string,
  attributes: ProductAttribute[]
): Promise<GenerateResult> => {
  if (isLlmMocked()) {
    return { content: generateMockContent(title, attributes), mocked: true };
  }

  return {
    content: await generateRealContent(title, attributes),
    mocked: false
  };
};
