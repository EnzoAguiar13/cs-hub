import type { DealStatus } from "@cs-hub/shared-types";

const ALLOWED_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  ACTIVE: ["PAUSED", "ENDED"],
  PAUSED: ["ACTIVE", "ENDED"],
  ENDED: [], // status terminal — um deal encerrado não reabre, cria-se um novo
};

export function canTransitionDealStatus(from: DealStatus, to: DealStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}
