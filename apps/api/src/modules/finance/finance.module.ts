import { Module } from "@nestjs/common";
import { FINANCE_REPOSITORY } from "./domain/finance.repository";
import { PrismaFinanceRepository } from "./infrastructure/prisma-finance.repository";
import { FinanceService } from "./application/finance.service";
import { FinanceController } from "./presentation/finance.controller";

@Module({
  controllers: [FinanceController],
  providers: [{ provide: FINANCE_REPOSITORY, useClass: PrismaFinanceRepository }, FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
