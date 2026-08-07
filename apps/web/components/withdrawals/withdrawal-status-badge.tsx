import type { WithdrawalStatus } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<WithdrawalStatus, string> = {
  NOT_AVAILABLE: "Não disponível",
  AVAILABLE: "Disponível para solicitar",
  PENDING: "Solicitação pendente",
  SUBMITTED: "Solicitação enviada",
  IN_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  PAID: "Pago",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
};

const VARIANT: Record<WithdrawalStatus, "secondary" | "outline" | "success" | "destructive"> = {
  NOT_AVAILABLE: "outline",
  AVAILABLE: "secondary",
  PENDING: "secondary",
  SUBMITTED: "secondary",
  IN_REVIEW: "secondary",
  APPROVED: "success",
  PAID: "success",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

export { LABEL as WITHDRAWAL_STATUS_LABEL };

export function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
