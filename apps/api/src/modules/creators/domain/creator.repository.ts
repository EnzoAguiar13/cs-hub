import type { CreatorStatus, FileType } from "@cs-hub/shared-types";

export const CREATOR_REPOSITORY = Symbol("CREATOR_REPOSITORY");

export interface CreatorRecord {
  id: string;
  photoUrl: string | null;
  name: string;
  nickname: string | null;
  status: CreatorStatus;
  category: string | null;
  isVip: boolean;
  tags: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  country: string | null;
  language: string | null;
  telegram: string | null;
  discord: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  kick: string | null;
  facebook: string | null;
  twitterX: string | null;
  instagramFollowers: number | null;
  tiktokFollowers: number | null;
  youtubeSubscribers: number | null;
  telegramMembers: number | null;
  socialMetricsUpdatedAt: Date | null;
  csResponsibleId: string | null;
  managerId: string | null;
  /** Stored encrypted (AES-256-GCM); the repository never encrypts/decrypts, only persists. */
  pixKey: string | null;
  bankName: string | null;
  bankAccount: string | null;
  cpf: string | null;
  cnpj: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCreatorData = Omit<CreatorRecord, "id" | "createdAt" | "updatedAt">;
export type UpdateCreatorData = Partial<CreateCreatorData>;

export interface ListCreatorsFilters {
  search?: string;
  status?: CreatorStatus;
  category?: string;
  csResponsibleId?: string;
  tag?: string;
  page: number;
  pageSize: number;
  sortBy: "name" | "createdAt" | "status";
  sortDir: "asc" | "desc";
}

export interface TimelineEventRecord {
  id: string;
  creatorId: string;
  type: string;
  description: string;
  actorId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreatorFileRecord {
  id: string;
  creatorId: string;
  type: FileType;
  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  createdAt: Date;
}

export interface CreatorRepository {
  create(data: CreateCreatorData): Promise<CreatorRecord>;
  update(id: string, data: UpdateCreatorData): Promise<CreatorRecord>;
  findById(id: string): Promise<CreatorRecord | null>;
  list(filters: ListCreatorsFilters): Promise<{ items: CreatorRecord[]; total: number }>;

  addTimelineEvent(event: Omit<TimelineEventRecord, "id" | "createdAt">): Promise<TimelineEventRecord>;
  listTimelineEvents(creatorId: string): Promise<TimelineEventRecord[]>;

  createFile(file: Omit<CreatorFileRecord, "id" | "createdAt">): Promise<CreatorFileRecord>;
  listFiles(creatorId: string): Promise<CreatorFileRecord[]>;
  findFileByStorageKey(storageKey: string): Promise<CreatorFileRecord | null>;
}
