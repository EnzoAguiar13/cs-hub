import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { DeliveryInput, ListDeliveriesQuery, UpdateDeliveryInput } from "@cs-hub/shared-types";
import {
  DELIVERY_REPOSITORY,
  type DeliveryRecord,
  type DeliveryRepository,
  type DeliveryWithCreatorNameRecord,
} from "../domain/delivery.repository";

@Injectable()
export class DeliveryService {
  constructor(@Inject(DELIVERY_REPOSITORY) private readonly deliveries: DeliveryRepository) {}

  create(input: DeliveryInput): Promise<DeliveryRecord> {
    return this.deliveries.create({
      creatorId: input.creatorId,
      campaignId: input.campaignId ?? null,
      type: input.type,
      status: input.status,
      scheduledAt: new Date(input.scheduledAt),
      responsibleId: input.responsibleId ?? null,
      comments: input.comments ?? null,
    });
  }

  async update(id: string, input: UpdateDeliveryInput): Promise<DeliveryRecord> {
    const existing = await this.deliveries.findById(id);
    if (!existing) throw new NotFoundException("Entrega não encontrada");

    const becamePublished = input.status === "PUBLISHED" && existing.status !== "PUBLISHED";

    return this.deliveries.update(id, {
      ...input,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      publishedAt: becamePublished ? new Date() : undefined,
    });
  }

  async findById(id: string): Promise<DeliveryWithCreatorNameRecord> {
    const delivery = await this.deliveries.findById(id);
    if (!delivery) throw new NotFoundException("Entrega não encontrada");
    return delivery;
  }

  list(query: ListDeliveriesQuery) {
    return this.deliveries.list({
      ...query,
      scheduledFrom: query.scheduledFrom ? new Date(query.scheduledFrom) : undefined,
      scheduledTo: query.scheduledTo ? new Date(query.scheduledTo) : undefined,
    });
  }
}
