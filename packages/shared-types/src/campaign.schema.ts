import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const campaignStatusSchema = z.enum(["PLANNED", "ACTIVE", "PAUSED", "ENDED"]);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const campaignInputSchema = z.object({
  name: z.string().min(2).max(160),
  objective: z.string().max(500).nullable().optional(),
  status: campaignStatusSchema.default("PLANNED"),
  investmentCents: z.number().int().nonnegative().default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  creatorId: z.string().nullable().optional(),

  clicks: z.number().int().nonnegative().default(0),
  leads: z.number().int().nonnegative().default(0),
  registrations: z.number().int().nonnegative().default(0),
  ftds: z.number().int().nonnegative().default(0),
  revenueCents: z.number().int().nonnegative().default(0),

  notes: z.string().max(4000).nullable().optional(),
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export const updateCampaignSchema = campaignInputSchema.partial();
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const campaignSchema = campaignInputSchema.extend({
  id: z.string(),
  /** Derivados sob demanda a partir de investimento/receita/cliques/ftds — nunca armazenados. */
  roi: z.number().nullable(),
  cpaCents: z.number().int().nullable(),
  conversionRate: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Campaign = z.infer<typeof campaignSchema>;

export const campaignWithCreatorSchema = campaignSchema.extend({ creatorName: z.string().nullable() });
export type CampaignWithCreator = z.infer<typeof campaignWithCreatorSchema>;

export const listCampaignsQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  status: campaignStatusSchema.optional(),
  sortBy: z.enum(["startDate", "createdAt", "status"]).default("startDate"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
