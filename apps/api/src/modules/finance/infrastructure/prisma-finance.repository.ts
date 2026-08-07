import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateTransactionData,
  FinanceRepository,
  FinanceSummaryTotals,
  ListTransactionsFilters,
  TransactionRecord,
  TransactionWithCreatorNameRecord,
  UpdateTransactionData,
} from "../domain/finance.repository";

function toRecord(
  transaction: { creator: { name: string } | null } & Record<string, unknown>,
): TransactionWithCreatorNameRecord {
  const { creator, ...rest } = transaction;
  return { ...(rest as unknown as TransactionRecord), creatorName: creator?.name ?? null };
}

@Injectable()
export class PrismaFinanceRepository implements FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionData): Promise<TransactionRecord> {
    return this.prisma.financeTransaction.create({ data });
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionRecord> {
    return this.prisma.financeTransaction.update({ where: { id }, data });
  }

  async findById(id: string): Promise<TransactionWithCreatorNameRecord | null> {
    const transaction = await this.prisma.financeTransaction.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });
    return transaction ? toRecord(transaction) : null;
  }

  async list(filters: ListTransactionsFilters): Promise<{ items: TransactionWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.FinanceTransactionWhereInput = {
      type: filters.type,
      status: filters.status,
      creatorId: filters.creatorId,
      dealId: filters.dealId,
      dueDate:
        filters.dueFrom || filters.dueTo
          ? { gte: filters.dueFrom, lte: filters.dueTo }
          : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.financeTransaction.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.financeTransaction.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }

  async sumTotals(from: Date, to: Date): Promise<FinanceSummaryTotals> {
    const [incomePaid, expensePaid, incomePending, expensePending] = await Promise.all([
      this.prisma.financeTransaction.aggregate({
        _sum: { amountCents: true },
        where: { type: "INCOME", status: "PAID", paidAt: { gte: from, lte: to } },
      }),
      this.prisma.financeTransaction.aggregate({
        _sum: { amountCents: true },
        where: { type: "EXPENSE", status: "PAID", paidAt: { gte: from, lte: to } },
      }),
      this.prisma.financeTransaction.aggregate({
        _sum: { amountCents: true },
        where: { type: "INCOME", status: "PENDING", dueDate: { gte: from, lte: to } },
      }),
      this.prisma.financeTransaction.aggregate({
        _sum: { amountCents: true },
        where: { type: "EXPENSE", status: "PENDING", dueDate: { gte: from, lte: to } },
      }),
    ]);

    return {
      totalIncomePaidCents: incomePaid._sum.amountCents ?? 0,
      totalExpensePaidCents: expensePaid._sum.amountCents ?? 0,
      totalPendingIncomeCents: incomePending._sum.amountCents ?? 0,
      totalPendingExpenseCents: expensePending._sum.amountCents ?? 0,
    };
  }
}
