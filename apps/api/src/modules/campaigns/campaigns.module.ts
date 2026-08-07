import { Module } from "@nestjs/common";
import { CAMPAIGN_REPOSITORY } from "./domain/campaign.repository";
import { PrismaCampaignRepository } from "./infrastructure/prisma-campaign.repository";
import { CampaignService } from "./application/campaign.service";
import { CampaignsController } from "./presentation/campaigns.controller";

@Module({
  controllers: [CampaignsController],
  providers: [{ provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository }, CampaignService],
  exports: [CampaignService],
})
export class CampaignsModule {}
