import type { WithdrawalStatus } from "@cs-hub/shared-types";

const ALLOWED_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  NOT_AVAILABLE: ["AVAILABLE"],
  AVAILABLE: ["PENDING", "CANCELLED"],
  PENDING: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PAID", "CANCELLED"],
  PAID: [], // terminal
  REJECTED: [], // terminal
  CANCELLED: [], // terminal
};

export function canTransitionWithdrawalStatus(from: WithdrawalStatus, to: WithdrawalStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}
