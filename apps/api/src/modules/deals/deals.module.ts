import { Module } from "@nestjs/common";
import { DEAL_REPOSITORY } from "./domain/deal.repository";
import { PrismaDealRepository } from "./infrastructure/prisma-deal.repository";
import { DealService } from "./application/deal.service";
import { DealsController } from "./presentation/deals.controller";

@Module({
  controllers: [DealsController],
  providers: [{ provide: DEAL_REPOSITORY, useClass: PrismaDealRepository }, DealService],
  exports: [DealService],
})
export class DealsModule {}
