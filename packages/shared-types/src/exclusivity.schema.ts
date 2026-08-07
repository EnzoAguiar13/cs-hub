import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const exclusivityStatusSchema = z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]);
export type ExclusivityStatus = z.infer<typeof exclusivityStatusSchema>;

export const exclusivityInputSchema = z.object({
  creatorId: z.string().min(1),
  company: z.string().min(2).max(160),
  brand: z.string().min(1).max(160),
  contractId: z.string().nullable().optional(),
  valueCents: z.number().int().nonnegative(),
  penaltyCents: z.number().int().nonnegative().nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  autoRenew: z.boolean().default(false),
  status: exclusivityStatusSchema.default("ACTIVE"),
  notes: z.string().max(2000).nullable().optional(),
});
export type ExclusivityInput = z.infer<typeof exclusivityInputSchema>;

export const updateExclusivitySchema = exclusivityInputSchema.partial();
export type UpdateExclusivityInput = z.infer<typeof updateExclusivitySchema>;

export const exclusivitySchema = exclusivityInputSchema.extend({
  id: z.string(),
  /** Calculado sob demanda a partir de `endDate`; negativo quando já venceu. */
  daysRemaining: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Exclusivity = z.infer<typeof exclusivitySchema>;

export const exclusivityWithCreatorSchema = exclusivitySchema.extend({ creatorName: z.string() });
export type ExclusivityWithCreator = z.infer<typeof exclusivityWithCreatorSchema>;

export const listExclusivitiesQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  status: exclusivityStatusSchema.optional(),
  sortBy: z.enum(["endDate", "createdAt", "status"]).default("endDate"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
export type ListExclusivitiesQuery = z.infer<typeof listExclusivitiesQuerySchema>;
