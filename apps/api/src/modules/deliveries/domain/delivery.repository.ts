import type { DeliveryStatus, DeliveryType } from "@cs-hub/shared-types";

export const DELIVERY_REPOSITORY = Symbol("DELIVERY_REPOSITORY");

export interface DeliveryRecord {
  id: string;
  creatorId: string;
  campaignId: string | null;
  type: DeliveryType;
  status: DeliveryStatus;
  scheduledAt: Date;
  publishedAt: Date | null;
  responsibleId: string | null;
  fileKey: string | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryWithCreatorNameRecord extends DeliveryRecord {
  creatorName: string;
}

export type CreateDeliveryData = Omit<DeliveryRecord, "id" | "createdAt" | "updatedAt" | "publishedAt" | "fileKey">;
export type UpdateDeliveryData = Partial<Omit<DeliveryRecord, "id" | "creatorId" | "createdAt" | "updatedAt">>;

export interface ListDeliveriesFilters {
  creatorId?: string;
  campaignId?: string;
  status?: DeliveryStatus;
  type?: DeliveryType;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  page: number;
  pageSize: number;
  sortBy: "scheduledAt" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface DeliveryRepository {
  create(data: CreateDeliveryData): Promise<DeliveryRecord>;
  update(id: string, data: UpdateDeliveryData): Promise<DeliveryRecord>;
  findById(id: string): Promise<DeliveryWithCreatorNameRecord | null>;
  list(filters: ListDeliveriesFilters): Promise<{ items: DeliveryWithCreatorNameRecord[]; total: number }>;
}
