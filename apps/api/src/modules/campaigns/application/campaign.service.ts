import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CampaignInput, ListCampaignsQuery, UpdateCampaignInput } from "@cs-hub/shared-types";
import {
  CAMPAIGN_REPOSITORY,
  type CampaignRecord,
  type CampaignRepository,
  type CampaignWithCreatorNameRecord,
} from "../domain/campaign.repository";

@Injectable()
export class CampaignService {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaigns: CampaignRepository) {}

  create(input: CampaignInput): Promise<CampaignRecord> {
    return this.campaigns.create({
      name: input.name,
      objective: input.objective ?? null,
      status: input.status,
      investmentCents: input.investmentCents,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      creatorId: input.creatorId ?? null,
      clicks: input.clicks,
      leads: input.leads,
      registrations: input.registrations,
      ftds: input.ftds,
      revenueCents: input.revenueCents,
      notes: input.notes ?? null,
    });
  }

  async update(id: string, input: UpdateCampaignInput): Promise<CampaignRecord> {
    const existing = await this.campaigns.findById(id);
    if (!existing) throw new NotFoundException("Campanha não encontrada");

    return this.campaigns.update(id, {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : undefined,
    });
  }

  async findById(id: string): Promise<CampaignWithCreatorNameRecord> {
    const campaign = await this.campaigns.findById(id);
    if (!campaign) throw new NotFoundException("Campanha não encontrada");
    return campaign;
  }

  list(query: ListCampaignsQuery) {
    return this.campaigns.list(query);
  }
}
