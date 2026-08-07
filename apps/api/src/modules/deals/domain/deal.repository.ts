import type { DealStatus, DealType } from "@cs-hub/shared-types";

export const DEAL_REPOSITORY = Symbol("DEAL_REPOSITORY");

export interface DealRecord {
  id: string;
  creatorId: string;
  type: DealType;
  status: DealStatus;
  cpaValueCents: number | null;
  revSharePercent: number | null;
  fixedValueCents: number | null;
  targetValueCents: number | null;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealWithCreatorNameRecord extends DealRecord {
  creatorName: string;
}

export type CreateDealData = Omit<DealRecord, "id" | "createdAt" | "updatedAt">;
export type UpdateDealData = Partial<CreateDealData>;

export interface ListDealsFilters {
  creatorId?: string;
  status?: DealStatus;
  type?: DealType;
  page: number;
  pageSize: number;
  sortBy: "startDate" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface DealRepository {
  create(data: CreateDealData): Promise<DealRecord>;
  update(id: string, data: UpdateDealData): Promise<DealRecord>;
  findById(id: string): Promise<DealWithCreatorNameRecord | null>;
  list(filters: ListDealsFilters): Promise<{ items: DealWithCreatorNameRecord[]; total: number }>;
}
