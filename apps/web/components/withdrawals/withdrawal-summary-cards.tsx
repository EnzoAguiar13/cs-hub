"use client";

import { AlertTriangle, CheckCircle2, Clock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWithdrawalSummaryQuery } from "@/hooks/use-withdrawals";
import { formatCentsToBRL } from "@/lib/format";

export function WithdrawalSummaryCards() {
  const { data: summary, isLoading } = useWithdrawalSummaryQuery();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Ainda não solicitados", value: summary.notRequestedCount, icon: AlertTriangle, tone: "text-amber-500", isCurrency: false },
    { title: "Solicitados / em andamento", value: summary.requestedCount, icon: Clock, tone: "text-blue-500", isCurrency: false },
    { title: "Pagos no mês", value: summary.paidCount, icon: CheckCircle2, tone: "text-emerald-500", isCurrency: false },
    { title: "Valor pendente", value: summary.totalPendingCents, icon: Wallet, tone: "text-amber-500", isCurrency: true },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.tone}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{card.isCurrency ? formatCentsToBRL(card.value) : card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
