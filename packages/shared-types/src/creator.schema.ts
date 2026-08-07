import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const creatorStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);
export type CreatorStatus = z.infer<typeof creatorStatusSchema>;

export const fileTypeSchema = z.enum(["PHOTO", "CONTRACT", "DOCUMENT", "OTHER"]);
export type FileType = z.infer<typeof fileTypeSchema>;

/** Fields editable via the create/update creator form. */
export const creatorInputSchema = z.object({
  photoUrl: z.string().url().nullable().optional(),
  name: z.string().min(2).max(120),
  nickname: z.string().max(60).nullable().optional(),
  status: creatorStatusSchema.default("ACTIVE"),
  category: z.string().max(60).nullable().optional(),
  isVip: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(30)).default([]),

  // contato
  phone: z.string().max(30).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  country: z.string().max(60).nullable().optional(),
  language: z.string().max(30).nullable().optional(),

  // redes sociais
  telegram: z.string().max(120).nullable().optional(),
  discord: z.string().max(120).nullable().optional(),
  instagram: z.string().max(120).nullable().optional(),
  tiktok: z.string().max(120).nullable().optional(),
  youtube: z.string().max(120).nullable().optional(),
  kick: z.string().max(120).nullable().optional(),
  facebook: z.string().max(120).nullable().optional(),
  twitterX: z.string().max(120).nullable().optional(),

  // responsáveis
  csResponsibleId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),

  // financeiro / documentos (armazenados criptografados no backend)
  pixKey: z.string().max(200).nullable().optional(),
  bankName: z.string().max(120).nullable().optional(),
  bankAccount: z.string().max(60).nullable().optional(),
  cpf: z.string().max(20).nullable().optional(),
  cnpj: z.string().max(20).nullable().optional(),

  notes: z.string().max(4000).nullable().optional(),
});
export type CreatorInput = z.infer<typeof creatorInputSchema>;

export const updateCreatorSchema = creatorInputSchema.partial();
export type UpdateCreatorInput = z.infer<typeof updateCreatorSchema>;

export const creatorSchema = creatorInputSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Creator = z.infer<typeof creatorSchema>;

/** Listing/search results omit financial & document fields — only the detail view (GET /creators/:id) exposes them. */
export const creatorSummarySchema = creatorSchema.omit({
  pixKey: true,
  bankName: true,
  bankAccount: true,
  cpf: true,
  cnpj: true,
  notes: true,
});
export type CreatorSummary = z.infer<typeof creatorSummarySchema>;

export const listCreatorsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: creatorStatusSchema.optional(),
  category: z.string().optional(),
  csResponsibleId: z.string().optional(),
  tag: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListCreatorsQuery = z.infer<typeof listCreatorsQuerySchema>;

export const creatorTimelineEventSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  type: z.string(),
  description: z.string(),
  actorId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});
export type CreatorTimelineEvent = z.infer<typeof creatorTimelineEventSchema>;

export const addTimelineNoteSchema = z.object({
  description: z.string().min(1).max(2000),
});
export type AddTimelineNoteInput = z.infer<typeof addTimelineNoteSchema>;

export const creatorFileSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  type: fileTypeSchema,
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  uploadedById: z.string(),
  createdAt: z.string().datetime(),
  downloadUrl: z.string().url(),
});
export type CreatorFile = z.infer<typeof creatorFileSchema>;

export const requestFileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  type: fileTypeSchema,
});
export type RequestFileUploadInput = z.infer<typeof requestFileUploadSchema>;

export const requestFileUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  storageKey: z.string(),
});
export type RequestFileUploadResponse = z.infer<typeof requestFileUploadResponseSchema>;

export const confirmFileUploadSchema = z.object({
  storageKey: z.string(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  type: fileTypeSchema,
});
export type ConfirmFileUploadInput = z.infer<typeof confirmFileUploadSchema>;
