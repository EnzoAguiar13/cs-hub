import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateDealData,
  DealRecord,
  DealRepository,
  DealWithCreatorNameRecord,
  ListDealsFilters,
  UpdateDealData,
} from "../domain/deal.repository";

function toRecord(deal: { creator: { name: string } } & Record<string, unknown>): DealWithCreatorNameRecord {
  const { creator, ...rest } = deal;
  return { ...(rest as unknown as DealRecord), creatorName: creator.name };
}

@Injectable()
export class PrismaDealRepository implements DealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDealData): Promise<DealRecord> {
    return this.prisma.deal.create({ data });
  }

  async update(id: string, data: UpdateDealData): Promise<DealRecord> {
    return this.prisma.deal.update({ where: { id }, data });
  }

  async findById(id: string): Promise<DealWithCreatorNameRecord | null> {
    const deal = await this.prisma.deal.findUnique({ where: { id }, include: { creator: { select: { name: true } } } });
    return deal ? toRecord(deal) : null;
  }

  async list(filters: ListDealsFilters): Promise<{ items: DealWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.DealWhereInput = {
      creatorId: filters.creatorId,
      status: filters.status,
      type: filters.type,
    };

    const [items, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }
}
