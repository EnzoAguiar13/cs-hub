import type { CreatorStatus } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<CreatorStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  BLOCKED: "Bloqueado",
};

const STATUS_VARIANT: Record<CreatorStatus, "success" | "secondary" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  BLOCKED: "destructive",
};

export function StatusBadge({ status }: { status: CreatorStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
