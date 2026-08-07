import type { Withdrawal, WithdrawalStatusHistoryEntry, WithdrawalWithCreator } from "@cs-hub/shared-types";
import type { WithdrawalRecord, WithdrawalStatusHistoryRecord, WithdrawalWithCreatorNameRecord } from "../domain/withdrawal.repository";

export function toWithdrawalResponse(record: WithdrawalRecord): Withdrawal {
  return {
    ...record,
    competence: record.competence.toISOString(),
    requestedAt: record.requestedAt ? record.requestedAt.toISOString() : null,
    paidAt: record.paidAt ? record.paidAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toWithdrawalWithCreatorResponse(record: WithdrawalWithCreatorNameRecord): WithdrawalWithCreator {
  return { ...toWithdrawalResponse(record), creatorName: record.creatorName };
}

export function toWithdrawalHistoryResponse(record: WithdrawalStatusHistoryRecord): WithdrawalStatusHistoryEntry {
  return { ...record, createdAt: record.createdAt.toISOString() };
}
