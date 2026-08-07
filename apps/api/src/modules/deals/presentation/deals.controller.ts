import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { dealInputSchema, listDealsQuerySchema, updateDealSchema, type DealInput, type ListDealsQuery, type UpdateDealInput } from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { DealService } from "../application/deal.service";
import { toDealResponse, toDealWithCreatorResponse } from "./deal.mapper";

@Controller("deals")
export class DealsController {
  constructor(private readonly deals: DealService) {}

  @Get()
  @RequirePermission("deals", "read")
  async list(@Query(new ZodValidationPipe(listDealsQuerySchema)) query: ListDealsQuery) {
    const { items, total } = await this.deals.list(query);
    return { items: items.map(toDealWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post()
  @RequirePermission("deals", "create")
  async create(@Body(new ZodValidationPipe(dealInputSchema)) body: DealInput) {
    const deal = await this.deals.create(body);
    return toDealResponse(deal);
  }

  @Get(":id")
  @RequirePermission("deals", "read")
  async getById(@Param("id") id: string) {
    const deal = await this.deals.findById(id);
    return toDealWithCreatorResponse(deal);
  }

  @Patch(":id")
  @RequirePermission("deals", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateDealSchema)) body: UpdateDealInput) {
    const deal = await this.deals.update(id, body);
    return toDealResponse(deal);
  }
}
