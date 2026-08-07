"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Handshake, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeliveriesQuery } from "@/hooks/use-deliveries";
import { useTransactionsQuery } from "@/hooks/use-finance";
import { useDealsQuery } from "@/hooks/use-deals";
import { DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";
import { formatCentsToBRL } from "@/lib/format";

interface CalendarEvent {
  date: Date;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export default function CalendarioPage() {
  const { data: deliveries, isLoading: loadingDeliveries } = useDeliveriesQuery({
    scheduledFrom: new Date().toISOString(),
    page: 1,
    pageSize: 50,
    sortBy: "scheduledAt",
    sortDir: "asc",
  });
  const { data: transactions, isLoading: loadingTransactions } = useTransactionsQuery({
    status: "PENDING",
    page: 1,
    pageSize: 50,
    sortBy: "dueDate",
    sortDir: "asc",
  });
  const { data: deals, isLoading: loadingDeals } = useDealsQuery({ status: "ACTIVE", page: 1, pageSize: 50 });

  const isLoading = loadingDeliveries || loadingTransactions || loadingDeals;

  const events = React.useMemo<CalendarEvent[]>(() => {
    const now = new Date();
    const items: CalendarEvent[] = [];

    for (const delivery of deliveries?.items ?? []) {
      items.push({
        date: new Date(delivery.scheduledAt),
        icon: CalendarClock,
        label: `Entrega — ${DELIVERY_TYPE_LABEL[delivery.type]} de ${delivery.creatorName}`,
        href: "/entregas",
      });
    }

    for (const transaction of transactions?.items ?? []) {
      items.push({
        date: new Date(transaction.dueDate),
        icon: Wallet,
        label: `Pagamento — ${transaction.description} (${formatCentsToBRL(transaction.amountCents)})`,
        href: "/financeiro",
      });
    }

    for (const deal of deals?.items ?? []) {
      if (deal.endDate) {
        const endDate = new Date(deal.endDate);
        const daysUntil = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntil >= 0 && daysUntil <= 30) {
          items.push({ date: endDate, icon: Handshake, label: `Deal vence — ${deal.creatorName}`, href: `/deals/${deal.id}` });
        }
      }
    }

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [deliveries, transactions, deals]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return [...map.entries()];
  }, [events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Calendário</h1>
        <p className="text-sm text-muted-foreground">Próximas entregas, pagamentos e vencimentos de deals.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum evento próximo.</p>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, dayEvents]) => (
            <div key={day} className="space-y-2">
              <h2 className="text-sm font-medium capitalize text-muted-foreground">{day}</h2>
              <div className="space-y-2">
                {dayEvents.map((event, index) => (
                  <Link key={index} href={event.href}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardContent className="flex items-center gap-3 p-3">
                        <event.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">{event.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {event.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
