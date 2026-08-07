import type { ExclusivityStatus } from "@cs-hub/shared-types";

export const EXCLUSIVITY_REPOSITORY = Symbol("EXCLUSIVITY_REPOSITORY");

export interface ExclusivityRecord {
  id: string;
  creatorId: string;
  company: string;
  brand: string;
  contractId: string | null;
  valueCents: number;
  penaltyCents: number | null;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  status: ExclusivityStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExclusivityWithCreatorNameRecord extends ExclusivityRecord {
  creatorName: string;
}

export type CreateExclusivityData = Omit<ExclusivityRecord, "id" | "createdAt" | "updatedAt">;
export type UpdateExclusivityData = Partial<CreateExclusivityData>;

export interface ListExclusivitiesFilters {
  creatorId?: string;
  status?: ExclusivityStatus;
  page: number;
  pageSize: number;
  sortBy: "endDate" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface ExclusivityRepository {
  create(data: CreateExclusivityData): Promise<ExclusivityRecord>;
  update(id: string, data: UpdateExclusivityData): Promise<ExclusivityRecord>;
  findById(id: string): Promise<ExclusivityWithCreatorNameRecord | null>;
  list(filters: ListExclusivitiesFilters): Promise<{ items: ExclusivityWithCreatorNameRecord[]; total: number }>;
}
