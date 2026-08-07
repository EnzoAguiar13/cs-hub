import type { DealStatus } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<DealStatus, string> = { ACTIVE: "Ativo", PAUSED: "Pausado", ENDED: "Encerrado" };
const VARIANT: Record<DealStatus, "success" | "secondary" | "outline"> = {
  ACTIVE: "success",
  PAUSED: "secondary",
  ENDED: "outline",
};

export function DealStatusBadge({ status }: { status: DealStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
