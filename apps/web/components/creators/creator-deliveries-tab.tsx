"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge, DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";
import { EmptyState } from "@/components/creators/empty-state";
import { useDeliveriesQuery } from "@/hooks/use-deliveries";

export function CreatorDeliveriesTab({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useDeliveriesQuery({ creatorId, page: 1, pageSize: 20 });

  if (isLoading) return <Skeleton className="h-32 w-full max-w-2xl" />;
  if (!data?.items.length) {
    return <EmptyState title="Nenhuma entrega agendada" description="Entregas de conteúdo deste creator aparecem aqui." />;
  }

  return (
    <ul className="max-w-2xl divide-y rounded-lg border">
      {data.items.map((delivery) => (
        <li key={delivery.id} className="flex items-center justify-between p-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{DELIVERY_TYPE_LABEL[delivery.type]}</span>
            <span className="text-xs text-muted-foreground">{new Date(delivery.scheduledAt).toLocaleString("pt-BR")}</span>
          </div>
          <DeliveryStatusBadge status={delivery.status} />
        </li>
      ))}
    </ul>
  );
}
