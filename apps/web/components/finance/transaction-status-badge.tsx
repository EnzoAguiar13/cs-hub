import type { TransactionStatus } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<TransactionStatus, string> = { PENDING: "Pendente", PAID: "Pago", CANCELLED: "Cancelado" };
const VARIANT: Record<TransactionStatus, "secondary" | "success" | "destructive"> = {
  PENDING: "secondary",
  PAID: "success",
  CANCELLED: "destructive",
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
