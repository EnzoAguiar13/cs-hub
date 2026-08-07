import type { CreatorInput, UpdateCreatorInput } from "@cs-hub/shared-types";
import type { CreateCreatorData, UpdateCreatorData } from "../domain/creator.repository";

const OPTIONAL_NULLABLE_FIELDS = [
  "photoUrl",
  "nickname",
  "category",
  "phone",
  "whatsapp",
  "country",
  "language",
  "telegram",
  "discord",
  "instagram",
  "tiktok",
  "youtube",
  "kick",
  "facebook",
  "twitterX",
  "instagramFollowers",
  "tiktokFollowers",
  "youtubeSubscribers",
  "telegramMembers",
  "csResponsibleId",
  "managerId",
  "pixKey",
  "bankName",
  "bankAccount",
  "cpf",
  "cnpj",
  "notes",
] as const;

/** Zod schemas allow `undefined` for optional fields; the repository layer wants explicit `null`. */
function normalizeOptionalNulls<T extends Record<string, unknown>>(input: T): T {
  const result = { ...input };
  for (const field of OPTIONAL_NULLABLE_FIELDS) {
    if (field in result && result[field] === undefined) {
      (result as Record<string, unknown>)[field] = null;
    }
  }
  if (result.email === "") {
    (result as Record<string, unknown>).email = null;
  }
  return result;
}

const SOCIAL_METRIC_FIELDS = ["instagramFollowers", "tiktokFollowers", "youtubeSubscribers", "telegramMembers"] as const;

export function toCreateData(input: CreatorInput): CreateCreatorData {
  return { ...normalizeOptionalNulls(input), socialMetricsUpdatedAt: null } as CreateCreatorData;
}

export function toUpdateData(input: UpdateCreatorInput): UpdateCreatorData {
  const normalized = normalizeOptionalNulls(input);
  const touchesSocialMetrics = SOCIAL_METRIC_FIELDS.some((field) => field in input && input[field] !== undefined);
  return {
    ...normalized,
    ...(touchesSocialMetrics ? { socialMetricsUpdatedAt: new Date() } : {}),
  } as UpdateCreatorData;
}
