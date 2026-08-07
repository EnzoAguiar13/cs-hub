import type { CampaignStatus } from "@cs-hub/shared-types";
import { Badge } from "@/components/ui/badge";

const LABEL: Record<CampaignStatus, string> = { PLANNED: "Planejada", ACTIVE: "Ativa", PAUSED: "Pausada", ENDED: "Encerrada" };
const VARIANT: Record<CampaignStatus, "outline" | "success" | "secondary"> = {
  PLANNED: "outline",
  ACTIVE: "success",
  PAUSED: "secondary",
  ENDED: "outline",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
