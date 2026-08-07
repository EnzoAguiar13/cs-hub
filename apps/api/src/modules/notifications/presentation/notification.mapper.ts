import type { Notification } from "@cs-hub/shared-types";
import type { NotificationWithDeliveriesRecord } from "../domain/notification.repository";

export function toNotificationResponse(record: NotificationWithDeliveriesRecord): Notification {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
    deliveries: record.deliveries.map((d) => ({
      id: d.id,
      channel: d.channel,
      status: d.status,
      error: d.error,
      createdAt: d.createdAt.toISOString(),
    })),
  };
}
