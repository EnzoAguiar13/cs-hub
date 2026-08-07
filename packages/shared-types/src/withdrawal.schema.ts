import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";
import { paymentMethodSchema } from "./finance.schema";

export const withdrawalStatusSchema = z.enum([
  "NOT_AVAILABLE",
  "AVAILABLE",
  "PENDING",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "PAID",
  "REJECTED",
  "CANCELLED",
]);
export type WithdrawalStatus = z.infer<typeof withdrawalStatusSchema>;

export const withdrawalInputSchema = z.object({
  creatorId: z.string().min(1),
  /** Primeiro dia do mês de competência (ex.: 2026-08-01T00:00:00.000Z). */
  competence: z.string().datetime(),
  availableAmountCents: z.number().int().nonnegative(),
  status: withdrawalStatusSchema.default("NOT_AVAILABLE"),
  notes: z.string().max(2000).nullable().optional(),
});
export type WithdrawalInput = z.infer<typeof withdrawalInputSchema>;

export const updateWithdrawalSchema = z.object({
  availableAmountCents: z.number().int().nonnegative().optional(),
  requestedAmountCents: z.number().int().positive().nullable().optional(),
  status: withdrawalStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.nullable().optional(),
  proofFileKey: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
export type UpdateWithdrawalInput = z.infer<typeof updateWithdrawalSchema>;

export const withdrawalSchema = withdrawalInputSchema.extend({
  id: z.string(),
  requestedAmountCents: z.number().int().nullable(),
  requestedAt: z.string().datetime().nullable(),
  requestedById: z.string().nullable(),
  paymentMethod: paymentMethodSchema.nullable(),
  proofFileKey: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Withdrawal = z.infer<typeof withdrawalSchema>;

export const withdrawalWithCreatorSchema = withdrawalSchema.extend({ creatorName: z.string() });
export type WithdrawalWithCreator = z.infer<typeof withdrawalWithCreatorSchema>;

export const listWithdrawalsQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  status: withdrawalStatusSchema.optional(),
  competence: z.string().datetime().optional(),
  sortBy: z.enum(["competence", "createdAt", "status"]).default("competence"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListWithdrawalsQuery = z.infer<typeof listWithdrawalsQuerySchema>;

export const withdrawalStatusHistorySchema = z.object({
  id: z.string(),
  withdrawalId: z.string(),
  fromStatus: withdrawalStatusSchema.nullable(),
  toStatus: withdrawalStatusSchema,
  actorId: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type WithdrawalStatusHistoryEntry = z.infer<typeof withdrawalStatusHistorySchema>;

export const withdrawalSummaryQuerySchema = z.object({
  competence: z.string().datetime().optional(),
});
export type WithdrawalSummaryQuery = z.infer<typeof withdrawalSummaryQuerySchema>;

export const withdrawalSummarySchema = z.object({
  competence: z.string().datetime(),
  notRequestedCount: z.number().int(),
  requestedCount: z.number().int(),
  inReviewCount: z.number().int(),
  approvedCount: z.number().int(),
  paidCount: z.number().int(),
  totalPendingCents: z.number().int(),
  totalPaidCents: z.number().int(),
  totalAwaitingRequestCents: z.number().int(),
});
export type WithdrawalSummary = z.infer<typeof withdrawalSummarySchema>;
