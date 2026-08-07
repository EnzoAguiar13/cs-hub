"use client";

import * as React from "react";
import { Mail, Send, Slack, MessageCircle, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import type { NotificationChannelType, NotificationDeliveryStatus, NotificationType } from "@cs-hub/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNotificationChannelsQuery, useNotificationsQuery } from "@/hooks/use-notifications";

const CHANNEL_ICON: Record<NotificationChannelType, React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  TELEGRAM: Send,
  SLACK: Slack,
  DISCORD: MessageCircle,
};

const TYPE_LABEL: Record<NotificationType, string> = {
  CONTRACT_EXPIRING: "Contrato vencendo",
  EXCLUSIVITY_EXPIRING: "Exclusividade vencendo",
  PAYMENT_OVERDUE: "Pagamento atrasado",
  DELIVERY_LATE: "Entrega atrasada",
  WITHDRAWAL_NOT_REQUESTED: "Saque não solicitado",
  GOAL_REACHED: "Meta atingida",
  GOAL_MISSED: "Meta perdida",
};

const DELIVERY_STATUS_ICON: Record<NotificationDeliveryStatus, React.ComponentType<{ className?: string }>> = {
  SENT: CheckCircle2,
  FAILED: XCircle,
  SKIPPED: MinusCircle,
};
const DELIVERY_STATUS_TONE: Record<NotificationDeliveryStatus, string> = {
  SENT: "text-emerald-500",
  FAILED: "text-red-500",
  SKIPPED: "text-muted-foreground",
};

function ChannelStatusPanel() {
  const { data: channels, isLoading } = useNotificationChannelsQuery();

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {channels?.map((channel) => {
        const Icon = CHANNEL_ICON[channel.channel];
        return (
          <Card key={channel.channel}>
            <CardContent className="flex items-center gap-2 p-4">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{channel.channel}</span>
                <Badge variant={channel.configured ? "success" : "outline"} className="w-fit text-xs">
                  {channel.configured ? "Configurado" : "Não configurado"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function NotificacoesPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useNotificationsQuery(page);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Notificações</h1>
        <p className="text-sm text-muted-foreground">
          Alertas automáticos de contratos vencendo, pagamentos atrasados, entregas em atraso e saques pendentes — enviados por
          Email, Telegram, Slack e Discord quando configurados no <code>.env</code>.
        </p>
      </div>

      <ChannelStatusPanel />

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma notificação disparada ainda.</p>
        ) : (
          data.items.map((notification) => (
            <Card key={notification.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{notification.title}</CardTitle>
                  <Badge variant="outline">{TYPE_LABEL[notification.type]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <div className="flex flex-wrap gap-3">
                  {notification.deliveries.map((delivery) => {
                    const StatusIcon = DELIVERY_STATUS_ICON[delivery.status];
                    return (
                      <span key={delivery.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <StatusIcon className={`h-3.5 w-3.5 ${DELIVERY_STATUS_TONE[delivery.status]}`} />
                        {delivery.channel}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString("pt-BR")}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  );
}
