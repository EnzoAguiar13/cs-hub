import { computeCampaignMetrics } from "./campaign.entity";

describe("computeCampaignMetrics", () => {
  it("computes ROI, CPA and conversion rate from raw counters", () => {
    const metrics = computeCampaignMetrics({ investmentCents: 100_00, revenueCents: 250_00, ftds: 10, clicks: 1000 });

    expect(metrics.roi).toBeCloseTo(1.5); // (250 - 100) / 100
    expect(metrics.cpaCents).toBe(1000); // 10000 / 10
    expect(metrics.conversionRate).toBeCloseTo(0.01); // 10 / 1000
  });

  it("returns null for metrics that would divide by zero instead of throwing", () => {
    const metrics = computeCampaignMetrics({ investmentCents: 0, revenueCents: 0, ftds: 0, clicks: 0 });

    expect(metrics.roi).toBeNull();
    expect(metrics.cpaCents).toBeNull();
    expect(metrics.conversionRate).toBeNull();
  });

  it("reports a negative ROI when revenue is below investment", () => {
    const metrics = computeCampaignMetrics({ investmentCents: 200_00, revenueCents: 50_00, ftds: 5, clicks: 100 });
    expect(metrics.roi).toBeCloseTo(-0.75); // (50 - 200) / 200
  });
});
