import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateDeliveryData,
  CreateNotificationData,
  DeliveryRecord,
  NotificationRecord,
  NotificationRepository,
  NotificationWithDeliveriesRecord,
} from "../domain/notification.repository";

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData): Promise<NotificationRecord> {
    const created = await this.prisma.notification.create({
      data: { ...data, metadata: data.metadata as Prisma.InputJsonValue | undefined },
    });
    return { ...created, metadata: created.metadata as Record<string, unknown> | null };
  }

  async addDelivery(data: CreateDeliveryData): Promise<DeliveryRecord> {
    return this.prisma.notificationDelivery.create({ data });
  }

  async list(page: number, pageSize: number): Promise<{ items: NotificationWithDeliveriesRecord[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        include: { deliveries: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count(),
    ]);

    return {
      items: items.map((n) => ({ ...n, metadata: n.metadata as Record<string, unknown> | null })),
      total,
    };
  }

  async existsRecentByMetadataKey(
    type: NotificationRecord["type"],
    key: string,
    value: string,
    sinceDaysAgo: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - sinceDaysAgo * 24 * 60 * 60 * 1000);
    const count = await this.prisma.notification.count({
      where: { type, createdAt: { gte: since }, metadata: { path: [key], equals: value } },
    });
    return count > 0;
  }
}
