import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  campaignInputSchema,
  listCampaignsQuerySchema,
  updateCampaignSchema,
  type CampaignInput,
  type ListCampaignsQuery,
  type UpdateCampaignInput,
} from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { CampaignService } from "../application/campaign.service";
import { toCampaignResponse, toCampaignWithCreatorResponse } from "./campaign.mapper";

@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaigns: CampaignService) {}

  @Get()
  @RequirePermission("campaigns", "read")
  async list(@Query(new ZodValidationPipe(listCampaignsQuerySchema)) query: ListCampaignsQuery) {
    const { items, total } = await this.campaigns.list(query);
    return { items: items.map(toCampaignWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post()
  @RequirePermission("campaigns", "create")
  async create(@Body(new ZodValidationPipe(campaignInputSchema)) body: CampaignInput) {
    const campaign = await this.campaigns.create(body);
    return toCampaignResponse(campaign);
  }

  @Get(":id")
  @RequirePermission("campaigns", "read")
  async getById(@Param("id") id: string) {
    const campaign = await this.campaigns.findById(id);
    return toCampaignWithCreatorResponse(campaign);
  }

  @Patch(":id")
  @RequirePermission("campaigns", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateCampaignSchema)) body: UpdateCampaignInput) {
    const campaign = await this.campaigns.update(id, body);
    return toCampaignResponse(campaign);
  }
}
