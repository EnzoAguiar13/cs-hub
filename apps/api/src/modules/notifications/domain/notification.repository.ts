import type { NotificationChannelType, NotificationDeliveryStatus, NotificationType } from "@cs-hub/shared-types";

export const NOTIFICATION_REPOSITORY = Symbol("NOTIFICATION_REPOSITORY");

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface DeliveryRecord {
  id: string;
  notificationId: string;
  channel: NotificationChannelType;
  status: NotificationDeliveryStatus;
  error: string | null;
  createdAt: Date;
}

export interface NotificationWithDeliveriesRecord extends NotificationRecord {
  deliveries: DeliveryRecord[];
}

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
}

export interface CreateDeliveryData {
  notificationId: string;
  channel: NotificationChannelType;
  status: NotificationDeliveryStatus;
  error: string | null;
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<NotificationRecord>;
  addDelivery(data: CreateDeliveryData): Promise<DeliveryRecord>;
  list(page: number, pageSize: number): Promise<{ items: NotificationWithDeliveriesRecord[]; total: number }>;
  /** Used by the alert scheduler to avoid re-notifying the same underlying event every run. */
  existsRecentByMetadataKey(type: NotificationType, key: string, value: string, sinceDaysAgo: number): Promise<boolean>;
}
