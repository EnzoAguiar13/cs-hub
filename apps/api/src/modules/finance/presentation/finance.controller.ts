import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  financeSummaryQuerySchema,
  listTransactionsQuerySchema,
  transactionInputSchema,
  updateTransactionSchema,
  type FinanceSummaryQuery,
  type ListTransactionsQuery,
  type TransactionInput,
  type UpdateTransactionInput,
} from "@cs-hub/shared-types";
import { CurrentUser, type RequestUser } from "../../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { FinanceService } from "../application/finance.service";
import { toTransactionResponse, toTransactionWithCreatorResponse } from "./finance.mapper";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

@Controller("finance")
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get("transactions")
  @RequirePermission("finance", "read")
  async list(@Query(new ZodValidationPipe(listTransactionsQuerySchema)) query: ListTransactionsQuery) {
    const { items, total } = await this.finance.list(query);
    return { items: items.map(toTransactionWithCreatorResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post("transactions")
  @RequirePermission("finance", "create")
  async create(@Body(new ZodValidationPipe(transactionInputSchema)) body: TransactionInput, @CurrentUser() user: RequestUser) {
    const transaction = await this.finance.create(body, user.id);
    return toTransactionResponse(transaction);
  }

  @Get("transactions/:id")
  @RequirePermission("finance", "read")
  async getById(@Param("id") id: string) {
    const transaction = await this.finance.findById(id);
    return toTransactionWithCreatorResponse(transaction);
  }

  @Patch("transactions/:id")
  @RequirePermission("finance", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateTransactionSchema)) body: UpdateTransactionInput) {
    const transaction = await this.finance.update(id, body);
    return toTransactionResponse(transaction);
  }

  @Get("summary")
  @RequirePermission("finance", "read")
  async summary(@Query(new ZodValidationPipe(financeSummaryQuerySchema)) query: FinanceSummaryQuery) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : startOfMonth(now);
    const to = query.to ? new Date(query.to) : endOfMonth(now);
    return this.finance.summary(from, to);
  }
}
