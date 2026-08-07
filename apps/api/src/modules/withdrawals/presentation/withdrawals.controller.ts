import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  listWithdrawalsQuerySchema,
  updateWithdrawalSchema,
  withdrawalInputSchema,
  withdrawalSummaryQuerySchema,
  type ListWithdrawalsQuery,
  type UpdateWithdrawalInput,
  type WithdrawalInput,
  type WithdrawalSummaryQuery,
} from "@cs-hub/shared-types";
import { CurrentUser, type RequestUser } from "../../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { WithdrawalService } from "../application/withdrawal.service";
import { toWithdrawalHistoryResponse, toWithdrawalResponse, toWithdrawalWithCreatorResponse } from "./withdrawal.mapper";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

@Controller("withdrawals")
export class WithdrawalsController {
  constructor(private readonly withdrawals: WithdrawalService) {}

  @Get()
  @RequirePermission("withdrawals", "read")
  async list(@Query(new ZodValidationPipe(listWithdrawalsQuerySchema)) query: ListWithdrawalsQuery) {
    const { items, total } = await this.withdrawals.list(query);
    return { items: items.map(toWithdrawalWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post()
  @RequirePermission("withdrawals", "create")
  async create(@Body(new ZodValidationPipe(withdrawalInputSchema)) body: WithdrawalInput) {
    const withdrawal = await this.withdrawals.create(body);
    return toWithdrawalResponse(withdrawal);
  }

  @Get("summary")
  @RequirePermission("withdrawals", "read")
  async summary(@Query(new ZodValidationPipe(withdrawalSummaryQuerySchema)) query: WithdrawalSummaryQuery) {
    const competence = query.competence ? new Date(query.competence) : startOfMonth(new Date());
    const counts = await this.withdrawals.summary(competence);
    return { competence: competence.toISOString(), ...counts };
  }

  @Get(":id")
  @RequirePermission("withdrawals", "read")
  async getById(@Param("id") id: string) {
    const withdrawal = await this.withdrawals.findById(id);
    return toWithdrawalWithCreatorResponse(withdrawal);
  }

  @Get(":id/history")
  @RequirePermission("withdrawals", "read")
  async getHistory(@Param("id") id: string) {
    const history = await this.withdrawals.listStatusHistory(id);
    return history.map(toWithdrawalHistoryResponse);
  }

  @Patch(":id")
  @RequirePermission("withdrawals", "update")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateWithdrawalSchema)) body: UpdateWithdrawalInput,
    @CurrentUser() user: RequestUser,
  ) {
    const withdrawal = await this.withdrawals.update(id, body, user.id);
    return toWithdrawalResponse(withdrawal);
  }
}
