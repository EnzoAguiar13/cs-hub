import type {
  CreateCreatorData,
  CreatorFileRecord,
  CreatorRecord,
  CreatorRepository,
  ListCreatorsFilters,
  TimelineEventRecord,
  UpdateCreatorData,
} from "../../domain/creator.repository";

/** In-memory CreatorRepository double for unit-testing use-cases without a database. */
export class InMemoryCreatorRepository implements CreatorRepository {
  private readonly creators = new Map<string, CreatorRecord>();
  private readonly timelineEvents: TimelineEventRecord[] = [];
  private readonly files: CreatorFileRecord[] = [];
  private sequence = 0;

  async create(data: CreateCreatorData): Promise<CreatorRecord> {
    const now = new Date();
    const record: CreatorRecord = { id: `creator_${++this.sequence}`, ...data, createdAt: now, updatedAt: now };
    this.creators.set(record.id, record);
    return record;
  }

  async update(id: string, data: UpdateCreatorData): Promise<CreatorRecord> {
    const existing = this.creators.get(id);
    if (!existing) throw new Error(`Creator ${id} not found in fake repository`);
    const updated: CreatorRecord = { ...existing, ...data, updatedAt: new Date() };
    this.creators.set(id, updated);
    return updated;
  }

  async findById(id: string): Promise<CreatorRecord | null> {
    return this.creators.get(id) ?? null;
  }

  async list(_filters: ListCreatorsFilters): Promise<{ items: CreatorRecord[]; total: number }> {
    const items = [...this.creators.values()];
    return { items, total: items.length };
  }

  async addTimelineEvent(event: Omit<TimelineEventRecord, "id" | "createdAt">): Promise<TimelineEventRecord> {
    const record: TimelineEventRecord = { id: `event_${this.timelineEvents.length + 1}`, createdAt: new Date(), ...event };
    this.timelineEvents.push(record);
    return record;
  }

  async listTimelineEvents(creatorId: string): Promise<TimelineEventRecord[]> {
    return this.timelineEvents.filter((event) => event.creatorId === creatorId);
  }

  async createFile(file: Omit<CreatorFileRecord, "id" | "createdAt">): Promise<CreatorFileRecord> {
    const record: CreatorFileRecord = { id: `file_${this.files.length + 1}`, createdAt: new Date(), ...file };
    this.files.push(record);
    return record;
  }

  async listFiles(creatorId: string): Promise<CreatorFileRecord[]> {
    return this.files.filter((file) => file.creatorId === creatorId);
  }

  async findFileByStorageKey(storageKey: string): Promise<CreatorFileRecord | null> {
    return this.files.find((file) => file.storageKey === storageKey) ?? null;
  }
}

export function buildCreateCreatorData(overrides: Partial<CreateCreatorData> = {}): CreateCreatorData {
  return {
    photoUrl: null,
    name: "Fulano da Silva",
    nickname: null,
    status: "ACTIVE",
    category: null,
    isVip: false,
    tags: [],
    phone: null,
    whatsapp: null,
    email: null,
    country: null,
    language: null,
    telegram: null,
    discord: null,
    instagram: null,
    tiktok: null,
    youtube: null,
    kick: null,
    facebook: null,
    twitterX: null,
    csResponsibleId: null,
    managerId: null,
    pixKey: null,
    bankName: null,
    bankAccount: null,
    cpf: null,
    cnpj: null,
    notes: null,
    ...overrides,
  };
}
