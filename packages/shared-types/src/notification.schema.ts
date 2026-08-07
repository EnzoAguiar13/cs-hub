import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const notificationTypeSchema = z.enum([
  "CONTRACT_EXPIRING",
  "EXCLUSIVITY_EXPIRING",
  "PAYMENT_OVERDUE",
  "DELIVERY_LATE",
  "WITHDRAWAL_NOT_REQUESTED",
  "GOAL_REACHED",
  "GOAL_MISSED",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationChannelTypeSchema = z.enum(["EMAIL", "TELEGRAM", "SLACK", "DISCORD"]);
export type NotificationChannelType = z.infer<typeof notificationChannelTypeSchema>;

export const notificationDeliveryStatusSchema = z.enum(["SENT", "FAILED", "SKIPPED"]);
export type NotificationDeliveryStatus = z.infer<typeof notificationDeliveryStatusSchema>;

export const notificationDeliverySchema = z.object({
  id: z.string(),
  channel: notificationChannelTypeSchema,
  status: notificationDeliveryStatusSchema,
  error: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type NotificationDelivery = z.infer<typeof notificationDeliverySchema>;

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  deliveries: z.array(notificationDeliverySchema),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const listNotificationsQuerySchema = paginationQuerySchema;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const channelStatusSchema = z.object({
  channel: notificationChannelTypeSchema,
  configured: z.boolean(),
});
export type ChannelStatus = z.infer<typeof channelStatusSchema>;
