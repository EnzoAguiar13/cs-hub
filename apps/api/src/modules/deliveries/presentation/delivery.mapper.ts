import type { Delivery, DeliveryWithCreator } from "@cs-hub/shared-types";
import type { DeliveryRecord, DeliveryWithCreatorNameRecord } from "../domain/delivery.repository";

export function toDeliveryResponse(record: DeliveryRecord): Delivery {
  return {
    ...record,
    scheduledAt: record.scheduledAt.toISOString(),
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toDeliveryWithCreatorResponse(record: DeliveryWithCreatorNameRecord): DeliveryWithCreator {
  return { ...toDeliveryResponse(record), creatorName: record.creatorName };
}
