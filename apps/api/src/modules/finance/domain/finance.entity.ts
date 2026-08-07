import type { TransactionStatus } from "@cs-hub/shared-types";

const ALLOWED_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [], // terminal — estornos são um novo lançamento (EXPENSE), não uma reversão de status
  CANCELLED: [], // terminal
};

export function canTransitionTransactionStatus(from: TransactionStatus, to: TransactionStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}
