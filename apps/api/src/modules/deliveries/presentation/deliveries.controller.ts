import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  deliveryInputSchema,
  listDeliveriesQuerySchema,
  updateDeliverySchema,
  type DeliveryInput,
  type ListDeliveriesQuery,
  type UpdateDeliveryInput,
} from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { DeliveryService } from "../application/delivery.service";
import { toDeliveryResponse, toDeliveryWithCreatorResponse } from "./delivery.mapper";

@Controller("deliveries")
export class DeliveriesController {
  constructor(private readonly deliveries: DeliveryService) {}

  @Get()
  @RequirePermission("deliveries", "read")
  async list(@Query(new ZodValidationPipe(listDeliveriesQuerySchema)) query: ListDeliveriesQuery) {
    const { items, total } = await this.deliveries.list(query);
    return { items: items.map(toDeliveryWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post()
  @RequirePermission("deliveries", "create")
  async create(@Body(new ZodValidationPipe(deliveryInputSchema)) body: DeliveryInput) {
    const delivery = await this.deliveries.create(body);
    return toDeliveryResponse(delivery);
  }

  @Get(":id")
  @RequirePermission("deliveries", "read")
  async getById(@Param("id") id: string) {
    const delivery = await this.deliveries.findById(id);
    return toDeliveryWithCreatorResponse(delivery);
  }

  @Patch(":id")
  @RequirePermission("deliveries", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateDeliverySchema)) body: UpdateDeliveryInput) {
    const delivery = await this.deliveries.update(id, body);
    return toDeliveryResponse(delivery);
  }
}
