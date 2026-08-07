import { Inject, Injectable } from "@nestjs/common";
import type { ChannelStatus, NotificationType } from "@cs-hub/shared-types";
import { NOTIFICATION_CHANNELS, type NotificationChannel } from "../domain/notification-channel";
import { NOTIFICATION_REPOSITORY, type NotificationRepository } from "../domain/notification.repository";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository,
    @Inject(NOTIFICATION_CHANNELS) private readonly channels: NotificationChannel[],
  ) {}

  async notify(type: NotificationType, title: string, message: string, metadata: Record<string, unknown> | null = null) {
    const notification = await this.notifications.create({ type, title, message, metadata });

    await Promise.all(
      this.channels.map(async (channel) => {
        if (!channel.isConfigured()) {
          return this.notifications.addDelivery({
            notificationId: notification.id,
            channel: channel.type,
            status: "SKIPPED",
            error: null,
          });
        }
        try {
          await channel.send(title, message);
          return this.notifications.addDelivery({
            notificationId: notification.id,
            channel: channel.type,
            status: "SENT",
            error: null,
          });
        } catch (error) {
          return this.notifications.addDelivery({
            notificationId: notification.id,
            channel: channel.type,
            status: "FAILED",
            error: error instanceof Error ? error.message : "Erro desconhecido",
          });
        }
      }),
    );

    return notification;
  }

  /** Avoids re-notifying the same underlying event (e.g. the same overdue invoice) every run. */
  wasRecentlyNotified(type: NotificationType, key: string, value: string, sinceDaysAgo: number) {
    return this.notifications.existsRecentByMetadataKey(type, key, value, sinceDaysAgo);
  }

  list(page: number, pageSize: number) {
    return this.notifications.list(page, pageSize);
  }

  channelStatus(): ChannelStatus[] {
    return this.channels.map((channel) => ({ channel: channel.type, configured: channel.isConfigured() }));
  }
}
