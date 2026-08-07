import { Module } from "@nestjs/common";
import { EXCLUSIVITY_REPOSITORY } from "./domain/exclusivity.repository";
import { PrismaExclusivityRepository } from "./infrastructure/prisma-exclusivity.repository";
import { ExclusivityService } from "./application/exclusivity.service";
import { ExclusivitiesController } from "./presentation/exclusivities.controller";

@Module({
  controllers: [ExclusivitiesController],
  providers: [{ provide: EXCLUSIVITY_REPOSITORY, useClass: PrismaExclusivityRepository }, ExclusivityService],
})
export class ExclusivitiesModule {}
