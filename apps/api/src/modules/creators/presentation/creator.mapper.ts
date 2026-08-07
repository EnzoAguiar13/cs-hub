import type { Creator, CreatorSummary, CreatorTimelineEvent, CreatorFile } from "@cs-hub/shared-types";
import type { CreatorRecord, TimelineEventRecord } from "../domain/creator.repository";
import type { CreatorFileWithUrl } from "../application/list-files.use-case";

export function toCreatorResponse(record: CreatorRecord): Creator {
  return {
    ...record,
    socialMetricsUpdatedAt: record.socialMetricsUpdatedAt ? record.socialMetricsUpdatedAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toCreatorSummaryResponse(record: CreatorRecord): CreatorSummary {
  const {
    pixKey: _pixKey,
    bankName: _bankName,
    bankAccount: _bankAccount,
    cpf: _cpf,
    cnpj: _cnpj,
    notes: _notes,
    ...rest
  } = record;
  return {
    ...rest,
    socialMetricsUpdatedAt: record.socialMetricsUpdatedAt ? record.socialMetricsUpdatedAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toTimelineResponse(record: TimelineEventRecord): CreatorTimelineEvent {
  return { ...record, createdAt: record.createdAt.toISOString() };
}

export function toFileResponse(record: CreatorFileWithUrl): CreatorFile {
  return { ...record, createdAt: record.createdAt.toISOString() };
}
