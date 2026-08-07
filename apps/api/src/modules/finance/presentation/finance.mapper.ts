import type { Transaction, TransactionWithCreator } from "@cs-hub/shared-types";
import type { TransactionRecord, TransactionWithCreatorNameRecord } from "../domain/finance.repository";

export function toTransactionResponse(record: TransactionRecord): Transaction {
  return {
    ...record,
    dueDate: record.dueDate.toISOString(),
    paidAt: record.paidAt ? record.paidAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toTransactionWithCreatorResponse(record: TransactionWithCreatorNameRecord): TransactionWithCreator {
  return { ...toTransactionResponse(record), creatorName: record.creatorName };
}
