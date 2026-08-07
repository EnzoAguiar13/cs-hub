import type { PaymentMethod, TransactionStatus, TransactionType } from "@cs-hub/shared-types";

export const FINANCE_REPOSITORY = Symbol("FINANCE_REPOSITORY");

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  amountCents: number;
  costCenter: string | null;
  dueDate: Date;
  paidAt: Date | null;
  method: PaymentMethod | null;
  proofFileKey: string | null;
  creatorId: string | null;
  dealId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCreatorNameRecord extends TransactionRecord {
  creatorName: string | null;
}

export type CreateTransactionData = Omit<
  TransactionRecord,
  "id" | "createdAt" | "updatedAt" | "status" | "paidAt" | "proofFileKey"
>;
export type UpdateTransactionData = Partial<
  Omit<TransactionRecord, "id" | "createdAt" | "updatedAt" | "createdById" | "creatorId" | "dealId" | "type">
>;

export interface ListTransactionsFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  creatorId?: string;
  dealId?: string;
  dueFrom?: Date;
  dueTo?: Date;
  page: number;
  pageSize: number;
  sortBy: "dueDate" | "createdAt" | "amountCents";
  sortDir: "asc" | "desc";
}

export interface FinanceSummaryTotals {
  totalIncomePaidCents: number;
  totalExpensePaidCents: number;
  totalPendingIncomeCents: number;
  totalPendingExpenseCents: number;
}

export interface FinanceRepository {
  create(data: CreateTransactionData): Promise<TransactionRecord>;
  update(id: string, data: UpdateTransactionData): Promise<TransactionRecord>;
  findById(id: string): Promise<TransactionWithCreatorNameRecord | null>;
  list(filters: ListTransactionsFilters): Promise<{ items: TransactionWithCreatorNameRecord[]; total: number }>;
  sumTotals(from: Date, to: Date): Promise<FinanceSummaryTotals>;
}
