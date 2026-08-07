interface CampaignMetricsInput {
  investmentCents: number;
  revenueCents: number;
  ftds: number;
  clicks: number;
}

export interface CampaignMetrics {
  roi: number | null;
  cpaCents: number | null;
  conversionRate: number | null;
}

/** ROI, CPA and conversion rate are always derived from the raw counters, never stored. */
export function computeCampaignMetrics(campaign: CampaignMetricsInput): CampaignMetrics {
  return {
    roi: campaign.investmentCents > 0 ? (campaign.revenueCents - campaign.investmentCents) / campaign.investmentCents : null,
    cpaCents: campaign.ftds > 0 ? Math.round(campaign.investmentCents / campaign.ftds) : null,
    conversionRate: campaign.clicks > 0 ? campaign.ftds / campaign.clicks : null,
  };
}
