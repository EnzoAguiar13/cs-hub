import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateExclusivityData,
  ExclusivityRecord,
  ExclusivityRepository,
  ExclusivityWithCreatorNameRecord,
  ListExclusivitiesFilters,
  UpdateExclusivityData,
} from "../domain/exclusivity.repository";

function toRecord(
  exclusivity: { creator: { name: string } } & Record<string, unknown>,
): ExclusivityWithCreatorNameRecord {
  const { creator, ...rest } = exclusivity;
  return { ...(rest as unknown as ExclusivityRecord), creatorName: creator.name };
}

@Injectable()
export class PrismaExclusivityRepository implements ExclusivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExclusivityData): Promise<ExclusivityRecord> {
    return this.prisma.exclusivity.create({ data });
  }

  async update(id: string, data: UpdateExclusivityData): Promise<ExclusivityRecord> {
    return this.prisma.exclusivity.update({ where: { id }, data });
  }

  async findById(id: string): Promise<ExclusivityWithCreatorNameRecord | null> {
    const exclusivity = await this.prisma.exclusivity.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });
    return exclusivity ? toRecord(exclusivity) : null;
  }

  async list(filters: ListExclusivitiesFilters): Promise<{ items: ExclusivityWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.ExclusivityWhereInput = { creatorId: filters.creatorId, status: filters.status };

    const [items, total] = await Promise.all([
      this.prisma.exclusivity.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.exclusivity.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }
}
