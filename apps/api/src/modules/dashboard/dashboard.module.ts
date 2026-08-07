import { Module } from "@nestjs/common";
import { FinanceModule } from "../finance/finance.module";
import { DashboardService } from "./application/dashboard.service";
import { DashboardController } from "./presentation/dashboard.controller";

@Module({
  imports: [FinanceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
