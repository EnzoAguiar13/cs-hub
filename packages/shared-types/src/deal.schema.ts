import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const dealTypeSchema = z.enum(["CPA", "REVSHARE", "HYBRID", "FEE", "MONTHLY", "WEEKLY", "BONUS"]);
export type DealType = z.infer<typeof dealTypeSchema>;

export const dealStatusSchema = z.enum(["ACTIVE", "PAUSED", "ENDED"]);
export type DealStatus = z.infer<typeof dealStatusSchema>;

export const dealInputSchema = z.object({
  creatorId: z.string().min(1),
  type: dealTypeSchema,
  status: dealStatusSchema.default("ACTIVE"),

  /** Valores em centavos — evita erros de arredondamento de ponto flutuante. */
  cpaValueCents: z.number().int().nonnegative().nullable().optional(),
  revSharePercent: z.number().min(0).max(100).nullable().optional(),
  fixedValueCents: z.number().int().nonnegative().nullable().optional(),
  targetValueCents: z.number().int().nonnegative().nullable().optional(),

  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  autoRenew: z.boolean().default(false),
  notes: z.string().max(4000).nullable().optional(),
});
export type DealInput = z.infer<typeof dealInputSchema>;

export const updateDealSchema = dealInputSchema.partial();
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const dealSchema = dealInputSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Deal = z.infer<typeof dealSchema>;

export const dealWithCreatorSchema = dealSchema.extend({
  creatorName: z.string(),
});
export type DealWithCreator = z.infer<typeof dealWithCreatorSchema>;

export const listDealsQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  status: dealStatusSchema.optional(),
  type: dealTypeSchema.optional(),
  sortBy: z.enum(["startDate", "createdAt", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
