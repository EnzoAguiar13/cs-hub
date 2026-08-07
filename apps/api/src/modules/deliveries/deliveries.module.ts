import { Module } from "@nestjs/common";
import { DELIVERY_REPOSITORY } from "./domain/delivery.repository";
import { PrismaDeliveryRepository } from "./infrastructure/prisma-delivery.repository";
import { DeliveryService } from "./application/delivery.service";
import { DeliveriesController } from "./presentation/deliveries.controller";

@Module({
  controllers: [DeliveriesController],
  providers: [{ provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository }, DeliveryService],
})
export class DeliveriesModule {}
