import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateDeliveryData,
  DeliveryRecord,
  DeliveryRepository,
  DeliveryWithCreatorNameRecord,
  ListDeliveriesFilters,
  UpdateDeliveryData,
} from "../domain/delivery.repository";

function toRecord(delivery: { creator: { name: string } } & Record<string, unknown>): DeliveryWithCreatorNameRecord {
  const { creator, ...rest } = delivery;
  return { ...(rest as unknown as DeliveryRecord), creatorName: creator.name };
}

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryData): Promise<DeliveryRecord> {
    return this.prisma.delivery.create({ data });
  }

  async update(id: string, data: UpdateDeliveryData): Promise<DeliveryRecord> {
    return this.prisma.delivery.update({ where: { id }, data });
  }

  async findById(id: string): Promise<DeliveryWithCreatorNameRecord | null> {
    const delivery = await this.prisma.delivery.findUnique({ where: { id }, include: { creator: { select: { name: true } } } });
    return delivery ? toRecord(delivery) : null;
  }

  async list(filters: ListDeliveriesFilters): Promise<{ items: DeliveryWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.DeliveryWhereInput = {
      creatorId: filters.creatorId,
      campaignId: filters.campaignId,
      status: filters.status,
      type: filters.type,
      scheduledAt:
        filters.scheduledFrom || filters.scheduledTo ? { gte: filters.scheduledFrom, lte: filters.scheduledTo } : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.delivery.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }
}
