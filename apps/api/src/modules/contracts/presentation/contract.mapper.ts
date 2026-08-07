import type { Contract } from "@cs-hub/shared-types";
import type { ContractWithDownloadUrl } from "../application/contract.service";

export function toContractResponse(record: ContractWithDownloadUrl): Contract {
  return {
    ...record,
    signedAt: record.signedAt ? record.signedAt.toISOString() : null,
    expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
