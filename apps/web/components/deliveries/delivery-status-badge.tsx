import type { DeliveryStatus, DeliveryType } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  CORRECTION: "Correção",
  PUBLISHED: "Publicado",
  LATE: "Atrasado",
};

const STATUS_VARIANT: Record<DeliveryStatus, "secondary" | "success" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "success",
  REJECTED: "destructive",
  CORRECTION: "outline",
  PUBLISHED: "success",
  LATE: "destructive",
};

export { STATUS_LABEL as DELIVERY_STATUS_LABEL };

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

export const DELIVERY_TYPE_LABEL: Record<DeliveryType, string> = {
  STORY: "Story",
  FEED: "Feed",
  REELS: "Reels",
  VIDEO: "Vídeo",
  LIVE: "Live",
  BANNER: "Banner",
  TELEGRAM_GROUP: "Grupo Telegram",
  WHATSAPP_GROUP: "Grupo WhatsApp",
  PUSH: "Push",
  SMS: "SMS",
};
