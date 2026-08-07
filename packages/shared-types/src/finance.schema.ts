import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const transactionStatusSchema = z.enum(["PENDING", "PAID", "CANCELLED"]);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

export const paymentMethodSchema = z.enum(["PIX", "TED", "BOLETO", "OTHER"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  description: z.string().min(2).max(200),
  /** Em centavos. */
  amountCents: z.number().int().positive(),
  costCenter: z.string().max(60).nullable().optional(),
  dueDate: z.string().datetime(),
  method: paymentMethodSchema.nullable().optional(),
  creatorId: z.string().nullable().optional(),
  dealId: z.string().nullable().optional(),
});
export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const updateTransactionSchema = z.object({
  description: z.string().min(2).max(200).optional(),
  amountCents: z.number().int().positive().optional(),
  costCenter: z.string().max(60).nullable().optional(),
  dueDate: z.string().datetime().optional(),
  method: paymentMethodSchema.nullable().optional(),
  status: transactionStatusSchema.optional(),
  proofFileKey: z.string().nullable().optional(),
});
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionSchema = transactionInputSchema.extend({
  id: z.string(),
  status: transactionStatusSchema,
  paidAt: z.string().datetime().nullable(),
  proofFileKey: z.string().nullable(),
  createdById: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionWithCreatorSchema = transactionSchema.extend({
  creatorName: z.string().nullable(),
});
export type TransactionWithCreator = z.infer<typeof transactionWithCreatorSchema>;

export const listTransactionsQuerySchema = paginationQuerySchema.extend({
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  creatorId: z.string().optional(),
  dealId: z.string().optional(),
  dueFrom: z.string().datetime().optional(),
  dueTo: z.string().datetime().optional(),
  sortBy: z.enum(["dueDate", "createdAt", "amountCents"]).default("dueDate"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

export const financeSummaryQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type FinanceSummaryQuery = z.infer<typeof financeSummaryQuerySchema>;

export const financeSummarySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  totalIncomePaidCents: z.number().int(),
  totalExpensePaidCents: z.number().int(),
  balanceCents: z.number().int(),
  totalPendingIncomeCents: z.number().int(),
  totalPendingExpenseCents: z.number().int(),
});
export type FinanceSummary = z.infer<typeof financeSummarySchema>;
