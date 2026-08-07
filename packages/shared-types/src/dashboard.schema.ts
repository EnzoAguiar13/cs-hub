import { z } from "zod";

export const dashboardSummarySchema = z.object({
  totalCreators: z.number().int(),
  activeCreators: z.number().int(),
  vipCreators: z.number().int(),

  activeDeals: z.number().int(),

  totalCampaigns: z.number().int(),
  activeCampaigns: z.number().int(),
  totalClicks: z.number().int(),
  totalLeads: z.number().int(),
  totalRegistrations: z.number().int(),
  totalFtds: z.number().int(),
  totalInvestmentCents: z.number().int(),
  totalCampaignRevenueCents: z.number().int(),
  overallRoi: z.number().nullable(),
  overallCpaCents: z.number().int().nullable(),
  overallConversionRate: z.number().nullable(),

  financeIncomePaidCents: z.number().int(),
  financeExpensePaidCents: z.number().int(),
  financeBalanceCents: z.number().int(),
  financePendingCents: z.number().int(),

  activeExclusivities: z.number().int(),
  expiringExclusivities30d: z.number().int(),

  totalContracts: z.number().int(),
  signedContracts: z.number().int(),

  deliveriesPending: z.number().int(),
  deliveriesPublished: z.number().int(),
  deliveriesLate: z.number().int(),

  withdrawalsPendingCount: z.number().int(),
  withdrawalsPendingCents: z.number().int(),
  withdrawalsPaidThisMonthCents: z.number().int(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
