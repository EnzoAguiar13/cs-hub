import { Injectable } from "@nestjs/common";
import type { DashboardSummary } from "@cs-hub/shared-types";
import { PrismaService } from "../../../prisma/prisma.service";
import { FinanceService } from "../../finance/application/finance.service";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Cross-cutting read model: unlike every other module, this queries Prisma directly
 * instead of going through a repository interface. A dashboard aggregates counts across
 * every other module's tables — routing that through each module's full domain layer
 * would mean importing eight services for what is, in the end, a handful of COUNT/SUM
 * queries. This is a deliberate, narrow exception to the Clean Architecture layering used
 * everywhere else in the codebase, not a precedent for skipping it elsewhere.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
  ) {}

  async summary(): Promise<DashboardSummary> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalCreators,
      activeCreators,
      vipCreators,
      activeDeals,
      totalCampaigns,
      activeCampaigns,
      campaignAgg,
      financeSummary,
      activeExclusivities,
      expiringExclusivities30d,
      totalContracts,
      signedContracts,
      deliveriesPending,
      deliveriesPublished,
      deliveriesLate,
      withdrawalsPending,
      withdrawalsPendingAgg,
      withdrawalsPaidThisMonthAgg,
    ] = await Promise.all([
      this.prisma.creator.count(),
      this.prisma.creator.count({ where: { status: "ACTIVE" } }),
      this.prisma.creator.count({ where: { isVip: true } }),
      this.prisma.deal.count({ where: { status: "ACTIVE" } }),
      this.prisma.campaign.count(),
      this.prisma.campaign.count({ where: { status: "ACTIVE" } }),
      this.prisma.campaign.aggregate({
        _sum: { clicks: true, leads: true, registrations: true, ftds: true, investmentCents: true, revenueCents: true },
      }),
      this.finance.summary(monthStart, monthEnd),
      this.prisma.exclusivity.count({ where: { status: "ACTIVE" } }),
      this.prisma.exclusivity.count({ where: { status: "ACTIVE", endDate: { gte: now, lte: in30Days } } }),
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: "SIGNED" } }),
      this.prisma.delivery.count({ where: { status: "PENDING" } }),
      this.prisma.delivery.count({ where: { status: "PUBLISHED" } }),
      this.prisma.delivery.count({ where: { status: "LATE" } }),
      this.prisma.withdrawalRequest.count({
        where: { status: { in: ["PENDING", "SUBMITTED", "IN_REVIEW", "APPROVED"] } },
      }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { requestedAmountCents: true },
        where: { status: { in: ["PENDING", "SUBMITTED", "IN_REVIEW", "APPROVED"] } },
      }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { requestedAmountCents: true },
        where: { status: "PAID", paidAt: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

    const totalInvestmentCents = campaignAgg._sum.investmentCents ?? 0;
    const totalCampaignRevenueCents = campaignAgg._sum.revenueCents ?? 0;
    const totalFtds = campaignAgg._sum.ftds ?? 0;
    const totalClicks = campaignAgg._sum.clicks ?? 0;

    return {
      totalCreators,
      activeCreators,
      vipCreators,
      activeDeals,
      totalCampaigns,
      activeCampaigns,
      totalClicks,
      totalLeads: campaignAgg._sum.leads ?? 0,
      totalRegistrations: campaignAgg._sum.registrations ?? 0,
      totalFtds,
      totalInvestmentCents,
      totalCampaignRevenueCents,
      overallRoi: totalInvestmentCents > 0 ? (totalCampaignRevenueCents - totalInvestmentCents) / totalInvestmentCents : null,
      overallCpaCents: totalFtds > 0 ? Math.round(totalInvestmentCents / totalFtds) : null,
      overallConversionRate: totalClicks > 0 ? totalFtds / totalClicks : null,

      financeIncomePaidCents: financeSummary.totalIncomePaidCents,
      financeExpensePaidCents: financeSummary.totalExpensePaidCents,
      financeBalanceCents: financeSummary.balanceCents,
      financePendingCents: financeSummary.totalPendingIncomeCents - financeSummary.totalPendingExpenseCents,

      activeExclusivities,
      expiringExclusivities30d,

      totalContracts,
      signedContracts,

      deliveriesPending,
      deliveriesPublished,
      deliveriesLate,

      withdrawalsPendingCount: withdrawalsPending,
      withdrawalsPendingCents: withdrawalsPendingAgg._sum.requestedAmountCents ?? 0,
      withdrawalsPaidThisMonthCents: withdrawalsPaidThisMonthAgg._sum.requestedAmountCents ?? 0,
    };
  }
}
