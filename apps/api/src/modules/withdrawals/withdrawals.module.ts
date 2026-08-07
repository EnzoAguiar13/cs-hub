import { Module } from "@nestjs/common";
import { FinanceModule } from "../finance/finance.module";
import { WITHDRAWAL_REPOSITORY } from "./domain/withdrawal.repository";
import { PrismaWithdrawalRepository } from "./infrastructure/prisma-withdrawal.repository";
import { WithdrawalService } from "./application/withdrawal.service";
import { WithdrawalsController } from "./presentation/withdrawals.controller";

@Module({
  imports: [FinanceModule],
  controllers: [WithdrawalsController],
  providers: [{ provide: WITHDRAWAL_REPOSITORY, useClass: PrismaWithdrawalRepository }, WithdrawalService],
})
export class WithdrawalsModule {}
