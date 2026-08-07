import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const deliveryTypeSchema = z.enum([
  "STORY",
  "FEED",
  "REELS",
  "VIDEO",
  "LIVE",
  "BANNER",
  "TELEGRAM_GROUP",
  "WHATSAPP_GROUP",
  "PUSH",
  "SMS",
]);
export type DeliveryType = z.infer<typeof deliveryTypeSchema>;

export const deliveryStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CORRECTION", "PUBLISHED", "LATE"]);
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>;

export const deliveryInputSchema = z.object({
  creatorId: z.string().min(1),
  campaignId: z.string().nullable().optional(),
  type: deliveryTypeSchema,
  status: deliveryStatusSchema.default("PENDING"),
  scheduledAt: z.string().datetime(),
  responsibleId: z.string().nullable().optional(),
  comments: z.string().max(2000).nullable().optional(),
});
export type DeliveryInput = z.infer<typeof deliveryInputSchema>;

export const updateDeliverySchema = z.object({
  campaignId: z.string().nullable().optional(),
  type: deliveryTypeSchema.optional(),
  status: deliveryStatusSchema.optional(),
  scheduledAt: z.string().datetime().optional(),
  responsibleId: z.string().nullable().optional(),
  comments: z.string().max(2000).nullable().optional(),
  fileKey: z.string().nullable().optional(),
});
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;

export const deliverySchema = deliveryInputSchema.extend({
  id: z.string(),
  publishedAt: z.string().datetime().nullable(),
  fileKey: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Delivery = z.infer<typeof deliverySchema>;

export const deliveryWithCreatorSchema = deliverySchema.extend({ creatorName: z.string() });
export type DeliveryWithCreator = z.infer<typeof deliveryWithCreatorSchema>;

export const listDeliveriesQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  campaignId: z.string().optional(),
  status: deliveryStatusSchema.optional(),
  type: deliveryTypeSchema.optional(),
  scheduledFrom: z.string().datetime().optional(),
  scheduledTo: z.string().datetime().optional(),
  sortBy: z.enum(["scheduledAt", "createdAt", "status"]).default("scheduledAt"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
export type ListDeliveriesQuery = z.infer<typeof listDeliveriesQuerySchema>;
