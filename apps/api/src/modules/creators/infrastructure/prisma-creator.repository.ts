import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateCreatorData,
  CreatorFileRecord,
  CreatorRecord,
  CreatorRepository,
  ListCreatorsFilters,
  TimelineEventRecord,
  UpdateCreatorData,
} from "../domain/creator.repository";

@Injectable()
export class PrismaCreatorRepository implements CreatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCreatorData): Promise<CreatorRecord> {
    return this.prisma.creator.create({ data });
  }

  async update(id: string, data: UpdateCreatorData): Promise<CreatorRecord> {
    return this.prisma.creator.update({ where: { id }, data });
  }

  async findById(id: string): Promise<CreatorRecord | null> {
    return this.prisma.creator.findUnique({ where: { id } });
  }

  async list(filters: ListCreatorsFilters): Promise<{ items: CreatorRecord[]; total: number }> {
    const where: Prisma.CreatorWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.csResponsibleId && { csResponsibleId: filters.csResponsibleId }),
      ...(filters.tag && { tags: { has: filters.tag } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { nickname: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.creator.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.creator.count({ where }),
    ]);

    return { items, total };
  }

  async addTimelineEvent(event: Omit<TimelineEventRecord, "id" | "createdAt">): Promise<TimelineEventRecord> {
    const created = await this.prisma.creatorTimelineEvent.create({
      data: {
        creatorId: event.creatorId,
        type: event.type,
        description: event.description,
        actorId: event.actorId,
        metadata: (event.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
    return { ...created, metadata: created.metadata as Record<string, unknown> | null };
  }

  async listTimelineEvents(creatorId: string): Promise<TimelineEventRecord[]> {
    const events = await this.prisma.creatorTimelineEvent.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });
    return events.map((event) => ({ ...event, metadata: event.metadata as Record<string, unknown> | null }));
  }

  async createFile(file: Omit<CreatorFileRecord, "id" | "createdAt">): Promise<CreatorFileRecord> {
    return this.prisma.creatorFile.create({ data: file });
  }

  async listFiles(creatorId: string): Promise<CreatorFileRecord[]> {
    return this.prisma.creatorFile.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } });
  }

  async findFileByStorageKey(storageKey: string): Promise<CreatorFileRecord | null> {
    return this.prisma.creatorFile.findUnique({ where: { storageKey } });
  }
}
