import type { Campaign, CampaignWithCreator } from "@cs-hub/shared-types";
import type { CampaignRecord, CampaignWithCreatorNameRecord } from "../domain/campaign.repository";
import { computeCampaignMetrics } from "../domain/campaign.entity";

export function toCampaignResponse(record: CampaignRecord): Campaign {
  return {
    ...record,
    ...computeCampaignMetrics(record),
    startDate: record.startDate.toISOString(),
    endDate: record.endDate ? record.endDate.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toCampaignWithCreatorResponse(record: CampaignWithCreatorNameRecord): CampaignWithCreator {
  return { ...toCampaignResponse(record), creatorName: record.creatorName };
}
