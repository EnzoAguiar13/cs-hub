import type { CampaignStatus } from "@cs-hub/shared-types";

export const CAMPAIGN_REPOSITORY = Symbol("CAMPAIGN_REPOSITORY");

export interface CampaignRecord {
  id: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  investmentCents: number;
  startDate: Date;
  endDate: Date | null;
  creatorId: string | null;
  clicks: number;
  leads: number;
  registrations: number;
  ftds: number;
  revenueCents: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignWithCreatorNameRecord extends CampaignRecord {
  creatorName: string | null;
}

export type CreateCampaignData = Omit<CampaignRecord, "id" | "createdAt" | "updatedAt">;
export type UpdateCampaignData = Partial<CreateCampaignData>;

export interface ListCampaignsFilters {
  creatorId?: string;
  status?: CampaignStatus;
  page: number;
  pageSize: number;
  sortBy: "startDate" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface CampaignRepository {
  create(data: CreateCampaignData): Promise<CampaignRecord>;
  update(id: string, data: UpdateCampaignData): Promise<CampaignRecord>;
  findById(id: string): Promise<CampaignWithCreatorNameRecord | null>;
  list(filters: ListCampaignsFilters): Promise<{ items: CampaignWithCreatorNameRecord[]; total: number }>;
}
