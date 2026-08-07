import { z } from "zod";

export const aiInsightItemSchema = z.object({
  creatorId: z.string(),
  creatorName: z.string(),
  label: z.string(),
});
export type AiInsightItem = z.infer<typeof aiInsightItemSchema>;

export const aiInsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  items: z.array(aiInsightItemSchema),
});
export type AiInsight = z.infer<typeof aiInsightSchema>;

export const askAiSchema = z.object({
  question: z.string().min(2).max(300),
});
export type AskAiInput = z.infer<typeof askAiSchema>;

export const askAiResponseSchema = z.object({
  answer: z.string(),
  insight: aiInsightSchema.nullable(),
  suggestions: z.array(z.string()),
});
export type AskAiResponse = z.infer<typeof askAiResponseSchema>;
