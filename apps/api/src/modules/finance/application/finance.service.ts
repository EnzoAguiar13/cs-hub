import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { FinanceSummary, TransactionInput, ListTransactionsQuery, UpdateTransactionInput } from "@cs-hub/shared-types";
import {
  FINANCE_REPOSITORY,
  type FinanceRepository,
  type TransactionRecord,
  type TransactionWithCreatorNameRecord,
} from "../domain/finance.repository";
import { canTransitionTransactionStatus } from "../domain/finance.entity";

@Injectable()
export class FinanceService {
  constructor(@Inject(FINANCE_REPOSITORY) private readonly finance: FinanceRepository) {}

  create(input: TransactionInput, actorId: string): Promise<TransactionRecord> {
    return this.finance.create({
      type: input.type,
      description: input.description,
      amountCents: input.amountCents,
      costCenter: input.costCenter ?? null,
      dueDate: new Date(input.dueDate),
      method: input.method ?? null,
      creatorId: input.creatorId ?? null,
      dealId: input.dealId ?? null,
      createdById: actorId,
    });
  }

  async update(id: string, input: UpdateTransactionInput): Promise<TransactionRecord> {
    const existing = await this.finance.findById(id);
    if (!existing) throw new NotFoundException("Lançamento não encontrado");

    if (input.status && !canTransitionTransactionStatus(existing.status, input.status)) {
      throw new BadRequestException(`Transição de status inválida: ${existing.status} -> ${input.status}`);
    }

    // Saldo, fluxo de caixa e relatórios são calculados sob demanda a partir dos lançamentos
    // com status PAID (ver FinanceService.summary) — marcar como pago aqui já é suficiente
    // para refletir automaticamente em todo o resto do módulo, sem sincronização manual.
    const becamePaid = input.status === "PAID" && existing.status !== "PAID";

    return this.finance.update(id, {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      paidAt: becamePaid ? new Date() : undefined,
    });
  }

  async findById(id: string): Promise<TransactionWithCreatorNameRecord> {
    const transaction = await this.finance.findById(id);
    if (!transaction) throw new NotFoundException("Lançamento não encontrado");
    return transaction;
  }

  list(query: ListTransactionsQuery) {
    return this.finance.list({
      ...query,
      dueFrom: query.dueFrom ? new Date(query.dueFrom) : undefined,
      dueTo: query.dueTo ? new Date(query.dueTo) : undefined,
    });
  }

  async summary(from: Date, to: Date): Promise<FinanceSummary> {
    const totals = await this.finance.sumTotals(from, to);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totalIncomePaidCents: totals.totalIncomePaidCents,
      totalExpensePaidCents: totals.totalExpensePaidCents,
      balanceCents: totals.totalIncomePaidCents - totals.totalExpensePaidCents,
      totalPendingIncomeCents: totals.totalPendingIncomeCents,
      totalPendingExpenseCents: totals.totalPendingExpenseCents,
    };
  }
}
