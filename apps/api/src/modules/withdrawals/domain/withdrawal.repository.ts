import type { PaymentMethod, WithdrawalStatus } from "@cs-hub/shared-types";

export const WITHDRAWAL_REPOSITORY = Symbol("WITHDRAWAL_REPOSITORY");

export interface WithdrawalRecord {
  id: string;
  creatorId: string;
  competence: Date;
  availableAmountCents: number;
  requestedAmountCents: number | null;
  requestedAt: Date | null;
  requestedById: string | null;
  status: WithdrawalStatus;
  paymentMethod: PaymentMethod | null;
  proofFileKey: string | null;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalWithCreatorNameRecord extends WithdrawalRecord {
  creatorName: string;
}

export type CreateWithdrawalData = Pick<
  WithdrawalRecord,
  "creatorId" | "competence" | "availableAmountCents" | "status" | "notes"
>;
export type UpdateWithdrawalData = Partial<
  Omit<WithdrawalRecord, "id" | "creatorId" | "competence" | "createdAt" | "updatedAt">
>;

export interface ListWithdrawalsFilters {
  creatorId?: string;
  status?: WithdrawalStatus;
  competence?: Date;
  page: number;
  pageSize: number;
  sortBy: "competence" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface WithdrawalStatusHistoryRecord {
  id: string;
  withdrawalId: string;
  fromStatus: WithdrawalStatus | null;
  toStatus: WithdrawalStatus;
  actorId: string | null;
  createdAt: Date;
}

export interface WithdrawalSummaryCounts {
  notRequestedCount: number;
  requestedCount: number;
  inReviewCount: number;
  approvedCount: number;
  paidCount: number;
  totalPendingCents: number;
  totalPaidCents: number;
  totalAwaitingRequestCents: number;
}

export interface WithdrawalRepository {
  create(data: CreateWithdrawalData): Promise<WithdrawalRecord>;
  update(id: string, data: UpdateWithdrawalData): Promise<WithdrawalRecord>;
  findById(id: string): Promise<WithdrawalWithCreatorNameRecord | null>;
  findByCreatorAndCompetence(creatorId: string, competence: Date): Promise<WithdrawalRecord | null>;
  list(filters: ListWithdrawalsFilters): Promise<{ items: WithdrawalWithCreatorNameRecord[]; total: number }>;
  addStatusHistory(entry: Omit<WithdrawalStatusHistoryRecord, "id" | "createdAt">): Promise<WithdrawalStatusHistoryRecord>;
  listStatusHistory(withdrawalId: string): Promise<WithdrawalStatusHistoryRecord[]>;
  summary(competence: Date): Promise<WithdrawalSummaryCounts>;
}
