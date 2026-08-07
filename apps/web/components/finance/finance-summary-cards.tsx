"use client";

import { ArrowDownCircle, ArrowUpCircle, Clock, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinanceSummaryQuery } from "@/hooks/use-finance";
import { formatCentsToBRL } from "@/lib/format";

export function FinanceSummaryCards() {
  const { data: summary, isLoading } = useFinanceSummaryQuery();

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
    { title: "Receita paga (mês)", value: summary.totalIncomePaidCents, icon: ArrowUpCircle, tone: "text-emerald-500" },
    { title: "Despesas pagas (mês)", value: summary.totalExpensePaidCents, icon: ArrowDownCircle, tone: "text-red-500" },
    { title: "Saldo (mês)", value: summary.balanceCents, icon: Scale, tone: summary.balanceCents >= 0 ? "text-emerald-500" : "text-red-500" },
    {
      title: "Pendente (receita - despesa)",
      value: summary.totalPendingIncomeCents - summary.totalPendingExpenseCents,
      icon: Clock,
      tone: "text-amber-500",
    },
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
            <p className="text-2xl font-semibold">{formatCentsToBRL(card.value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
