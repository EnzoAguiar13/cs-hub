import type { NotificationChannelType } from "@cs-hub/shared-types";

export const NOTIFICATION_CHANNELS = Symbol("NOTIFICATION_CHANNELS");

export interface NotificationChannel {
  readonly type: NotificationChannelType;
  /** True only when the env vars this channel needs are actually set. */
  isConfigured(): boolean;
  send(title: string, message: string): Promise<void>;
}
