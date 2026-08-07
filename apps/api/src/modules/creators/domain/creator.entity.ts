import type { CreatorStatus } from "@cs-hub/shared-types";

const ALLOWED_TRANSITIONS: Record<CreatorStatus, CreatorStatus[]> = {
  ACTIVE: ["INACTIVE", "BLOCKED"],
  INACTIVE: ["ACTIVE", "BLOCKED"],
  BLOCKED: ["ACTIVE", "INACTIVE"],
};

export function canTransitionStatus(from: CreatorStatus, to: CreatorStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Fields whose values are encrypted at rest and must go through EncryptionService. */
export const SENSITIVE_CREATOR_FIELDS = ["pixKey", "bankAccount", "cpf", "cnpj"] as const;
export type SensitiveCreatorField = (typeof SENSITIVE_CREATOR_FIELDS)[number];
