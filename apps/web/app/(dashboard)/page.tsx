"use client";

import {
  Users2,
  UserCheck,
  Handshake,
  Megaphone,
  TrendingUp,
  Wallet,
  Clock,
  ShieldAlert,
  FileText,
  Banknote,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CampaignFunnelChart } from "@/components/dashboard/campaign-funnel-chart";
import { DeliveriesStatusChart } from "@/components/dashboard/deliveries-status-chart";
import { useDashboardSummaryQuery } from "@/hooks/use-dashboard";
import { formatCentsToBRL } from "@/lib/format";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummaryQuery();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral em tempo real de todos os módulos do CS Hub.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total de Afiliados" value={String(data.totalCreators)} icon={Users2} />
        <KpiCard label="Creators Ativos" value={String(data.activeCreators)} icon={UserCheck} tone="text-emerald-500" />
        <KpiCard label="Deals Ativos" value={String(data.activeDeals)} icon={Handshake} />
        <KpiCard label="Campanhas Ativas" value={`${data.activeCampaigns} / ${data.totalCampaigns}`} icon={Megaphone} />

        <KpiCard
          label="ROI Geral (campanhas)"
          value={data.overallRoi !== null ? `${(data.overallRoi * 100).toFixed(0)}%` : "—"}
          icon={TrendingUp}
          tone={data.overallRoi !== null && data.overallRoi < 0 ? "text-red-500" : "text-emerald-500"}
        />
        <KpiCard label="Saldo do mês (Financeiro)" value={formatCentsToBRL(data.financeBalanceCents)} icon={Wallet} />
        <KpiCard label="Pendências financeiras" value={formatCentsToBRL(data.financePendingCents)} icon={Clock} tone="text-amber-500" />
        <KpiCard
          label="Exclusividades vencendo (30d)"
          value={String(data.expiringExclusivities30d)}
          icon={ShieldAlert}
          tone={data.expiringExclusivities30d > 0 ? "text-amber-500" : undefined}
        />

        <KpiCard label="Contratos assinados" value={`${data.signedContracts} / ${data.totalContracts}`} icon={FileText} />
        <KpiCard
          label="Saques pendentes"
          value={`${data.withdrawalsPendingCount} (${formatCentsToBRL(data.withdrawalsPendingCents)})`}
          icon={Banknote}
          tone={data.withdrawalsPendingCount > 0 ? "text-amber-500" : undefined}
        />
        <KpiCard label="Saques pagos no mês" value={formatCentsToBRL(data.withdrawalsPaidThisMonthCents)} icon={Banknote} tone="text-emerald-500" />
        <KpiCard label="Creators VIP" value={String(data.vipCreators)} icon={Users2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CampaignFunnelChart
          clicks={data.totalClicks}
          leads={data.totalLeads}
          registrations={data.totalRegistrations}
          ftds={data.totalFtds}
        />
        <DeliveriesStatusChart pending={data.deliveriesPending} published={data.deliveriesPublished} late={data.deliveriesLate} />
      </div>
    </div>
  );
}
