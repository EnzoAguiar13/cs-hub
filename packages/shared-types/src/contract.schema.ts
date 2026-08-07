import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const contractStatusSchema = z.enum(["DRAFT", "SENT", "SIGNED", "EXPIRED", "CANCELLED"]);
export type ContractStatus = z.infer<typeof contractStatusSchema>;

export const requestContractUploadSchema = z.object({
  creatorId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
});
export type RequestContractUploadInput = z.infer<typeof requestContractUploadSchema>;

export const requestContractUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  storageKey: z.string(),
});
export type RequestContractUploadResponse = z.infer<typeof requestContractUploadResponseSchema>;

export const contractInputSchema = z.object({
  creatorId: z.string().min(1),
  title: z.string().min(2).max(200),
  storageKey: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  status: contractStatusSchema.default("DRAFT"),
  expiresAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  /** Preenchido ao subir uma nova versão de um contrato já existente. */
  previousVersionId: z.string().nullable().optional(),
});
export type ContractInput = z.infer<typeof contractInputSchema>;

export const updateContractSchema = z.object({
  status: contractStatusSchema.optional(),
  signedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
export type UpdateContractInput = z.infer<typeof updateContractSchema>;

export const contractSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  version: z.number().int(),
  previousVersionId: z.string().nullable(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  status: contractStatusSchema,
  signedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  uploadedById: z.string(),
  downloadUrl: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Contract = z.infer<typeof contractSchema>;

export const listContractsQuerySchema = paginationQuerySchema.extend({
  creatorId: z.string().optional(),
  status: contractStatusSchema.optional(),
});
export type ListContractsQuery = z.infer<typeof listContractsQuerySchema>;
