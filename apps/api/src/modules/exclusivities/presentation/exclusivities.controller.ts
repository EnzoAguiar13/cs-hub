import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  exclusivityInputSchema,
  listExclusivitiesQuerySchema,
  updateExclusivitySchema,
  type ExclusivityInput,
  type ListExclusivitiesQuery,
  type UpdateExclusivityInput,
} from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { ExclusivityService } from "../application/exclusivity.service";
import { toExclusivityResponse, toExclusivityWithCreatorResponse } from "./exclusivity.mapper";

@Controller("exclusivities")
export class ExclusivitiesController {
  constructor(private readonly exclusivities: ExclusivityService) {}

  @Get()
  @RequirePermission("exclusivities", "read")
  async list(@Query(new ZodValidationPipe(listExclusivitiesQuerySchema)) query: ListExclusivitiesQuery) {
    const { items, total } = await this.exclusivities.list(query);
    return { items: items.map(toExclusivityWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post()
  @RequirePermission("exclusivities", "create")
  async create(@Body(new ZodValidationPipe(exclusivityInputSchema)) body: ExclusivityInput) {
    const exclusivity = await this.exclusivities.create(body);
    return toExclusivityResponse(exclusivity);
  }

  @Get(":id")
  @RequirePermission("exclusivities", "read")
  async getById(@Param("id") id: string) {
    const exclusivity = await this.exclusivities.findById(id);
    return toExclusivityWithCreatorResponse(exclusivity);
  }

  @Patch(":id")
  @RequirePermission("exclusivities", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateExclusivitySchema)) body: UpdateExclusivityInput) {
    const exclusivity = await this.exclusivities.update(id, body);
    return toExclusivityResponse(exclusivity);
  }
}
