import type { Deal, DealWithCreator } from "@cs-hub/shared-types";
import type { DealRecord, DealWithCreatorNameRecord } from "../domain/deal.repository";

export function toDealResponse(record: DealRecord): Deal {
  return {
    ...record,
    startDate: record.startDate.toISOString(),
    endDate: record.endDate ? record.endDate.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toDealWithCreatorResponse(record: DealWithCreatorNameRecord): DealWithCreator {
  return { ...toDealResponse(record), creatorName: record.creatorName };
}
