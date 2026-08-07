import type { Exclusivity, ExclusivityWithCreator } from "@cs-hub/shared-types";
import type { ExclusivityRecord, ExclusivityWithCreatorNameRecord } from "../domain/exclusivity.repository";
import { daysRemaining } from "../domain/exclusivity.entity";

export function toExclusivityResponse(record: ExclusivityRecord): Exclusivity {
  return {
    ...record,
    daysRemaining: daysRemaining(record.endDate),
    startDate: record.startDate.toISOString(),
    endDate: record.endDate.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toExclusivityWithCreatorResponse(record: ExclusivityWithCreatorNameRecord): ExclusivityWithCreator {
  return { ...toExclusivityResponse(record), creatorName: record.creatorName };
}
