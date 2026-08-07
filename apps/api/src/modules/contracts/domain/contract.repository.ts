import type { ContractStatus } from "@cs-hub/shared-types";

export const CONTRACT_REPOSITORY = Symbol("CONTRACT_REPOSITORY");

export interface ContractRecord {
  id: string;
  creatorId: string;
  title: string;
  version: number;
  previousVersionId: string | null;
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: ContractStatus;
  signedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateContractData = Omit<ContractRecord, "id" | "createdAt" | "updatedAt" | "signedAt">;

export type UpdateContractData = Partial<Pick<ContractRecord, "status" | "signedAt" | "expiresAt" | "notes">>;

export interface ListContractsFilters {
  creatorId?: string;
  status?: ContractStatus;
  page: number;
  pageSize: number;
}

export interface ContractRepository {
  create(data: CreateContractData): Promise<ContractRecord>;
  update(id: string, data: UpdateContractData): Promise<ContractRecord>;
  findById(id: string): Promise<ContractRecord | null>;
  list(filters: ListContractsFilters): Promise<{ items: ContractRecord[]; total: number }>;
}
